import kebabCase from 'lodash/kebabCase';
import {
  factory,
  Node as TsNode,
  TypeNode,
} from 'typescript';

import {
  createAstToString,
  createFallbackType,
  extractTransitiveNodeIdentifier,
} from '../../ast-utils';
import { createTypeIdentifierName } from '../../misc-utils';
import { programmingLanguageInfo } from '../../programming-language-info';
import type { TypescriptParserVisitorFn } from '../../typescript-parser-visitor-fn';
import type {
  TypescriptParserVisitorResult,
} from '../../typescript-parser-visitor-result';

export const visitorRef: TypescriptParserVisitorFn = ({
  getAnotherByTransitiveNode,
  logger,
  suggestedName,
  transitiveNode,
}) => {
  const {
    isInline,
    name,
    type,
  } = transitiveNode;

  if (type !== 'reference') {
    return null;
  }

  const mixinResult = transitiveNode.mixin
    ? getAnotherByTransitiveNode({
      ...transitiveNode.mixin,
      // fixme add extended parameter allowing to inlining types from ref
      isInline,
      suggestedName: suggestedName ?? transitiveNode.suggestedName,
    }) as TypescriptParserVisitorResult
    : null;

  if (mixinResult) {
    return mixinResult;
  }

  const refResult: ReturnType<typeof getAnotherByTransitiveNode> | null = (
    transitiveNode.ref
      ? getAnotherByTransitiveNode({
          ...transitiveNode.ref,
          // fixme add extended parameter allowing to inlining types from ref
          isInline: false,
        })
      : null
  );

  let relativeFilePath = refResult && typeof refResult !== 'function'
    ? refResult.relativeFilePath
    : 'unknown.ts';

  const typeNode: TypeNode = refResult
    ? extractTransitiveNodeIdentifier(
        transitiveNode.ref,
        refResult,
        transitiveNode,
      )
    : createFallbackType();
  let ast: TsNode = typeNode;

  if (!isInline) {
    const identifierName = createTypeIdentifierName({
      name,
      suggestedName: suggestedName ?? transitiveNode.suggestedName,
      fallbackNameAspect: 'ObjectType',
      logger,
    });

    relativeFilePath = `${kebabCase(identifierName)}.ts`;
    ast = factory.createTypeAliasDeclaration(
      undefined,
      identifierName,
      undefined,
      typeNode,
    );
  }

  const toString = createAstToString(ast, relativeFilePath);

  return {
    ...programmingLanguageInfo,
    ast,
    getAnotherByTransitiveNode,
    relativeFilePath,
    transitiveNode,
    toString,
  };
};
