import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import kebabCase from 'lodash/kebabCase';
import type { Node as TsNode } from 'typescript';

import { createAstToString } from '../../../ast-utils';
import { createTypeIdentifierName } from '../../../misc-utils';
import { programmingLanguageInfo } from '../../../programming-language-info';
import type { VisitorFnProps } from '../../../typescript-parser-visitor-fn';
import type {
  TypescriptParserVisitorResult,
} from '../../../typescript-parser-visitor-result';

export function createOas3VisitorResult(
  createAst: (identifierName: string) => TsNode,
  transitiveNode: TransitiveNode,
  fallbackNameAspect: string,
  props: Pick<VisitorFnProps, 'logger' | 'suggestedName'>,
): TypescriptParserVisitorResult {
  const identifierName = createTypeIdentifierName({
    fallbackNameAspect,
    logger: props.logger,
    name: transitiveNode.name,
    reserveName: !transitiveNode.isInline,
    suggestedName: props.suggestedName ?? transitiveNode.suggestedName,
  });

  const ast = createAst(identifierName);
  const relativeFilePath = transitiveNode.type === 'openApiDocument'
    ? 'index.ts'
    : `${kebabCase(identifierName)}.ts`;

  return {
    ...programmingLanguageInfo,
    ast,
    identifierName: transitiveNode.isInline ? undefined : identifierName,
    relativeFilePath,
    toString: createAstToString(ast, relativeFilePath, transitiveNode),
    transitiveNode,
  };
}
