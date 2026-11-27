import { factory, SyntaxKind } from 'typescript';

import {
  createConditionalType,
  createKeyConstraint,
  createOas3VisitorResult,
  getOas3TypeNode,
} from './utils';
import type {
  TypescriptParserVisitorFn,
} from '../../typescript-parser-visitor-fn';

export const visitorResponseHeadersRecord: TypescriptParserVisitorFn = (props) => {
  const { getAnotherByTransitiveNode, transitiveNode } = props;

  if (transitiveNode.type !== 'responseHeadersRecord') {
    return null;
  }

  const cases = Object.entries(transitiveNode.headers).map(([key, node]) => ({
    key,
    type: getOas3TypeNode(
      { ...node, isInline: true },
      getAnotherByTransitiveNode,
      transitiveNode,
    ),
  }));

  const typeNode = createConditionalType('TCode', cases);

  return createOas3VisitorResult(
    (identifierName) => factory.createTypeAliasDeclaration(
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      identifierName,
      [factory.createTypeParameterDeclaration(
        undefined,
        'TCode',
        createKeyConstraint(transitiveNode.statuses),
        createKeyConstraint(transitiveNode.statuses),
      )],
      typeNode,
    ),
    transitiveNode,
    'ResponseHeadersRecord',
    props,
  );
};
