import { pascalCaseTypeName } from '@codegena/oas3-core/transitive-utils';
import groupBy from 'lodash/groupBy';
import {
  factory,
  isModuleBlock,
  isModuleDeclaration,
  NodeFlags,
  SyntaxKind,
} from 'typescript';

import {
  createOas3VisitorResult,
  collectOperationSchemaResults,
  createLibNamespace,
  createLibTypeReference,
  createOperationNamespaceAlias,
  getDistinctTagNamespaceNames,
} from './utils';
import type {
  TypescriptParserVisitorFn,
} from '../../typescript-parser-visitor-fn';

export const visitorOpenApiDocument: TypescriptParserVisitorFn = (props) => {
  const { getAnotherByTransitiveNode, transitiveNode } = props;

  if (transitiveNode.type !== 'openApiDocument') {
    return null;
  }

  const entries = transitiveNode.entrypoints.map((entrypoint) => {
    const result = getAnotherByTransitiveNode(entrypoint);

    if (typeof result === 'function' || !result.identifierName
      || !isModuleDeclaration(result.ast)
    ) {
      throw new Error('An OpenAPI operation must have a namespace name.');
    }

    const sourceTagPath = entrypoint.tags?.flatMap((tag) => (
      tag.split(/[/.]/).filter(Boolean)
    )) ?? [];

    const operationDomain = entrypoint.operationId
      ?.split('/')
      .slice(0, -1)
      .join('/');

    const tagPath = [
      ...sourceTagPath,
      ...(operationDomain ? [operationDomain] : []),
    ];

    return {
      entrypoint,
      operation: result.ast,
      schemas: collectOperationSchemaResults([result]),
      tagPath,
    };
  });

  const entriesByTag = groupBy(entries, ({ tagPath }) => (
    tagPath.join('/')
  ));
  const tagKeys = Object.keys(entriesByTag);
  const namespaceNames = getDistinctTagNamespaceNames(tagKeys.map((tagKey) => (
    tagKey.split('/').filter(Boolean)
  )));

  const tagGroups = Object.entries(entriesByTag).map(([
    tagKey,
    taggedEntries,
  ], index) => {
    const tagPrefix = pascalCaseTypeName(
      tagKey.split('/').at(-1) ?? '',
    );
    const namespaceName = namespaceNames[index] ?? '';

    const aliasedEntries = taggedEntries.map(({
      entrypoint,
      operation,
      schemas,
    }) => {
      const targetName = operation.name.text;
      const shorterName = targetName.startsWith(tagPrefix)
        ? targetName.slice(tagPrefix.length)
        : targetName;

      const aliasName = shorterName && shorterName !== targetName
        ? shorterName
        : `${targetName}Endpoint`;

      const declaration = createOperationNamespaceAlias(aliasName, operation, entrypoint);

      return { aliasName, declaration, schemas };
    });

    const aliases = aliasedEntries.map(({ declaration }) => declaration);

    const statement = tagKey
      ? factory.createModuleDeclaration(
          [factory.createModifier(SyntaxKind.ExportKeyword)],
          factory.createIdentifier(namespaceName),
          factory.createModuleBlock(aliases),
          NodeFlags.Namespace,
        )
      : factory.createModuleBlock(aliases);

    return { aliasedEntries, namespaceName, statement, tagKey };
  });

  const statements = tagGroups.flatMap(({ statement }) => (
    isModuleBlock(statement) ? statement.statements : [statement]
  ));

  const usedNames = new Set(tagGroups.flatMap(({
    aliasedEntries,
    namespaceName,
    tagKey,
  }) => (
    tagKey
      ? [namespaceName]
      : aliasedEntries.map(({ aliasName }) => aliasName)
  )));

  const libNameCandidates = [
    'Lib',
    'LibApi',
    ...Array.from({ length: usedNames.size }, (_, index) => (
      `LibApi${index + 1}`
    )),
  ];

  const libName = libNameCandidates.find((candidate) => (
    !usedNames.has(candidate)
  )) ?? 'Lib';

  const schemaPaths = tagGroups.flatMap(({
    aliasedEntries,
    namespaceName,
    tagKey,
  }) => (
    aliasedEntries.flatMap(({ aliasName, schemas }) => (
      schemas.map(({ name, result }) => ({
        name,
        path: [
          ...(tagKey ? [namespaceName] : []),
          aliasName,
          'Lib',
          name,
        ],
        source: result.transitiveNode,
      }))
    ))
  ));

  const libMembers = [...new Map(schemaPaths.map((schema) => (
    [schema.name, schema] as const
  )))].map(([name, { path, source }]) => ({
    name,
    source,
    type: createLibTypeReference(path),
  }));

  const firstNestedPath = schemaPaths[0]?.path.slice(0, -1).join('.');

  const openApiLibrary = libMembers.length
    ? createLibNamespace(libMembers, libName, firstNestedPath)
    : undefined;

  if (openApiLibrary) {
    statements.push(openApiLibrary);
  }

  const document = createOas3VisitorResult(
    (identifierName) => factory.createModuleDeclaration(
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      factory.createIdentifier(identifierName),
      factory.createModuleBlock(statements),
      NodeFlags.Namespace,
    ),
    transitiveNode,
    'OpenApiDocument',
    props,
  );

  return { ...document, openApiLibrary };
};
