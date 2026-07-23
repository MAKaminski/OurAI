import next from '@ourai/eslint-config/next';

export default [
  ...next,
  {
    ignores: ['.next/**', 'next-env.d.ts'],
  },
];
