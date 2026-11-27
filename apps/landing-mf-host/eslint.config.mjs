import baseConfig from '@codegena/infr-nx/eslint-config/root.config.mjs';

import { featureImportBoundaries } from './feature-import-boundaries.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    plugins: {
      'landing-mf-host': {
        rules: { 'feature-import-boundaries': featureImportBoundaries },
      },
    },
    rules: { 'landing-mf-host/feature-import-boundaries': 'error' },
  },
];
