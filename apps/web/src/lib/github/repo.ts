import type { BuildFile } from '@ourai/shared';

/**
 * Minimal GitHub REST client (no octokit dep) used server-side to open the Build
 * stage's draft PR with a personal access token. Uses the Git Data API for an
 * atomic multi-file commit. All calls surface GitHub's error body verbatim so a
 * bad token / missing write access / wrong repo is actionable.
 */

const API = 'https://api.github.com';

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'OurAI-build-agent',
  };
}

async function gh<T>(token: string, method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: headers(token),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`github ${method} ${path} failed: ${String(err)}`);
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(
      `github ${method} ${path}: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`,
    );
  }
  return (await res.json()) as T;
}

/** Split "owner/repo" into its parts. */
export function parseRepo(fullName: string): { owner: string; repo: string } {
  const [owner, repo] = fullName.split('/');
  if (!owner || !repo) throw new Error(`invalid repo "${fullName}" (expected owner/repo)`);
  return { owner, repo };
}

/**
 * A shallow list of repo file paths (recursive tree at `ref`, truncated) for
 * prompt context so generated paths fit the real project. Best-effort: returns
 * [] on any error (an empty/large repo shouldn't block a build).
 */
export async function getRepoTree(
  token: string,
  owner: string,
  repo: string,
  ref: string,
  limit = 300,
): Promise<string[]> {
  try {
    const data = await gh<{ tree?: { path: string; type: string }[] }>(
      token,
      'GET',
      `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`,
    );
    return (data.tree ?? [])
      .filter((t) => t.type === 'blob')
      .map((t) => t.path)
      .slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Create a new branch off `base` with a single commit containing `files`
 * (create-or-update, full contents). Returns the new branch + commit sha.
 */
export async function createBranchWithCommit(
  token: string,
  owner: string,
  repo: string,
  base: string,
  branch: string,
  files: BuildFile[],
  message: string,
): Promise<{ branch: string; commitSha: string }> {
  const baseRef = await gh<{ object: { sha: string } }>(
    token,
    'GET',
    `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(base)}`,
  );
  const baseSha = baseRef.object.sha;

  const baseCommit = await gh<{ tree: { sha: string } }>(
    token,
    'GET',
    `/repos/${owner}/${repo}/git/commits/${baseSha}`,
  );

  const tree = await gh<{ sha: string }>(token, 'POST', `/repos/${owner}/${repo}/git/trees`, {
    base_tree: baseCommit.tree.sha,
    tree: files.map((f) => ({ path: f.path, mode: '100644', type: 'blob', content: f.content })),
  });

  const commit = await gh<{ sha: string }>(token, 'POST', `/repos/${owner}/${repo}/git/commits`, {
    message,
    tree: tree.sha,
    parents: [baseSha],
  });

  await gh(token, 'POST', `/repos/${owner}/${repo}/git/refs`, {
    ref: `refs/heads/${branch}`,
    sha: commit.sha,
  });

  return { branch, commitSha: commit.sha };
}

/** Open a pull request; returns its URL and number. */
export async function openPullRequest(
  token: string,
  owner: string,
  repo: string,
  head: string,
  base: string,
  title: string,
  body: string,
  draft = true,
): Promise<{ url: string; number: number }> {
  const pr = await gh<{ html_url: string; number: number }>(
    token,
    'POST',
    `/repos/${owner}/${repo}/pulls`,
    { title, head, base, body, draft },
  );
  return { url: pr.html_url, number: pr.number };
}
