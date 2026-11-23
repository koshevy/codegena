import {
  typecheckedForProject,
  configs,
} from '@codegena/infr-nx/eslint-config/index.mjs';

export default typecheckedForProject(
  '/packages/graph-ui',
  configs.rootConfig,
);
