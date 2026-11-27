import { configs as tsEslintConfigs } from 'typescript-eslint';

import { typescriptFileTypes } from './file-types.mjs';
import rootConfig from './root.config.mjs';

const [, recommendedCheckedOnly] = tsEslintConfigs.recommendedTypeCheckedOnly;
const [, strictTypeCheckedOnly] = tsEslintConfigs.strictTypeCheckedOnly;
const [, stylisticTypeCheckedOnly] = tsEslintConfigs.stylisticTypeCheckedOnly;

/**
 * Creates a typechecked ESLint config for a project's TypeScript files.
 * @param project The path to the project.
 * @param baseConfig The base ESLint config.
 *
 * @example
 * ```mjs
 * // libs/project-name/eslint.config.mjs
 * import { typecheckedForProject } from '@codegena/infr-nx/eslint-config/index.mjs';
 * import baseConfig from '../../eslint.config.mjs';
 *
 * export default typecheckedForProject('/libs/project-name', baseConfig);
 * ```
 */
export function typecheckedForProject(
  project,
  baseConfig = rootConfig,
) {
  return [
    {
      files: typescriptFileTypes,
      languageOptions: {
        parserOptions: {
          project: `${project}/tsconfig.*?.json`,
        },
      },
      rules: {
        ...recommendedCheckedOnly.rules,
        ...strictTypeCheckedOnly.rules,
        ...stylisticTypeCheckedOnly.rules,
      },
    },
    ...baseConfig,
  ];
}
