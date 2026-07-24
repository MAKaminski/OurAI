/**
 * Agnostic connector registry. Each connector declares *how* it authenticates
 * and *what* fields it needs; the UI renders that declaratively and stores the
 * credentials in the shared encrypted secrets vault (via /api/secrets). Adding
 * a new connector to the pack is a single entry here — no new API or UI.
 *
 * MVP auth is api_key / access-token (paste once, encrypted). OAuth-capable
 * providers carry `oauthComingSoon` so the UI can advertise it while still
 * letting users connect with a token today.
 */
export type ConnectorCategory = 'model' | 'source' | 'infra' | 'analytics';
export type ConnectorAuthType = 'api_key' | 'token';

export interface ConnectorField {
  /** Secret key stored in the vault (e.g. DEEPSEEK_API_KEY). */
  key: string;
  label: string;
  placeholder: string;
  sensitive: boolean;
}

export interface Connector {
  id: string;
  name: string;
  /** Matches a TechLogo slug. */
  slug: string;
  category: ConnectorCategory;
  authType: ConnectorAuthType;
  fields: ConnectorField[];
  /** Where the provider shows the user their key/token. */
  getKeyUrl: string;
  /** True when a real OAuth flow is planned but not shipped yet. */
  oauthComingSoon?: boolean;
  blurb: string;
}

export const CATEGORY_LABELS: Record<ConnectorCategory, string> = {
  model: 'Model providers',
  source: 'Source & CI',
  infra: 'Infrastructure',
  analytics: 'Analytics',
};

export const CONNECTORS: Connector[] = [
  // ---- Model providers (bring your own key) ----
  {
    id: 'deepseek',
    name: 'DeepSeek',
    slug: 'deepseek',
    category: 'model',
    authType: 'api_key',
    fields: [{ key: 'DEEPSEEK_API_KEY', label: 'API key', placeholder: 'sk-…', sensitive: true }],
    getKeyUrl: 'https://platform.deepseek.com/api_keys',
    blurb: 'Default model — best cost-to-quality for agentic coding.',
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    slug: 'anthropic',
    category: 'model',
    authType: 'api_key',
    fields: [
      { key: 'ANTHROPIC_API_KEY', label: 'API key', placeholder: 'sk-ant-…', sensitive: true },
    ],
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    blurb: 'Claude for deep reasoning and long-context refactors.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    slug: 'openai',
    category: 'model',
    authType: 'api_key',
    fields: [{ key: 'OPENAI_API_KEY', label: 'API key', placeholder: 'sk-…', sensitive: true }],
    getKeyUrl: 'https://platform.openai.com/api-keys',
    blurb: 'GPT models through the same gateway.',
  },
  {
    id: 'moonshot',
    name: 'Moonshot (Kimi)',
    slug: 'kimi',
    category: 'model',
    authType: 'api_key',
    fields: [{ key: 'MOONSHOT_API_KEY', label: 'API key', placeholder: 'sk-…', sensitive: true }],
    getKeyUrl: 'https://platform.moonshot.ai/console/api-keys',
    blurb: 'Kimi for long-context, cost-efficient runs.',
  },

  // ---- Source & CI ----
  {
    id: 'github',
    name: 'GitHub',
    slug: 'github',
    category: 'source',
    authType: 'token',
    fields: [
      {
        key: 'GITHUB_TOKEN',
        label: 'Personal access token',
        placeholder: 'ghp_… or github_pat_…',
        sensitive: true,
      },
    ],
    getKeyUrl: 'https://github.com/settings/tokens',
    oauthComingSoon: true,
    blurb: 'Branch-per-agent, pull requests, and checks — where your code lives.',
  },

  // ---- Infrastructure ----
  {
    id: 'vercel',
    name: 'Vercel',
    slug: 'vercel',
    category: 'infra',
    authType: 'token',
    fields: [
      { key: 'VERCEL_TOKEN', label: 'Access token', placeholder: 'vercel_…', sensitive: true },
    ],
    getKeyUrl: 'https://vercel.com/account/tokens',
    oauthComingSoon: true,
    blurb: 'Edge hosting with a preview deploy per pull request.',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    slug: 'supabase',
    category: 'infra',
    authType: 'token',
    fields: [
      {
        key: 'SUPABASE_ACCESS_TOKEN',
        label: 'Access token',
        placeholder: 'sbp_…',
        sensitive: true,
      },
    ],
    getKeyUrl: 'https://supabase.com/dashboard/account/tokens',
    oauthComingSoon: true,
    blurb: 'Postgres, auth, and Realtime — your data, isolated per org.',
  },

  // ---- Analytics ----
  {
    id: 'posthog',
    name: 'PostHog',
    slug: 'posthog',
    category: 'analytics',
    authType: 'token',
    fields: [
      {
        key: 'POSTHOG_PERSONAL_API_KEY',
        label: 'Personal API key',
        placeholder: 'phx_…',
        sensitive: true,
      },
    ],
    getKeyUrl: 'https://us.posthog.com/settings/user-api-keys',
    oauthComingSoon: true,
    blurb: 'Funnels, feature flags, and session replay — prove ROI.',
  },
];
