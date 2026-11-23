import {
  configs,
  typecheckedForProject,
} from '@codegena/infr-nx/eslint-config/index.mjs';

export default [
  { ignores: ['.docusaurus/**', 'i18n/**'] },
  ...typecheckedForProject('/apps/documentation-mf-remote', configs.rootConfig),
];
