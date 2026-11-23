import {
  typecheckedForProject,
  configs,
} from '@codegena/infr-nx/eslint-config/index.mjs';

export default typecheckedForProject(
  '/packages/graph-search-core',
  configs.rootConfig,
);
