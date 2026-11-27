import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import {
  addSyntheticLeadingComment,
  factory,
  setSyntheticLeadingComments,
  SyntaxKind,
  type Node as TsNode,
} from 'typescript';

import { createTsDocComment } from './create-ts-doc-comment';

export function addTransitiveNodeComment<T extends TsNode>(
  ast: T,
  transitiveNode: TransitiveNode,
): T {
  const comment = createTsDocComment(transitiveNode);

  if (!comment) {
    return ast;
  }

  // Cloning prevents a later render from accumulating comments on shared AST.
  const cloneableFactory = factory as typeof factory & {
    cloneNode<TNode extends TsNode>(node: TNode): TNode;
  };
  const commentedAst = cloneableFactory.cloneNode(ast);

  setSyntheticLeadingComments(commentedAst, []);

  return addSyntheticLeadingComment(
    commentedAst,
    SyntaxKind.MultiLineCommentTrivia,
    comment,
    true,
  );
}
