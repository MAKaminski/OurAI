import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createProvider,
  defaultModelId,
  type ChatMessage,
  type ModelProviderName,
  type TokenUsage,
} from '@ourai/model-gateway';
import { buildAgentOutputSchema, type BuildFile } from '@ourai/shared';
import { stripFence, withModelFallback } from './modelCredential';
import type { PriorContext } from './stageAgent';

const SYSTEM_PROMPT =
  'You are a senior software engineer. Given a product request, its approved ' +
  'KPIs, design, and build tasks, plus the target repository’s file tree, output ' +
  'the concrete file changes that implement the request. Prefer a small, ' +
  'self-contained, reviewable change. Use full file contents for every file you ' +
  'return, and repo-relative paths that fit the existing project structure. ' +
  'Respond with ONLY a JSON object of the form ' +
  '{"summary":string,"files":[{"path":string,"content":string}]} and no prose, ' +
  'markdown, or code fences.';

function userPrompt(
  request: { title: string; body: string | null },
  prior: PriorContext[],
  repoTree: string[],
): string {
  const parts = [
    `Request title: ${request.title}`,
    `Request details:\n${request.body?.trim() || '(none provided)'}`,
  ];
  for (const p of prior) {
    if (p.items.length === 0) continue;
    const lines = p.items.map((i) => `- ${i.title}: ${i.content ?? ''}`.trim());
    parts.push(`Approved ${p.label}:\n${lines.join('\n')}`);
  }
  parts.push(
    repoTree.length
      ? `Repository files (paths):\n${repoTree.join('\n')}`
      : 'Repository files: (empty or unavailable — create sensible new files)',
  );
  return parts.join('\n\n');
}

export interface BuildAgentResult {
  summary: string;
  files: BuildFile[];
  provider: ModelProviderName;
  modelId: string;
  usage: TokenUsage;
}

/**
 * Run the Build agent: turn the approved request + design/plan + repo tree into a
 * set of file changes. Server-side only; never writes to GitHub itself (the store
 * opens the PR). Tries providers in the company's ranked order.
 */
export async function runBuildAgent(
  supabase: SupabaseClient,
  userId: string,
  request: { title: string; body: string | null },
  prior: PriorContext[],
  repoTree: string[],
  order?: readonly string[] | null,
  signal?: AbortSignal,
): Promise<BuildAgentResult> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt(request, prior, repoTree) },
  ];

  return withModelFallback(supabase, userId, order ?? null, async ({ provider, apiKey }) => {
    const modelId = defaultModelId(provider);
    const client = createProvider({ provider, apiKey });
    // Build output can be large; lift the token ceiling for this stage.
    const res = await client.chat({
      model: modelId,
      messages,
      temperature: 0.2,
      maxTokens: 8192,
      signal,
    });

    const raw = res.message.content ?? '';
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(stripFence(raw));
    } catch {
      throw new Error('model did not return valid JSON for the build');
    }
    const parsed = buildAgentOutputSchema.safeParse(parsedJson);
    if (!parsed.success) {
      throw new Error(`model build output failed validation: ${parsed.error.message}`);
    }
    return { ...parsed.data, provider, modelId, usage: res.usage };
  });
}
