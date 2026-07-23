import base from '@ourai/eslint-config/base';

/** Root flat config. Package- and app-level configs extend the relevant preset. */
export default [
  {
    ignores: ['**/dist/**', '**/.next/**', '**/.turbo/**', '**/node_modules/**', '**/coverage/**'],
  },
  ...base,
];
