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

export const visitorRequestRecord: TypescriptParserVisitorFn = (props) => {
  const { getAnotherByTransitiveNode, transitiveNode } = props;

  if (transitiveNode.type !== 'requestRecord') {
    return null;
  }

  const contentEntries = Object.entries(
    transitiveNode.content?.subTypes ?? {},
  ).filter((entry) => entry[1] !== undefined);

  const mediaTypes = contentEntries.map(([mediaType]) => mediaType);
  const contentCases = contentEntries.map(([key, node]) => ({
    key,
    type: getOas3TypeNode(
      node,
      getAnotherByTransitiveNode,
      transitiveNode,
    ),
  }));

  const typeNode = contentCases.length
    ? createConditionalType(
        'TContentType',
        contentCases,
        factory.createKeywordTypeNode(SyntaxKind.NeverKeyword),
      )
    : factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);

  const typeParameters = mediaTypes.length
    ? [factory.createTypeParameterDeclaration(
        undefined,
        'TContentType',
        createKeyConstraint(mediaTypes),
        createKeyConstraint(mediaTypes),
      )]
    : undefined;

  return createOas3VisitorResult(
    (identifierName) => transitiveNode.isInline
      ? typeNode
      : factory.createTypeAliasDeclaration(
          undefined,
          identifierName,
          typeParameters,
          typeNode,
        ),
    transitiveNode,
    'RequestRecord',
    props,
  );
};
