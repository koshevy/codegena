import { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import {
  factory,
  isDeclarationStatement,
  isIdentifier,
  isTypeAliasDeclaration,
  isTypeNode,
  type TypeNode as TsTypeNode,
} from 'typescript';

import { createTypeIdentifierName } from '../misc-utils/create-type-identifier-name';
import { TypescriptParseError } from '../typescript-parse-error';
import { TypescriptParserVisitorResult } from '../typescript-parser-visitor-result';

type VisitorResultTruthy = TypescriptParserVisitorResult;

/**
 * Creates {@link TypeNode type node} for dest {@link TransitiveNode}
 * @throws TypescriptParseError
 */
export function extractTransitiveNodeIdentifier(
  destTransitiveNode: TransitiveNode,
  visitorResult: VisitorResultTruthy | (() => Promise<VisitorResultTruthy>),
  referrerTransitiveNode?: TransitiveNode,
): TsTypeNode {
  const isPending = typeof visitorResult === 'function';
  const transitiveNodeName = destTransitiveNode.name
    ?? destTransitiveNode.suggestedName;

  if (isPending) {
    if (!transitiveNodeName || destTransitiveNode.isInline) {
      throw new TypescriptParseError(
        'Type refers to a recursive type, but marked as inline or anonymous!',
        referrerTransitiveNode ?? destTransitiveNode,
      );
    }

    const identifierName = createTypeIdentifierName({
      fallbackNameAspect: transitiveNodeName,
      reserveName: false,
    });

    return factory.createTypeReferenceNode(
      identifierName,
      undefined,
    );
  }

  const { ast } = visitorResult;

  if (isTypeAliasDeclaration(ast) && ast.name) {
    return factory.createTypeReferenceNode(
      ast.name,
      undefined,
    );
  }

  if (isDeclarationStatement(ast) && ast.name && isIdentifier(ast.name)) {
    return factory.createTypeReferenceNode(
      ast.name,
      undefined,
    );
  }

  if (!isTypeNode(ast)) {
    throw new TypescriptParseError(
      'Got wrong typescript node! Expected TypeNode.',
      referrerTransitiveNode ?? destTransitiveNode,
    );
  }

  return ast;
}
