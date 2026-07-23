import globals from 'globals';
import base from './base.js';

/**
 * ESLint preset for the Next.js web app. Kept minimal (browser + node globals);
 * the app can layer `eslint-config-next` on top once it is wired for real.
 */
export default [
  ...base,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
];
