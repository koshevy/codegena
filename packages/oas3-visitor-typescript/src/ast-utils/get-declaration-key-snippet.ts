import {
  isEnumDeclaration,
  isInterfaceDeclaration,
  isModuleDeclaration,
  isTypeAliasDeclaration,
  SyntaxKind,
  type Node as TsNode,
} from 'typescript';

/**
 * Return the declaration prefix that survives source-file formatting.
 */
export function getDeclarationKeySnippet(
  ast: TsNode,
  isInline = false,
): string | undefined {
  if (!isTypeAliasDeclaration(ast)
    && !isInterfaceDeclaration(ast)
    && !isEnumDeclaration(ast)
    && !isModuleDeclaration(ast)
  ) {
    return undefined;
  }

  const hasExportModifier = ast.modifiers?.some(({ kind }) => (
    kind === SyntaxKind.ExportKeyword
  ));
  const isExported = hasExportModifier
    || (!isModuleDeclaration(ast) && !isInline);
  const exportPrefix = isExported ? 'export ' : '';

  if (isTypeAliasDeclaration(ast)) {
    return `${exportPrefix}type ${ast.name.text}`;
  }

  if (isInterfaceDeclaration(ast)) {
    return `${exportPrefix}interface ${ast.name.text}`;
  }

  if (isEnumDeclaration(ast)) {
    return `${exportPrefix}enum ${ast.name.text}`;
  }

  return `${exportPrefix}namespace ${ast.name.text}`;
}
