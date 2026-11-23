import {
  typecheckedForProject,
  configs,
} from '@codegena/infr-nx/eslint-config/index.mjs';

export default typecheckedForProject(
  '/apps/oas3-visitor-typescript-e2e',
  configs.rootConfig,
);
