import type { ChatMessage } from '@ourai/model-gateway';

/** Mutable state carried across turns of a single agent run. */
export interface TurnState {
  turn: number;
  history: ChatMessage[];
  finished: boolean;
}

export function initialTurnState(): TurnState {
  return { turn: 0, history: [], finished: false };
}
