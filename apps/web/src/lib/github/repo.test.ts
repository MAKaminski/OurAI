import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBranchWithCommit, getRepoTree, openPullRequest, parseRepo } from './repo';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function bodyOf(mock: ReturnType<typeof vi.fn>, i: number): Record<string, unknown> {
  const init = mock.mock.calls[i]?.[1] as RequestInit | undefined;
  return JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
}

function urlOf(mock: ReturnType<typeof vi.fn>, i: number): string {
  return String(mock.mock.calls[i]?.[0]);
}

afterEach(() => vi.restoreAllMocks());

describe('parseRepo', () => {
  it('splits owner/repo', () => {
    expect(parseRepo('acme/robotics')).toEqual({ owner: 'acme', repo: 'robotics' });
  });
  it('rejects a malformed value', () => {
    expect(() => parseRepo('nope')).toThrow(/owner\/repo/);
  });
});

describe('createBranchWithCommit', () => {
  it('shapes the Git Data API calls (ref → commit → tree → commit → ref)', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ object: { sha: 'basesha' } })) // GET base ref
      .mockResolvedValueOnce(jsonResponse({ tree: { sha: 'basetree' } })) // GET base commit
      .mockResolvedValueOnce(jsonResponse({ sha: 'newtree' })) // POST tree
      .mockResolvedValueOnce(jsonResponse({ sha: 'newcommit' })) // POST commit
      .mockResolvedValueOnce(jsonResponse({ ref: 'refs/heads/ourai/x' })); // POST ref
    vi.stubGlobal('fetch', fetchMock);

    const out = await createBranchWithCommit(
      'tok',
      'acme',
      'robotics',
      'main',
      'ourai/x',
      [{ path: 'src/a.ts', content: 'export const a = 1;' }],
      'OurAI: add a',
    );

    expect(out).toEqual({ branch: 'ourai/x', commitSha: 'newcommit' });
    expect(fetchMock).toHaveBeenCalledTimes(5);
    // tree uses the base tree + inline file content
    const tree = bodyOf(fetchMock, 2);
    expect(tree.base_tree).toBe('basetree');
    expect(tree.tree).toEqual([
      { path: 'src/a.ts', mode: '100644', type: 'blob', content: 'export const a = 1;' },
    ]);
    // commit points at the new tree with the base commit as parent
    const commit = bodyOf(fetchMock, 3);
    expect(commit.tree).toBe('newtree');
    expect(commit.parents).toEqual(['basesha']);
    // ref creates the new branch at the new commit
    const ref = bodyOf(fetchMock, 4);
    expect(ref.ref).toBe('refs/heads/ourai/x');
    expect(ref.sha).toBe('newcommit');
    expect(urlOf(fetchMock, 4)).toContain('/repos/acme/robotics/git/refs');
  });

  it('surfaces a GitHub error (e.g. bad token / no write access)', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'Bad credentials' }, 401));
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      createBranchWithCommit(
        'tok',
        'acme',
        'robotics',
        'main',
        'ourai/x',
        [{ path: 'a', content: 'b' }],
        'msg',
      ),
    ).rejects.toThrow(/401/);
  });
});

describe('openPullRequest', () => {
  it('opens a draft PR and returns url + number', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({ html_url: 'https://github.com/acme/robotics/pull/7', number: 7 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const pr = await openPullRequest('tok', 'acme', 'robotics', 'ourai/x', 'main', 'T', 'B');
    expect(pr).toEqual({ url: 'https://github.com/acme/robotics/pull/7', number: 7 });
    const body = bodyOf(fetchMock, 0);
    expect(body).toMatchObject({
      title: 'T',
      head: 'ourai/x',
      base: 'main',
      body: 'B',
      draft: true,
    });
  });
});

describe('getRepoTree', () => {
  it('returns blob paths, and [] on error (never blocks a build)', async () => {
    const ok = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        tree: [
          { path: 'src/a.ts', type: 'blob' },
          { path: 'src', type: 'tree' },
        ],
      }),
    );
    vi.stubGlobal('fetch', ok);
    expect(await getRepoTree('tok', 'acme', 'robotics', 'main')).toEqual(['src/a.ts']);

    const bad = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'Not Found' }, 404));
    vi.stubGlobal('fetch', bad);
    expect(await getRepoTree('tok', 'acme', 'robotics', 'main')).toEqual([]);
  });
});
