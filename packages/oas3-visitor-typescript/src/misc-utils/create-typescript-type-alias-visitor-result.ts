import type { Logger } from '@codegena/oas3-core/logger';
import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import kebabCase from 'lodash/kebabCase';
import type { Node as TsNode, TypeNode } from 'typescript';

import {
  createAstToString,
  createTypeAliasDeclaration,
} from '../ast-utils';
import { programmingLanguageInfo } from '../programming-language-info';
import type {
  TypescriptParserVisitorResult,
} from '../typescript-parser-visitor-result';
import { createTypeIdentifierName } from './create-type-identifier-name';

export interface CreateTypescriptTypeAliasVisitorResultProps {
  fallbackNameAspect: string;
  logger?: Logger;
  suggestedName?: string;
  transitiveNode: TransitiveNode;
  typeNode: TypeNode;
}

export function createTypescriptTypeAliasVisitorResult({
  fallbackNameAspect,
  logger,
  suggestedName,
  transitiveNode,
  typeNode,
}: CreateTypescriptTypeAliasVisitorResultProps): TypescriptParserVisitorResult {
  const identifierName = createTypeIdentifierName({
    name: transitiveNode.name,
    suggestedName: suggestedName ?? transitiveNode.suggestedName,
    fallbackNameAspect,
    logger,
    reserveName: !transitiveNode.isInline,
  });

  const ast: TsNode = transitiveNode.isInline
    ? typeNode
    : createTypeAliasDeclaration(identifierName, typeNode);
  const relativeFilePath = `${kebabCase(identifierName)}.ts`;
  const toString = createAstToString(ast, relativeFilePath);

  return {
    ...programmingLanguageInfo,
    ast,
    identifierName: transitiveNode.isInline ? undefined : identifierName,
    relativeFilePath,
    transitiveNode,
    toString,
  };
}
