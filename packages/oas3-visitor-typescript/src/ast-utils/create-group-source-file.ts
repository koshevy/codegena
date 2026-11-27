import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import {
  createSourceFile,
  factory,
  isDeclarationStatement,
  isImportDeclaration,
  ScriptKind,
  ScriptTarget,
  type SourceFile,
  type Statement,
} from 'typescript';

import { enrichTypescriptNode } from '../misc-utils/enrich-typescript-node';
import type { TypescriptParserVisitorResult } from '../typescript-parser-visitor-result';

export function createGroupSourceFile(
  fileName: string,
  surroundingStatements: Statement[],
  groupedItems: TypescriptParserVisitorResult[],
  precedingDeclarations: Statement[] = [],
): SourceFile {
  const sourceFile = createSourceFile(
    fileName,
    '',
    ScriptTarget.Latest,
    false,
    ScriptKind.TS,
  );

  const documentedNodes = new Set<TransitiveNode>();
  const imports = surroundingStatements.filter(isImportDeclaration);
  const trailingStatements = surroundingStatements.filter((statement) => (
    !isImportDeclaration(statement)
  ));

  const declarations = groupedItems.map((item) => {
    if (!isDeclarationStatement(item.ast)) {
      throw new Error('A grouped TypeScript result must contain a declaration.');
    }

    const documentationNode = item.annotationsSourceNode ?? item.transitiveNode;
    const shouldEnrich = !documentedNodes.has(documentationNode)
      && !item.transitiveNode.isInline;

    documentedNodes.add(documentationNode);

    const declaration = shouldEnrich
      ? enrichTypescriptNode(item.ast, documentationNode)
      : item.ast;

    if (!isDeclarationStatement(declaration)) {
      throw new Error('A grouped TypeScript result must remain a declaration.');
    }

    return declaration;
  });

  return factory.updateSourceFile(sourceFile, [
    ...imports,
    ...precedingDeclarations,
    ...declarations,
    ...trailingStatements,
  ]);
}
