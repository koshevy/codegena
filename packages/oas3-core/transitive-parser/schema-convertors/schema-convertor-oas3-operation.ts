import {
  isOperation,
  isOperationMethod,
  type Parameter,
} from '@codegena/oas3-core/oas3';
import type {
  ContentTypeRecordTransitiveNode,
  EntrypointRecordTransitiveNode,
  RequestRecordTransitiveNode,
  StructureTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';

import { isReconstructedObjectJsoncValue } from '../reconstruct-jsonc-value';
import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';
import {
  createOas3HeaderStructure,
  getOas3OperationParameters,
  getOas3ParameterSchemaPath,
  mergeOas3HeaderStructures,
  resolveOas3RequestBody,
  type ParameterAtPath,
} from './oas3-utils';

export type SchemaConvertorOas3OperationOptions = UnknownOptions;

const defaultOptions: SchemaConvertorOas3OperationOptions = {};

export class SchemaConvertorOas3Operation extends SchemaConvertorAbstract<
  SchemaConvertorOas3OperationOptions
> {
  convert(): EntrypointRecordTransitiveNode | null {
    const operation = this.jsoncTree.getData(this.path);
    const path = this.path[1];
    const method = this.path.at(-1);

    const isFixedOperation = this.path.length === 3
      && isOperationMethod(method);

    const isAdditionalOperation = this.path.length === 4
      && this.path[2] === 'additionalOperations';

    if (!method
      || !path
      || this.path[0] !== 'paths'
      || (!isFixedOperation && !isAdditionalOperation)
      || !isOperation(operation)
      || !isReconstructedObjectJsoncValue(this.source)
    ) {
      return null;
    }

    const operationName = this.referredWithName ?? '';
    const {
      pathParameters,
      queryParameters,
      headerParameters,
    } = this.createOperationParameters(method, path, operationName);

    const request = this.createRequestRecord(
      operation.requestBody,
      headerParameters,
      operationName,
    );

    const response = this.processNestedSchema({
      absPath: [...this.path, 'responses'],
      extendedPart: {
        suggestedName: `Response${operationName}`,
        tags: this.tags,
      },
    });
    const responseRecord = response?.type === 'responseRecord'
      ? response
      : undefined;

    return {
      method,
      operationId: operation.operationId,
      originalTags: operation.tags,
      nestedTransitiveNodes: [
        ...(pathParameters ? [pathParameters] : []),
        ...(queryParameters ? [queryParameters] : []),
        ...(request ? [request] : []),
        ...(responseRecord ? [responseRecord] : []),
      ],
      path,
      pathParameters,
      queryParameters,
      request,
      response: responseRecord,
      source: this.source,
      tags: this.tags,
      type: 'entrypointRecord',
    };
  }

  getDefaultOptions(): SchemaConvertorOas3OperationOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }

  private createOperationParameters(
    method: string,
    path: string,
    operationName: string,
  ): {
    pathParameters?: StructureTransitiveNode;
    queryParameters?: StructureTransitiveNode;
    headerParameters?: StructureTransitiveNode;
  } {
    const parameters = getOas3OperationParameters(
      this.jsoncTree,
      this.logger,
      this.path,
    );
    const pathParameters = this.createParameterStructure(
      parameters,
      'path',
      `PathParameters${operationName}`,
    );

    const queryParameters = this.createParameterStructure(
      parameters,
      'query',
      `QueryParameters${operationName}`,
    );

    const headerParameters = this.createParameterStructure(
      parameters,
      'header',
      `RequestHeaders${operationName}`,
      false,
    );

    const hasCookieParameters = parameters.some(({ parameter }) => (
      parameter.in === 'cookie'
    ));

    if (hasCookieParameters) {
      this.logger.warn(
        { node: this.source.node },
        `Ignored cookie parameters of ${method.toUpperCase()} ${path}.`,
      );
    }

    return { pathParameters, queryParameters, headerParameters };
  }

  private createParameterStructure(
    entries: ParameterAtPath[],
    target: Parameter['in'],
    suggestedName: string,
    shouldAddToResult = true,
  ): StructureTransitiveNode | undefined {
    if (!isReconstructedObjectJsoncValue(this.source)) {
      return undefined;
    }

    const selected = entries.filter(({ parameter }) => (
      parameter.in === target
    ));

    if (!selected.length) {
      return undefined;
    }

    const properties: Record<string, TransitiveNode> = Object.fromEntries(
      selected.map((entry) => [
        entry.parameter.name,
        this.processParameter(entry),
      ]),
    );

    const structure: StructureTransitiveNode = {
      nestedTransitiveNodes: Object.values(properties),
      properties,
      source: this.source,
      suggestedName,
      tags: this.tags,
      type: 'structure',
    };

    if (shouldAddToResult) {
      this.flatProcessedSchemas.add(structure);
    }

    return structure;
  }

  private processParameter({
    parameter,
    path,
  }: ParameterAtPath): TransitiveNode {
    const schemaPath = getOas3ParameterSchemaPath({ parameter, path });
    const node = schemaPath
      ? this.processNestedSchema({
          absPath: schemaPath,
          extendedPart: { isExcludedFromResult: true, isInline: true },
        })
      : null;

    if (!node) {
      this.logger.warn(
        { node: this.jsoncTree.getNode(path), path },
        `Parameter "${parameter.name}" has no supported schema; used unknown.`,
      );
    }

    const property = node ?? this.createUnknownTransitiveNode({
      source: this.jsoncTree.getReconstructedJsonc(path),
    });

    property.associatedPropertyName = parameter.name;
    property.isRequired = parameter.required === true;

    return property;
  }

  private createRequestRecord(
    requestBody: unknown,
    parameterHeaders: StructureTransitiveNode | undefined,
    operationName: string,
  ): RequestRecordTransitiveNode | undefined {
    const { request, path: requestPath } = resolveOas3RequestBody(
      this.jsoncTree,
      this.logger,
      this.path,
      requestBody,
    );

    const directHeaders = request && 'headers' in request
      ? createOas3HeaderStructure({
          headersPath: [...requestPath, 'headers'],
          jsoncTree: this.jsoncTree,
          logger: this.logger,
          processSchema: (path) => this.processNestedSchema({
            absPath: path,
            extendedPart: { isExcludedFromResult: true, isInline: true },
          }),
        })
      : null;

    const headers = mergeOas3HeaderStructures([
      ...(parameterHeaders ? [parameterHeaders] : []),
      ...(directHeaders ? [directHeaders] : []),
    ]);

    if (!request && !headers) {
      return undefined;
    }

    const contentNode = request
      ? this.processNestedSchema({
          absPath: [...requestPath, 'content'],
          extendedPart: {
            suggestedName: `RequestContent${operationName}`,
            tags: this.tags,
          },
        })
      : null;

    const content: ContentTypeRecordTransitiveNode | undefined = (
      contentNode?.type === 'contentTypeRecord'
        ? contentNode
        : undefined
    );

    if (headers) {
      headers.suggestedName = `RequestHeaders${operationName}`;
      headers.tags = this.tags;
      this.flatProcessedSchemas.add(headers);
    }

    const node: RequestRecordTransitiveNode = {
      content,
      headers,
      nestedTransitiveNodes: [
        ...(content ? [content] : []),
        ...(headers ? [headers] : []),
      ],
      source: request
        ? this.jsoncTree.getReconstructedJsonc(requestPath)
        : this.source,
      suggestedName: `Request${operationName}`,
      tags: this.tags,
      type: 'requestRecord',
    };

    this.flatProcessedSchemas.add(node);

    return node;
  }
}
