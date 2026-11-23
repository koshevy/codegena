import {
  typecheckedForProject,
  configs,
} from '@codegena/infr-nx/eslint-config/index.mjs';
import playwright from 'eslint-plugin-playwright';

export default [
  ...typecheckedForProject(
    '/apps/ui-unified-e2e',
    configs.rootConfig,
  ),
  playwright.configs['flat/recommended'],
];
