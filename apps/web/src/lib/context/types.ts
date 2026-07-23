export type ContextScope = 'org' | 'user';

export interface ContextCollection {
  id: string;
  name: string;
  position: number;
}

export interface ContextItem {
  id: string;
  collectionId: string | null;
  title: string;
  body: string;
  tags: string[];
  position: number;
  updatedAt: string;
}

export type JobKind = 'organize' | 'sort' | 'ingest';
export type JobStatus = 'queued' | 'running' | 'done' | 'error';

export interface ContextJob {
  id: string;
  kind: JobKind;
  status: JobStatus;
  progress: number;
  detail: string | null;
  createdAt: string;
}
