import {
  factory,
  NodeFlags,
  SyntaxKind,
  type Statement,
} from 'typescript';

import {
  collectOperationSchemaResults,
  createLibNamespace,
  createNamespaceTypeAlias,
  createOas3VisitorResult,
} from './utils';
import type {
  TypescriptParserVisitorFn,
} from '../../typescript-parser-visitor-fn';

export const visitorEntrypointRecord: TypescriptParserVisitorFn = (props) => {
  const { getAnotherByTransitiveNode, transitiveNode } = props;

  if (transitiveNode.type !== 'entrypointRecord') {
    return null;
  }

  const aliases = [
    createNamespaceTypeAlias('PathParameters', transitiveNode.pathParameters, props),
    createNamespaceTypeAlias('QueryParameters', transitiveNode.queryParameters, props),
    createNamespaceTypeAlias('Request', transitiveNode.request, props),
    createNamespaceTypeAlias('RequestHeaders', transitiveNode.request?.headers, props),
    createNamespaceTypeAlias('Response', transitiveNode.response, props),
    createNamespaceTypeAlias(
      'ResponseHeaders',
      transitiveNode.response?.headerRecord,
      props,
    ),
  ].filter((statement): statement is Statement => statement !== null);

  const nestedNodes = [
    transitiveNode.pathParameters,
    transitiveNode.queryParameters,
    transitiveNode.request,
    transitiveNode.request?.headers,
    transitiveNode.response,
    transitiveNode.response?.headerRecord,
  ].filter((node) => node !== undefined);

  const nestedResults = nestedNodes
    .map((item) => getAnotherByTransitiveNode(item))
    .filter((nestedResult) => typeof nestedResult !== 'function');

  const schemas = collectOperationSchemaResults(nestedResults);
  const libMembers = schemas.map(({ name, result: schemaResult }) => ({
    name,
    source: schemaResult.transitiveNode,
    type: factory.createTypeReferenceNode(`__${name}`),
  }));

  const statements = [
    ...aliases,
    ...(libMembers.length ? [createLibNamespace(libMembers)] : []),
  ];

  const result = createOas3VisitorResult(
    (identifierName) => factory.createModuleDeclaration(
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      factory.createIdentifier(identifierName),
      factory.createModuleBlock(statements),
      NodeFlags.Namespace,
    ),
    transitiveNode,
    'Operation',
    props,
  );

  return {
    ...result,
    dependencies: schemas.map(({ result: schemaResult }) => schemaResult),
    importAliases: Object.fromEntries(schemas.map(({ name }) => (
      [name, `__${name}`]
    ))),
  };
};
