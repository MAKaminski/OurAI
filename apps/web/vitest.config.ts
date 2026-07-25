import { defineConfig } from 'vitest/config';

// Unit tests for pure server-side libs (no Next runtime). Test files live next to
// the code as `*.test.ts`; they are not imported by the app so they never ship.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
