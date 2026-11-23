import {
  typecheckedForProject,
  configs,
} from '@codegena/infr-nx/eslint-config/index.mjs';

export default typecheckedForProject(
  '/packages/ui-unified',
  configs.rootConfig,
);
