import {
  isIdentifier,
  isTypeReferenceNode,
  type TypeNode,
} from 'typescript';

export function filterDirectRecursiveUnionMembers(
  typeName: string,
  memberTypes: TypeNode[],
): TypeNode[] {
  return memberTypes.filter((memberType) => (
    !isDirectRecursiveUnionMember(typeName, memberType)
  ));
}

function isDirectRecursiveUnionMember(
  typeName: string,
  memberType: TypeNode,
): boolean {
  return isTypeReferenceNode(memberType)
    && isIdentifier(memberType.typeName)
    && memberType.typeName.text === typeName
    && !memberType.typeArguments?.length;
}
