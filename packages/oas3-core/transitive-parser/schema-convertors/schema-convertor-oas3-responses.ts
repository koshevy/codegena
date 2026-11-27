import {
  isReferenceObject,
  isResponse,
  isResponses,
  type Responses,
} from '@codegena/oas3-core/oas3';
import type {
  ContentTypeRecordTransitiveNode,
  ResponseContentRecordTransitiveNode,
  ResponseHeadersRecordTransitiveNode,
  ResponseRecordTransitiveNode,
  StructureTransitiveNode,
} from '@codegena/oas3-core/transitive-node';

import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';
import {
  createOas3HeaderStructure,
  getLocalReferencePath,
} from './oas3-utils';

export type SchemaConvertorOas3ResponsesOptions = UnknownOptions;

const defaultOptions: SchemaConvertorOas3ResponsesOptions = {};

type CollectedResponseParts = {
  contentByStatus: Record<string, ContentTypeRecordTransitiveNode>;
  headersByStatus: Record<string, StructureTransitiveNode>;
};

export class SchemaConvertorOas3Responses extends SchemaConvertorAbstract<
  SchemaConvertorOas3ResponsesOptions
> {
  convert(): ResponseRecordTransitiveNode | null {
    const responses = this.jsoncTree.getData(this.path);

    if (this.path.at(-1) !== 'responses' || !isResponses(responses)) {
      return null;
    }

    const {
      contentByStatus,
      headersByStatus,
    } = this.collectResponseParts(responses);

    const operationName = this.referredWithName?.replace(/^Response/, '') ?? '';

    const content = Object.keys(contentByStatus).length
      ? this.createResponseContentRecord(contentByStatus, operationName)
      : undefined;

    const headers = Object.keys(headersByStatus).length
      ? headersByStatus
      : undefined;

    const headerRecord = headers
      ? this.createResponseHeadersRecord(
          headers,
          Object.keys(contentByStatus),
          operationName,
        )
      : undefined;

    return {
      content,
      headerRecord,
      headers,
      nestedTransitiveNodes: [
        ...(content ? [content] : []),
        ...(headerRecord ? [headerRecord] : []),
      ],
      source: this.source,
      type: 'responseRecord',
    };
  }

  getDefaultOptions(): SchemaConvertorOas3ResponsesOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }

  private collectResponseParts(responses: Responses): CollectedResponseParts {
    const initialParts = {
      contentByStatus: new Map<string, ContentTypeRecordTransitiveNode>(),
      headersByStatus: new Map<string, StructureTransitiveNode>(),
    };

    const collectedParts = Object.entries(responses)
      .reduce((parts, [status, response]) => {
        const { content, headers } = this.processResponse(status, response);

        if (content) {
          parts.contentByStatus.set(status, content);
        }

        if (headers) {
          parts.headersByStatus.set(status, headers);
        }

        return parts;
      }, initialParts);

    return {
      contentByStatus: Object.fromEntries(collectedParts.contentByStatus),
      headersByStatus: Object.fromEntries(collectedParts.headersByStatus),
    };
  }

  private processResponse(
    status: string,
    response: Responses[string],
  ): {
    content?: ContentTypeRecordTransitiveNode;
    headers?: StructureTransitiveNode;
  } {
    const referencePath = isReferenceObject(response)
      ? getLocalReferencePath(response.$ref)
      : null;

    const responsePath = referencePath ?? [...this.path, status];
    const responseData = referencePath
      ? this.jsoncTree.getData(referencePath)
      : response;

    if (!isResponse(responseData)) {
      this.logger.warn(
        {
          node: this.jsoncTree.getNode([...this.path, status]),
          path: [...this.path, status],
        },
        `Skipped unsupported OpenAPI response "${status}".`,
      );

      return {};
    }

    const contentNode = responseData.content
      ? this.processNestedSchema({
          absPath: [...responsePath, 'content'],
          extendedPart: { isExcludedFromResult: true },
        })
      : null;

    const headerStructure: StructureTransitiveNode | null = responseData.headers
      ? createOas3HeaderStructure({
          headersPath: [...responsePath, 'headers'],
          jsoncTree: this.jsoncTree,
          logger: this.logger,
          processSchema: (path) => this.processNestedSchema({
            absPath: path,
            extendedPart: { isExcludedFromResult: true, isInline: true },
          }),
        })
      : null;

    const content = contentNode?.type === 'contentTypeRecord'
      ? contentNode
      : undefined;

    return {
      content,
      headers: headerStructure ?? undefined,
    };
  }

  private createResponseContentRecord(
    contentByStatus: Record<string, ContentTypeRecordTransitiveNode>,
    operationName: string,
  ): ResponseContentRecordTransitiveNode {
    const node: ResponseContentRecordTransitiveNode = {
      nestedTransitiveNodes: Object.values(contentByStatus),
      source: this.source,
      subTypes: contentByStatus,
      suggestedName: `ResponseContent${operationName}`,
      tags: this.tags,
      type: 'responseContentRecord',
    };

    this.flatProcessedSchemas.add(node);

    return node;
  }

  private createResponseHeadersRecord(
    headers: Record<string, StructureTransitiveNode>,
    contentStatuses: string[],
    operationName: string,
  ): ResponseHeadersRecordTransitiveNode {
    const node: ResponseHeadersRecordTransitiveNode = {
      headers,
      nestedTransitiveNodes: Object.values(headers),
      source: this.source,
      statuses: [...new Set([
        ...contentStatuses,
        ...Object.keys(headers),
      ])],
      suggestedName: `ResponseHeaders${operationName}`,
      tags: this.tags,
      type: 'responseHeadersRecord',
    };

    this.flatProcessedSchemas.add(node);

    return node;
  }
}
