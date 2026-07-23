import globals from 'globals';
import base from './base.js';

/** ESLint preset for Node runtime packages (orchestrator, node libraries). */
export default [
  ...base,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
