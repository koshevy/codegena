import {
  typecheckedForProject,
  configs,
} from '@codegena/infr-nx/eslint-config/index.mjs';

export default typecheckedForProject('/packages/util-e2e', configs.rootConfig);
