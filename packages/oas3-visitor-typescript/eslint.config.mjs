import {
  typecheckedForProject,
  configs,
} from '@codegena/infr-nx/eslint-config/index.mjs';

export default typecheckedForProject(
  '/packages/oas3-visitor-typescript',
  configs.rootConfig,
);
