import { defineTool, notImplemented } from '../defineTool.js';

export const githubOpenPrTool = defineTool<
  { branch: string; title: string; body?: string },
  { url: string; number: number }
>({
  name: 'github_open_pr',
  description: 'Open a pull request for an agent branch (GITHUB_MODE=pr).',
  parameters: {
    type: 'object',
    properties: {
      branch: { type: 'string' },
      title: { type: 'string' },
      body: { type: 'string' },
    },
    required: ['branch', 'title'],
  },
  execute: () => notImplemented('github_open_pr', 'Phase 1d'),
});
