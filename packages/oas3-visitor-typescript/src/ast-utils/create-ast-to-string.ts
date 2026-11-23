import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import { format, type Options as PrettierOptions } from 'prettier';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginMarkdown from 'prettier/plugins/markdown';
import * as prettierPluginTypescript from 'prettier/plugins/typescript';
import {
  createSourceFile,
  EmitHint,
  factory,
  isDeclarationStatement,
  isExportAssignment,
  isExportDeclaration,
  isImportDeclaration,
  isSourceFile,
  ScriptKind,
  ScriptTarget,
  type Node as TsNode,
  type SourceFile,
  type Statement,
} from 'typescript';

import { createPrinterCached } from './create-printer-cached';
import { wrapLongImportDeclarations } from './wrap-long-import-declarations';
import { enrichTypescriptNode } from '../misc-utils/enrich-typescript-node';

type GeneratedCodeFormatOptions = PrettierOptions & {
  jsdocCapitalizeDescription: boolean;
  jsdocCommentLineStrategy: 'multiline';
  jsdocLineWrappingStyle: 'greedy';
  jsdocPrintWidth: number;
  printWidth: number;
  tsdoc: boolean;
};

const prettierOptions: Omit<GeneratedCodeFormatOptions, 'plugins'> & {
  printWidth: number;
} = {
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  jsdocCapitalizeDescription: false,
  jsdocCommentLineStrategy: 'multiline',
  jsdocLineWrappingStyle: 'greedy',
  jsdocPrintWidth: 80,
  parser: 'typescript',
  printWidth: 90,
  quoteProps: 'consistent',
  semi: true,
  singleQuote: true,
  proseWrap: 'always',
  tabWidth: 2,
  trailingComma: 'all',
  tsdoc: true,
  useTabs: false,
};

function isTrailingExport(statement: Statement): boolean {
  return isExportAssignment(statement) || isExportDeclaration(statement);
}

function printSourceFileSections(sourceFile: SourceFile): string {
  const imports = sourceFile.statements.filter(isImportDeclaration);
  const declarations = sourceFile.statements.filter((statement) => (
    !isImportDeclaration(statement) && !isTrailingExport(statement)
  ));
  const trailingExports = sourceFile.statements.filter((item) => isTrailingExport(item));

  const sections = [
    imports,
    ...declarations.map((statement) => [statement]),
    trailingExports,
  ]
    .filter((statements) => statements.length > 0)
    .map((statements) => {
      const section = factory.updateSourceFile(sourceFile, statements);
      const printed = createPrinterCached().printNode(
        EmitHint.Unspecified,
        section,
        sourceFile,
      );

      return printed.trimEnd();
    });

  return sections.join('\n\n');
}

export function createAstToString(
  ast: TsNode,
  relativeFilePath: string,
  transitiveNode?: TransitiveNode,
): () => Promise<string> {
  return async (): Promise<string> => {
    const astToPrint = transitiveNode && !transitiveNode.isInline
      && isDeclarationStatement(ast)
      ? enrichTypescriptNode(ast, transitiveNode)
      : ast;

    if (isSourceFile(astToPrint)) {
      const printedFile = printSourceFileSections(astToPrint);
      const jsdocPlugin = await import('prettier-plugin-jsdoc');
      const formattedFile = await format(printedFile, {
        ...prettierOptions,
        plugins: [
          prettierPluginTypescript,
          prettierPluginEstree,
          prettierPluginMarkdown,
          { ...jsdocPlugin, defaultOptions: { ...jsdocPlugin.defaultOptions } },
        ],
      });

      return wrapLongImportDeclarations(
        formattedFile.trimEnd(),
        prettierOptions.printWidth,
      );
    }

    const sourceFile = createSourceFile(
      relativeFilePath,
      '',
      ScriptTarget.Latest,
      false,
      ScriptKind.TS,
    );

    const printedNode = createPrinterCached().printNode(
      EmitHint.Unspecified,
      astToPrint,
      sourceFile,
    );

    return printedNode;
  };
}
