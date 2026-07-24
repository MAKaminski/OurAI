import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createProvider,
  defaultModelId,
  type ChatMessage,
  type ModelProviderName,
  type TokenUsage,
} from '@ourai/model-gateway';
import { stageAgentOutputSchema, type ArtifactStage, type StageArtifactInput } from '@ourai/shared';
import { stripFence, withModelFallback } from './modelCredential';

/** Per-stage instruction: what the agent produces and the shape of each item. */
const STAGE_PROMPT: Record<ArtifactStage, string> = {
  design:
    'You are a senior product designer/architect. Produce a concise design brief ' +
    'as 3–6 items — each a design decision or component with a short title and a ' +
    'paragraph describing the approach, key screens/flows, and data involved.',
  build:
    'You are a staff engineer. Produce an implementation plan as 4–8 build tasks — ' +
    'each with a short title and a paragraph describing the work, the files/modules ' +
    'likely touched, and acceptance criteria. Order them so they can be executed ' +
    'top to bottom.',
  qa:
    'You are a QA lead. Produce a test plan as 4–8 test cases — each with a short ' +
    'title and a paragraph giving the scenario, steps, and expected result. Cover ' +
    'happy paths, edge cases, and regressions.',
  staging:
    'You are a release manager. Produce a go-live checklist as 4–8 items — each with ' +
    'a short title and a paragraph describing the pre-deploy/verification step, owner, ' +
    'and rollback consideration.',
};

const OUTPUT_CONTRACT =
  'Respond with ONLY a JSON object of the form ' +
  '{"items":[{"title":string,"content":string}]} and no prose, markdown, or code fences.';

export interface PriorContext {
  /** e.g. "KPIs", "Design" — labels the block for the model. */
  label: string;
  items: { title: string; content: string | null }[];
}

function contextBlock(request: { title: string; body: string | null }, prior: PriorContext[]) {
  const parts = [
    `Request title: ${request.title}`,
    `Request details:\n${request.body?.trim() || '(none provided)'}`,
  ];
  for (const p of prior) {
    if (p.items.length === 0) continue;
    const lines = p.items.map((i) => `- ${i.title}: ${i.content ?? ''}`.trim());
    parts.push(`Approved ${p.label} from earlier stages:\n${lines.join('\n')}`);
  }
  return parts.join('\n\n');
}

export interface StageAgentResult {
  items: StageArtifactInput[];
  provider: ModelProviderName;
  modelId: string;
  usage: TokenUsage;
}

/**
 * Run an artifact-producing stage agent (design/build/qa/staging). Same shape as
 * the KPI agent: resolve a vault key, call the gateway, parse strict JSON into
 * validated items. Prior approved stage outputs are threaded in as context so
 * each stage builds on the last. Never persists — the caller (store) writes rows.
 */
export async function runStageAgent(
  supabase: SupabaseClient,
  userId: string,
  stage: ArtifactStage,
  request: { title: string; body: string | null },
  prior: PriorContext[],
  signal?: AbortSignal,
): Promise<StageAgentResult> {
  const messages: ChatMessage[] = [
    { role: 'system', content: `${STAGE_PROMPT[stage]} ${OUTPUT_CONTRACT}` },
    { role: 'user', content: contextBlock(request, prior) },
  ];

  // Try each configured provider in order (fallback on a dead/errored key).
  return withModelFallback(supabase, userId, async ({ provider, apiKey }) => {
    const modelId = defaultModelId(provider);
    const client = createProvider({ provider, apiKey });
    const res = await client.chat({ model: modelId, messages, temperature: 0.4, signal });

    const raw = res.message.content ?? '';
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(stripFence(raw));
    } catch {
      throw new Error(`model did not return valid JSON for the ${stage} stage`);
    }
    const parsed = stageAgentOutputSchema.safeParse(parsedJson);
    if (!parsed.success) {
      throw new Error(`model ${stage} output failed validation: ${parsed.error.message}`);
    }
    return { items: parsed.data.items, provider, modelId, usage: res.usage };
  });
}
