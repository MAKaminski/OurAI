import type { LoopEvent } from '@ourai/agent-core';
import type { PersistenceAdapter } from '@ourai/persistence';
import type { NewEvent, SessionId, UserId } from '@ourai/shared';

/**
 * Bridges agent-core's LoopEvents to the durable append-only transcript. This
 * keeps agent-core persistence-agnostic (no dependency on @ourai/persistence)
 * while every step still reaches the shared log.
 */
export class EventSink {
  constructor(
    private readonly persistence: PersistenceAdapter,
    private readonly sessionId: SessionId,
    private readonly agentId: UserId | null = null,
  ) {}

  /** Translate one LoopEvent into a durable Event row. */
  async emit(event: LoopEvent): Promise<void> {
    const base = {
      sessionId: this.sessionId,
      authorType: 'agent' as const,
      authorId: this.agentId,
    };
    let newEvent: NewEvent;
    switch (event.type) {
      case 'message':
        newEvent = {
          ...base,
          kind: 'message',
          payload: { role: 'assistant', content: event.message.content ?? '' },
        };
        break;
      case 'tool_call':
        newEvent = {
          ...base,
          kind: 'tool_call',
          payload: { toolName: event.name, callId: event.callId, args: event.args },
        };
        break;
      case 'tool_result':
        newEvent = {
          ...base,
          kind: 'tool_result',
          payload: {
            callId: event.callId,
            ok: event.ok,
            result: event.result,
            error: event.error,
          },
        };
        break;
      case 'status':
        newEvent = {
          ...base,
          kind: 'status',
          payload: { status: 'running', detail: event.detail ?? event.status },
        };
        break;
      default: {
        const exhaustive: never = event;
        throw new Error(`unhandled loop event: ${JSON.stringify(exhaustive)}`);
      }
    }
    await this.persistence.appendEvent(newEvent);
  }
}
