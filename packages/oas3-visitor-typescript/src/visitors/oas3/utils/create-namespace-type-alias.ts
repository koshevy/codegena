import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import {
  factory,
  isTypeAliasDeclaration,
  isTypeReferenceNode,
  SyntaxKind,
  type Statement,
} from 'typescript';

import { extractTransitiveNodeIdentifier } from '../../../ast-utils';
import type { VisitorFnProps } from '../../../typescript-parser-visitor-fn';

export function createNamespaceTypeAlias(
  alias: string,
  node: TransitiveNode | undefined,
  props: VisitorFnProps,
): Statement | null {
  if (!node) {
    return null;
  }

  const result = props.getAnotherByTransitiveNode(node);
  const referencedType = extractTransitiveNodeIdentifier(
    node,
    result,
    props.transitiveNode,
  );

  const typeParameters = (
    typeof result !== 'function' && isTypeAliasDeclaration(result.ast)
      ? result.ast.typeParameters
      : undefined
  );

  const typeArguments = typeParameters?.map((parameter) => (
    factory.createTypeReferenceNode(parameter.name)
  ));

  const typeNode = (
    typeArguments?.length && isTypeReferenceNode(referencedType)
      ? factory.createTypeReferenceNode(
          referencedType.typeName,
          typeArguments,
        )
      : referencedType
  );

  return factory.createTypeAliasDeclaration(
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    alias,
    typeParameters,
    typeNode,
  );
}
