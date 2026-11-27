import {
  typecheckedForProject,
  configs,
} from '@codegena/infr-nx/eslint-config/index.mjs';

export default typecheckedForProject('/packages/util-dev-mode', configs.rootConfig);
