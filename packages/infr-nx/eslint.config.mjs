import {
  typecheckedForProject,
  configs,
} from '@codegena/infr-nx/eslint-config/index.mjs';

export default [
  ...typecheckedForProject(
    '/packages/infr-nx',
    configs.pluginConfig,
  ),
  {
    files: ['**/package.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          // ESLint is the host peer; Nx's flat configs load the plugins indirectly.
          ignoredDependencies: [
            'eslint',
            'eslint-plugin-import',
            'eslint-plugin-jsx-a11y',
            'eslint-plugin-react',
            'eslint-plugin-react-hooks',
            'stylelint',
          ],
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
        },
      ],
    },
  },
];
