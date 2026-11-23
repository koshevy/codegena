import { pascalCaseTypeName } from '@codegena/oas3-core/transitive-utils';
import { posix } from 'pathe';
import {
  factory,
  getSyntheticLeadingComments,
  isInterfaceDeclaration,
  isModuleBlock,
  isModuleDeclaration,
  isTypeAliasDeclaration,
  NodeFlags,
  setSyntheticLeadingComments,
  type SourceFile,
  type Statement,
  SyntaxKind,
} from 'typescript';

import type { BarrelPlan } from './barrel-plan';
import { createGroupSourceFile } from '../../ast-utils/create-group-source-file';
import { getDistinctTagNamespaceNames } from '../../visitors/oas3/utils';
import type { SeparatedGroupPlan } from '../plan-separated-groups';

function getNamespaceName(segment: string): string {
  const name = pascalCaseTypeName(segment);

  return /^[A-Za-z]/.test(segment) ? name : `_${name}`;
}

function reserveImportName(preferredName: string, occupiedNames: Set<string>): string {
  for (let suffix = 1; suffix <= occupiedNames.size + 1; suffix += 1) {
    const name = suffix === 1 ? preferredName : `${preferredName}${suffix}`;

    if (!occupiedNames.has(name)) {
      occupiedNames.add(name);

      return name;
    }
  }

  throw new Error(`Unable to reserve a barrel import name for ${preferredName}.`);
}

function getDirectoryMembers(
  directories: Map<string, Statement[]>,
  path: string[],
): Statement[] {
  let directory = '.';
  let members = directories.get(directory) ?? [];

  for (const segment of path) {
    directory = posix.join(directory, segment);
    members = directories.get(directory) ?? [];
    directories.set(directory, members);
  }

  return members;
}

function renderNamespaceMembers(directories: Map<string, Statement[]>): Statement[] {
  for (const [directory, members] of [...directories].toReversed()) {
    if (directory === '.') {
      continue;
    }

    const name = getNamespaceName(posix.basename(directory));
    const namespace = factory.createModuleDeclaration(
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      factory.createIdentifier(name),
      factory.createModuleBlock(members),
      NodeFlags.Namespace,
    );

    directories.get(posix.dirname(directory))?.push(namespace);
  }

  return directories.get('.') ?? [];
}

export function createDocumentSourceFile(
  { fileName, root, groupedItems }: SeparatedGroupPlan,
  barrels: Pick<BarrelPlan, 'fileName' | 'sourceGroups'>[],
): SourceFile {
  if (!isModuleDeclaration(root.ast)) {
    throw new Error('An OpenAPI document must have a root namespace.');
  }

  const directory = posix.dirname(fileName);
  const directories = new Map<string, Statement[]>([['.', []]]);
  const sources = barrels.map((barrel) => ({
    ...barrel,
    parts: posix.relative(directory, posix.dirname(barrel.fileName)).split('/')
      .filter((part) => part && part !== '..'),
  }));
  const importNames = getDistinctTagNamespaceNames(sources.map((source) => (
    source.parts.length ? source.parts : [posix.parse(source.fileName).name]
  )));
  const occupiedNames = new Set([
    root.ast.name.text,
    ...sources.flatMap(({ parts }) => parts.map((part) => getNamespaceName(part))),
  ]);
  const libraryReferences = new Map<string, { importName: string; path: string }>();
  const imports = sources.map(({ fileName: barrelFile, parts, sourceGroups }, index) => {
    const importName = reserveImportName(`_${importNames[index]}`, occupiedNames);
    const directoryMembers = getDirectoryMembers(directories, parts);
    const namespacePath = parts.map((part) => getNamespaceName(part)).join('.');

    for (const { groupedItems: declarations } of sourceGroups) {
      for (const { ast: declaration, transitiveNode } of declarations) {
        if (!isTypeAliasDeclaration(declaration)
          && !isInterfaceDeclaration(declaration)
        ) {
          continue;
        }

        const reference = factory.createQualifiedName(
          factory.createIdentifier(importName), declaration.name,
        );
        const typeArguments = declaration.typeParameters?.map(({ name }) => (
          factory.createTypeReferenceNode(name)
        ));
        const alias = factory.createTypeAliasDeclaration(
          [factory.createModifier(SyntaxKind.ExportKeyword)],
          declaration.name,
          declaration.typeParameters,
          factory.createTypeReferenceNode(reference, typeArguments),
        );

        directoryMembers.push(alias);

        const [scope, kind] = transitiveNode.source.jsonPath;

        if (scope === 'components' && kind === 'schemas') {
          libraryReferences.set(declaration.name.text, {
            importName,
            path: namespacePath || declaration.name.text,
          });
        }
      }
    }

    const relativePath = posix.relative(directory, barrelFile)
      .replace(/\.(?:ts|tsx|mts|cts)$/, '')
      .replace(/\/index$/, '');
    const modulePath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
    const namespaceImport = factory.createNamespaceImport(
      factory.createIdentifier(importName),
    );

    return factory.createImportDeclaration(
      undefined,
      factory.createImportClause(true, undefined, namespaceImport),
      factory.createStringLiteral(modulePath),
    );
  });

  const statements = renderNamespaceMembers(directories);
  const library = root.openApiLibrary;

  if (library?.body && isModuleBlock(library.body)) {
    const members = library.body.statements.flatMap((member) => {
      if (!isTypeAliasDeclaration(member)) {
        return [];
      }

      const source = libraryReferences.get(member.name.text);

      if (!source) {
        return [];
      }

      const reference = factory.createQualifiedName(
        factory.createIdentifier(source.importName), member.name,
      );

      return [factory.updateTypeAliasDeclaration(
        member, member.modifiers, member.name, member.typeParameters,
        factory.createTypeReferenceNode(reference),
      )];
    });

    const updatedLibrary = factory.updateModuleDeclaration(
      library, library.modifiers, library.name, factory.createModuleBlock(members),
    );
    const firstMember = members[0];
    const link = firstMember && libraryReferences.get(firstMember.name.text)?.path;

    if (link) {
      const comments = getSyntheticLeadingComments(library)?.map((comment) => ({
        ...comment,
        text: comment.text.replace(/\{@link [^}]+\}/, `{@link ${link}}`),
      }));

      setSyntheticLeadingComments(updatedLibrary, comments);
    }

    statements.push(updatedLibrary);
  }

  const ast = factory.updateModuleDeclaration(
    root.ast, root.ast.modifiers, root.ast.name, factory.createModuleBlock(statements),
  );
  const items = groupedItems.map((item) => (item === root ? { ...item, ast } : item));
  const defaultNamespace = factory.createExportSpecifier(false, ast.name, 'default');
  const defaultExport = factory.createExportDeclaration(
    undefined,
    true,
    factory.createNamedExports([defaultNamespace]),
  );

  return createGroupSourceFile(fileName, [...imports, defaultExport], items);
}
