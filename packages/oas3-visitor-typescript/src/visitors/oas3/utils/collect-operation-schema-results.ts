import type { Node as TsNode } from 'typescript';

import type {
  TypescriptParserVisitorResult,
} from '../../../typescript-parser-visitor-result';

export interface OperationSchemaDependency {
  name: string;
  result: TypescriptParserVisitorResult;
}

/**
 * Finds named component schemas reached by an operation's declarations.
 */
export function collectOperationSchemaResults(
  results: TypescriptParserVisitorResult[],
): OperationSchemaDependency[] {
  const visited = new Set<TsNode>();
  const schemas = new Map<string, OperationSchemaDependency>();

  function visit(result: TypescriptParserVisitorResult): void {
    if (visited.has(result.ast)) {
      return;
    }

    visited.add(result.ast);

    const [scope, kind] = result.transitiveNode.source.jsonPath;
    const name = result.identifierName;

    if (scope === 'components'
      && kind === 'schemas'
      && name
      && !result.transitiveNode.isInline
    ) {
      schemas.set(name, { name, result });
    }

    result.dependencies?.forEach((dependency) => {
      if (typeof dependency !== 'function') {
        visit(dependency);
      }
    });
  }

  results.forEach((item) => visit(item));

  return [...schemas.values()];
}
