import type { ChatMessage } from '@ourai/model-gateway';

export interface PromptInput {
  systemPrompt: string;
  task: string;
  history: ChatMessage[];
}

/** Assemble the message array for a turn (system + history + task). */
export function assembleMessages(_input: PromptInput): ChatMessage[] {
  throw new Error('assembleMessages: not implemented (Phase 1b)');
}
