import {
  isOas3DocumentForConversion,
  isOperation,
  isPathItem,
  operationMethods,
} from '@codegena/oas3-core/oas3';
import type {
  EntrypointRecordTransitiveNode,
  OpenApiDocumentTransitiveNode,
} from '@codegena/oas3-core/transitive-node';

import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';
import {
  getOperationIdentity,
  pascalCaseOpenApiName,
} from './oas3-utils';

export type SchemaConvertorOas3DocumentOptions = UnknownOptions;

const defaultOptions: SchemaConvertorOas3DocumentOptions = {};

export class SchemaConvertorOas3Document extends SchemaConvertorAbstract<
  SchemaConvertorOas3DocumentOptions
> {
  convert(): OpenApiDocumentTransitiveNode | null {
    const document = this.jsoncTree.getData(this.path);

    if (this.path.length || !isOas3DocumentForConversion(document)) {
      return null;
    }

    const pathEntries = Object.entries(document.paths ?? {});

    const entrypoints = pathEntries.flatMap(([path, pathItem]) => (
      this.processPath(path, pathItem)
    ));

    const documentName = document.info.title?.trim()
      || this.props.referredWithName
      || 'OpenApiDocument';

    return {
      entrypoints,
      nestedTransitiveNodes: entrypoints,
      source: this.source,
      suggestedName: pascalCaseOpenApiName(documentName),
      type: 'openApiDocument',
    };
  }

  getDefaultOptions(): SchemaConvertorOas3DocumentOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }

  private processPath(
    path: string,
    pathItem: unknown,
  ): EntrypointRecordTransitiveNode[] {
    if (!isPathItem(pathItem)) {
      this.logger.warn(
        {
          node: this.jsoncTree.getNode(['paths', path]),
          path: ['paths', path],
        },
        `Skipped OpenAPI path "${path}" without a valid operation.`,
      );

      return [];
    }

    const fixedOperations = operationMethods.map((method) => (
      this.processOperation(
        path,
        method,
        pathItem[method],
        ['paths', path, method],
      )
    ));

    const additionalOperations = Object.entries(
      pathItem.additionalOperations ?? {},
    ).map(([method, operation]) => (
      this.processOperation(
        path,
        method,
        operation,
        ['paths', path, 'additionalOperations', method],
      )
    ));

    return [...fixedOperations, ...additionalOperations]
      .filter((node): node is EntrypointRecordTransitiveNode => (
        !!node
      ));
  }

  private processOperation(
    path: string,
    method: string,
    operation: unknown,
    operationPath: string[],
  ): EntrypointRecordTransitiveNode | null {
    if (!operation) {
      return null;
    }

    if (!isOperation(operation)) {
      this.logger.warn(
        {
          node: this.jsoncTree.getNode(operationPath),
          path: operationPath,
        },
        `Skipped invalid OpenAPI operation ${method.toUpperCase()} ${path}.`,
      );

      return null;
    }

    const identity = getOperationIdentity(
      operation.operationId,
      method,
      path,
      operation.tags,
    );

    if (!operation.operationId) {
      this.logger.warn(
        {
          node: this.jsoncTree.getNode(operationPath),
          path: operationPath,
        },
        [
          `OpenAPI operation ${method.toUpperCase()} ${path} has no operationId;`,
          `used "${identity.name}".`,
        ].join(' '),
      );
    }

    const node = this.processNestedSchema({
      absPath: operationPath,
      extendedPart: {
        suggestedName: identity.name,
        breadcrumbs: identity.breadcrumbs,
        tags: identity.tags,
      },
    });

    return node?.type === 'entrypointRecord' ? node : null;
  }
}
