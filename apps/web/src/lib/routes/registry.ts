/**
 * Typed registry of the app's user-facing routes — the single source of truth
 * for surfaces that list where you can go: the human `/sitemap` page and the
 * XML `sitemap.ts`. Add a route here once instead of hand-maintaining several
 * lists that drift apart.
 */
export type RouteGroup = 'Marketing' | 'Product' | 'Account' | 'Workspace';
export type RouteAuth = 'public' | 'session';

export interface RouteDef {
  path: string;
  label: string;
  group: RouteGroup;
  auth: RouteAuth;
  description?: string;
}

/** Group render order for surfaces that section routes by `group`. */
export const ROUTE_GROUP_ORDER: RouteGroup[] = ['Marketing', 'Product', 'Account', 'Workspace'];

export const ROUTES: RouteDef[] = [
  // ---- Marketing (public) ----
  {
    path: '/',
    label: 'Home',
    group: 'Marketing',
    auth: 'public',
    description: 'The multiplayer AI workspace — from idea to shipped.',
  },
  {
    path: '/integrations',
    label: 'Integrations',
    group: 'Marketing',
    auth: 'public',
    description: 'Bring-your-own-key model providers plus the services your team already trusts.',
  },
  {
    path: '/compare',
    label: 'Compare',
    group: 'Marketing',
    auth: 'public',
    description: 'How OurAI stacks up against other AI coding tools.',
  },
  {
    path: '/tech',
    label: 'Tech stack',
    group: 'Marketing',
    auth: 'public',
    description: 'The open stack OurAI is built on.',
  },
  {
    path: '/contact',
    label: 'Contact',
    group: 'Marketing',
    auth: 'public',
    description: 'Get in touch with the team.',
  },
  {
    path: '/sitemap',
    label: 'Sitemap',
    group: 'Marketing',
    auth: 'public',
    description: 'Every page on the site.',
  },

  // ---- Product (public) ----
  {
    path: '/products',
    label: 'Products overview',
    group: 'Product',
    auth: 'public',
    description: 'What OurAI does across shipping and marketing.',
  },
  {
    path: '/products/shipping',
    label: 'Software shipping',
    group: 'Product',
    auth: 'public',
    description: 'Parallel AI agents ship software over one repo.',
  },
  {
    path: '/products/marketing',
    label: 'Marketing coordination',
    group: 'Product',
    auth: 'public',
    description: 'Couple marketing to shipping in one live room.',
  },

  // ---- Account ----
  {
    path: '/login',
    label: 'Sign in / sign up',
    group: 'Account',
    auth: 'public',
    description: 'Magic-link sign in to your workspace.',
  },
  {
    path: '/account',
    label: 'Account',
    group: 'Account',
    auth: 'session',
    description: 'Manage your profile and organization.',
  },
  {
    path: '/connections',
    label: 'Connections',
    group: 'Account',
    auth: 'session',
    description: 'Connect model providers and services with your own keys.',
  },

  // ---- Workspace (session) ----
  {
    path: '/dashboard',
    label: 'Dashboard',
    group: 'Workspace',
    auth: 'session',
    description: 'Your workspace overview.',
  },
  {
    path: '/chat',
    label: 'Chat',
    group: 'Workspace',
    auth: 'session',
    description: 'Talk to the AI to refine ideas into requirements.',
  },
  {
    path: '/companies',
    label: 'Companies',
    group: 'Workspace',
    auth: 'session',
    description: 'Your companies and their live sessions.',
  },
  {
    path: '/companies/new',
    label: 'New company',
    group: 'Workspace',
    auth: 'session',
    description: 'Spin up a new company workspace.',
  },
  {
    path: '/context',
    label: 'Context',
    group: 'Workspace',
    auth: 'session',
    description: 'The shared context your agents build against.',
  },
  {
    path: '/learn',
    label: 'Learn',
    group: 'Workspace',
    auth: 'session',
    description: 'Guides for getting the most out of OurAI.',
  },
];

/** Only the publicly reachable routes — used to build the XML sitemap. */
export function publicRoutes(): RouteDef[] {
  return ROUTES.filter((r) => r.auth === 'public');
}
