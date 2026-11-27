const createRollupConfig = require(
  '@codegena/infr-nx/rollup/create-unified-rollup-config.cjs',
);

const config = createRollupConfig({
  additionalExports: [
    'assets/service-worker.esm.js',
    'assets/service-worker-companion.esm.js',
  ],
  externalPackages: ['hono', '@hono/service-worker', 'react', 'zod'],
});

module.exports = {
  ...config,
  input: {
    ...config.input,
    'assets/service-worker': 'service-worker/worker.ts',
    'assets/service-worker-companion': 'service-worker/companion/worker.ts',
  },
};
