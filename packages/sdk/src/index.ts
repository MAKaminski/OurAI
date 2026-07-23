import type { Company, Idea, WorkItem, Event, SessionId } from '@ourai/shared';

/**
 * OurAI public client SDK (Apache-2.0). A thin, permissively-licensed wrapper
 * over the OurAI API so third parties can build on the shared-transcript
 * primitive. Scaffold status: surface defined, transport lands post Phase 1.
 */
export interface OurAIClientConfig {
  baseUrl: string;
  apiKey: string;
}

export class OurAIClient {
  constructor(private readonly config: OurAIClientConfig) {}

  /** Base URL this client targets. */
  get baseUrl(): string {
    return this.config.baseUrl;
  }

  listCompanies(): Promise<Company[]> {
    throw new Error('OurAIClient.listCompanies: not implemented');
  }
  listIdeas(_companyId: string): Promise<Idea[]> {
    throw new Error('OurAIClient.listIdeas: not implemented');
  }
  listWorkItems(_companyId: string): Promise<WorkItem[]> {
    throw new Error('OurAIClient.listWorkItems: not implemented');
  }
  /** Stream the live transcript for a session. */
  streamEvents(_sessionId: SessionId, _onEvent: (event: Event) => void): () => void {
    throw new Error('OurAIClient.streamEvents: not implemented');
  }
}

export type { Company, Idea, WorkItem, Event } from '@ourai/shared';
