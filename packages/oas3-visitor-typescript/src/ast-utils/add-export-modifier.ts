import {
  factory,
  isEnumDeclaration,
  isInterfaceDeclaration,
  isTypeAliasDeclaration,
  SyntaxKind,
  type Node as TsNode,
} from 'typescript';

export function addExportModifier(ast: TsNode): TsNode {
  if (!isTypeAliasDeclaration(ast)
    && !isInterfaceDeclaration(ast)
    && !isEnumDeclaration(ast)
  ) {
    return ast;
  }

  if (ast.modifiers?.some((modifier) => modifier.kind === SyntaxKind.ExportKeyword)) {
    return ast;
  }

  const modifiers = [
    factory.createModifier(SyntaxKind.ExportKeyword),
    ...ast.modifiers ?? [],
  ];

  if (isTypeAliasDeclaration(ast)) {
    return factory.updateTypeAliasDeclaration(
      ast,
      modifiers,
      ast.name,
      ast.typeParameters,
      ast.type,
    );
  }

  if (isInterfaceDeclaration(ast)) {
    return factory.updateInterfaceDeclaration(
      ast,
      modifiers,
      ast.name,
      ast.typeParameters,
      ast.heritageClauses,
      ast.members,
    );
  }

  return factory.updateEnumDeclaration(
    ast,
    modifiers,
    ast.name,
    ast.members,
  );
}
