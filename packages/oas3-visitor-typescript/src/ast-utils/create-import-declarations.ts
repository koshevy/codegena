import type {
  AnotherTransitiveNodeParsingResult,
} from '@codegena/oas3-core/ultimate-parser';
import { posix } from 'pathe';
import {
  factory,
  isDeclarationStatement,
  isIdentifier,
  isModuleDeclaration,
  type ImportDeclaration,
  type Node as TsNode,
} from 'typescript';

import { isTypeOnlyNamespace } from './is-type-only-namespace';
import type { TypescriptParserVisitorResult } from '../typescript-parser-visitor-result';

type Dependency = AnotherTransitiveNodeParsingResult<TsNode>;

export async function createImportDeclarations(
  result: TypescriptParserVisitorResult,
  getFilePath: (result: TypescriptParserVisitorResult) => string,
): Promise<ImportDeclaration[]> {
  const groupedResults = await Promise.all(
    (result.shouldBeGroupedWith ?? []).map((item) => resolveDependency(item)),
  );

  const groupedDependencies = new Set(result.shouldBeGroupedWith);
  const groupedAstNodes = new Set(groupedResults.map((group) => group.ast));
  const visitedDependencies = new Set<Dependency>();
  const namesByModule = new Map<string, Map<string, {
    alias?: string;
    isTypeOnly: boolean;
  }>>();
  const currentFilePath = posix.normalize(getFilePath(result));

  async function collectDependency(dependency: Dependency): Promise<void> {
    if (groupedDependencies.has(dependency) || visitedDependencies.has(dependency)) {
      return;
    }

    visitedDependencies.add(dependency);

    const resolved = await resolveDependency(dependency);

    if (groupedAstNodes.has(resolved.ast)) {
      return;
    }

    const { ast } = resolved;

    if (resolved.transitiveNode.isInline
      || !isDeclarationStatement(ast)
      || !ast.name
      || !isIdentifier(ast.name)
    ) {
      const childDependencies = resolved.dependencies ?? [];

      for (const child of childDependencies) {
        await collectDependency(child);
      }

      return;
    }

    const dependencyFilePath = posix.normalize(getFilePath(resolved));

    if (dependencyFilePath === currentFilePath) {
      return;
    }

    const relativeFilePath = posix.relative(
      posix.dirname(currentFilePath),
      dependencyFilePath,
    );

    const modulePathWithoutTypeScriptExtension = relativeFilePath.replace(
      /\.(?:ts|tsx|mts|cts)$/,
      '',
    );

    const modulePathWithoutIndex = modulePathWithoutTypeScriptExtension.replace(
      /\/index$/,
      '',
    );

    const modulePath = modulePathWithoutIndex.startsWith('.')
      ? modulePathWithoutIndex
      : `./${modulePathWithoutIndex}`;

    const isTypeOnlyDependency = !isModuleDeclaration(ast) || isTypeOnlyNamespace(ast);
    const names = namesByModule.get(modulePath) ?? new Map();

    names.set(ast.name.text, {
      alias: result.importAliases?.[ast.name.text],
      isTypeOnly: isTypeOnlyDependency,
    });
    namesByModule.set(modulePath, names);
  }

  const dependencies = result.dependencies ?? [];

  for (const dependency of dependencies) {
    await collectDependency(dependency);
  }

  return [...namesByModule.entries()].map(([modulePath, names]) => {
    const isTypeOnlyImport = names.values().every(({ isTypeOnly }) => (
      isTypeOnly
    ));

    const specifiers = [...names].map(([name, { alias, isTypeOnly }]) => (
      factory.createImportSpecifier(
        !isTypeOnlyImport && isTypeOnly,
        alias ? factory.createIdentifier(name) : undefined,
        factory.createIdentifier(alias ?? name),
      )
    ));
    const namedImports = factory.createNamedImports(specifiers);
    const importClause = factory.createImportClause(
      isTypeOnlyImport,
      undefined,
      namedImports,
    );

    return factory.createImportDeclaration(
      undefined,
      importClause,
      factory.createStringLiteral(modulePath),
    );
  });
}

async function resolveDependency(
  dependency: Dependency,
): Promise<TypescriptParserVisitorResult> {
  return typeof dependency === 'function' ? dependency() : dependency;
}
