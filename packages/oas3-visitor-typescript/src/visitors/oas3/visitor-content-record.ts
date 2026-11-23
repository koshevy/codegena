import { factory, SyntaxKind } from 'typescript';

import { createOas3VisitorResult, getOas3TypeNode } from './utils';
import type {
  TypescriptParserVisitorFn,
} from '../../typescript-parser-visitor-fn';

export const visitorContentRecord: TypescriptParserVisitorFn = (props) => {
  const { getAnotherByTransitiveNode, transitiveNode } = props;

  if (transitiveNode.type !== 'contentTypeRecord'
    && transitiveNode.type !== 'responseContentRecord'
  ) {
    return null;
  }

  const types = Object.values(transitiveNode.subTypes)
    .filter((node) => node !== undefined)
    .map((node) => getOas3TypeNode(
      node,
      getAnotherByTransitiveNode,
      transitiveNode,
    ));

  const typeNode = types.length > 1
    ? factory.createUnionTypeNode(types)
    : types[0] ?? factory.createKeywordTypeNode(SyntaxKind.UnknownKeyword);

  return createOas3VisitorResult(
    () => typeNode,
    { ...transitiveNode, isInline: true },
    'ContentRecord',
    props,
  );
};
