/* eslint-disable max-len -- The generated import and declaration are asserted verbatim. */
import { createSourceFile, ScriptKind, ScriptTarget } from 'typescript';

import { createAstToString } from './create-ast-to-string';

describe('createAstToString', () => {
  it('should format a complete file and wrap long named imports', async () => {
    const sourceText = [
      `import type { PathParametersActionsAddCustomLabelsToSelfHostedRunnerForOrg } from './path-parameters-actions-add-custom-labels-to-self-hosted-runner-for-org';`,
      'export type Result = PathParametersActionsAddCustomLabelsToSelfHostedRunnerForOrg;',
    ].join('\n');

    const sourceFile = createSourceFile(
      'result.ts',
      sourceText,
      ScriptTarget.Latest,
      false,
      ScriptKind.TS,
    );

    expect(await createAstToString(sourceFile, 'result.ts')()).toBe(`import type {
  PathParametersActionsAddCustomLabelsToSelfHostedRunnerForOrg,
} from './path-parameters-actions-add-custom-labels-to-self-hosted-runner-for-org';

export type Result = PathParametersActionsAddCustomLabelsToSelfHostedRunnerForOrg;`);
  });

  it('should wrap the module path when it exceeds the configured width', async () => {
    const sourceText = [
      `import type { QueryParametersCodespacesListDevcontainersInRepositoryForAuthenticatedUser } from './query-parameters-codespaces-list-devcontainers-in-repository-for-authenticated-user';`,
      'export type Result = QueryParametersCodespacesListDevcontainersInRepositoryForAuthenticatedUser;',
    ].join('\n');

    const sourceFile = createSourceFile(
      'result.ts',
      sourceText,
      ScriptTarget.Latest,
      false,
      ScriptKind.TS,
    );

    expect(await createAstToString(sourceFile, 'result.ts')()).toBe(`import type {
  QueryParametersCodespacesListDevcontainersInRepositoryForAuthenticatedUser,
} from
  './query-parameters-codespaces-list-devcontainers-in-repository-for-authenticated-user';

export type Result =
  QueryParametersCodespacesListDevcontainersInRepositoryForAuthenticatedUser;`);
  });
});
