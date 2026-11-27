import {
  factory,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

import {
  createConditionalType,
  createKeyConstraint,
  createOas3VisitorResult,
  getOas3TypeNode,
} from './utils';
import type {
  TypescriptParserVisitorFn,
} from '../../typescript-parser-visitor-fn';

export const visitorResponseRecord: TypescriptParserVisitorFn = (props) => {
  const { getAnotherByTransitiveNode, transitiveNode } = props;

  if (transitiveNode.type !== 'responseRecord') {
    return null;
  }

  const contentByStatus = transitiveNode.content?.subTypes ?? {};
  const statuses = [
    ...new Set([
      ...Object.keys(contentByStatus),
      ...Object.keys(transitiveNode.headers ?? {}),
    ]),
  ];

  const mediaTypes = [
    ...new Set(Object.values(contentByStatus).flatMap((content) => (
      content ? Object.keys(content.subTypes) : []
    ))),
  ];

  const statusCases = statuses.map((status) => {
    const content = contentByStatus[status];
    const mediaCases = Object.entries(content?.subTypes ?? {})
      .filter((entry) => entry[1] !== undefined)
      .map(([key, node]) => ({
        key,
        type: getOas3TypeNode(
          node,
          getAnotherByTransitiveNode,
          transitiveNode,
        ),
      }));

    const type: TypeNode = mediaCases.length
      ? createConditionalType(
          'TContentType',
          mediaCases,
          factory.createKeywordTypeNode(SyntaxKind.NeverKeyword),
        )
      : factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);

    return { key: status, type };
  });

  const typeNode = statusCases.length
    ? createConditionalType('TCode', statusCases)
    : factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);

  const typeParameters = [
    ...(statuses.length
      ? [factory.createTypeParameterDeclaration(
          undefined,
          'TCode',
          createKeyConstraint(statuses),
          createKeyConstraint(statuses),
        )]
      : []),
    ...(mediaTypes.length
      ? [factory.createTypeParameterDeclaration(
          undefined,
          'TContentType',
          createKeyConstraint(mediaTypes),
          createKeyConstraint(mediaTypes),
        )]
      : []),
  ];

  return createOas3VisitorResult(
    (identifierName) => transitiveNode.isInline
      ? typeNode
      : factory.createTypeAliasDeclaration(
          undefined,
          identifierName,
          typeParameters.length ? typeParameters : undefined,
          typeNode,
        ),
    transitiveNode,
    'ResponseRecord',
    props,
  );
};
