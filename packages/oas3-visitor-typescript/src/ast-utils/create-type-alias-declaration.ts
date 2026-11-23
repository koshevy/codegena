import {
  factory,
  type TypeAliasDeclaration,
  type TypeNode,
} from 'typescript';

export function createTypeAliasDeclaration(
  typeName: string,
  typeNode: TypeNode,
): TypeAliasDeclaration {
  return factory.createTypeAliasDeclaration(
    undefined,
    factory.createIdentifier(typeName),
    undefined,
    typeNode,
  );
}
