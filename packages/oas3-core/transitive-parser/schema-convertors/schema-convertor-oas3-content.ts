import { isMediaContentMap, type MediaContent } from '@codegena/oas3-core/oas3';
import type {
  ContentTypeRecordTransitiveNode,
  JsonSchemaTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';

import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';

export type SchemaConvertorOas3ContentOptions = UnknownOptions;

const defaultOptions: SchemaConvertorOas3ContentOptions = {};

export class SchemaConvertorOas3Content extends SchemaConvertorAbstract<
  SchemaConvertorOas3ContentOptions
> {
  convert(): ContentTypeRecordTransitiveNode | null {
    const content = this.jsoncTree.getData(this.path);

    if (this.path.at(-1) !== 'content' || !isMediaContentMap(content)) {
      return null;
    }

    const subTypes: Record<string, JsonSchemaTransitiveNode> = Object.fromEntries(
      Object.entries(content).map(([mediaType, media]) => [
        mediaType,
        this.processMediaSchema(mediaType, media),
      ]),
    );

    return {
      nestedTransitiveNodes: Object.values(subTypes),
      source: this.source,
      subTypes,
      type: 'contentTypeRecord',
    };
  }

  getDefaultOptions(): SchemaConvertorOas3ContentOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }

  private processMediaSchema(
    mediaType: string,
    media: MediaContent,
  ): JsonSchemaTransitiveNode {
    const mediaPath = [...this.path, mediaType];

    if (media.schema === undefined) {
      this.logger.warn(
        { node: this.jsoncTree.getNode(mediaPath), path: mediaPath },
        `OpenAPI media type "${mediaType}" has no schema; used unknown.`,
      );

      return this.createUnknownTransitiveNode({
        source: this.jsoncTree.getReconstructedJsonc(mediaPath),
      });
    }

    const schemaPath = [...mediaPath, 'schema'];
    const node = this.processNestedSchema({
      absPath: schemaPath,
      extendedPart: { isExcludedFromResult: true, isInline: true },
    });

    if (node && isJsonSchemaNode(node)) {
      return node;
    }

    this.logger.warn(
      { node: this.jsoncTree.getNode(schemaPath), path: schemaPath },
      `OpenAPI media type "${mediaType}" could not be converted; used unknown.`,
    );

    return this.createUnknownTransitiveNode({
      source: this.jsoncTree.getReconstructedJsonc(schemaPath),
    });
  }
}

function isJsonSchemaNode(
  node: TransitiveNode,
): node is JsonSchemaTransitiveNode {
  return node.type !== 'contentTypeRecord'
    && node.type !== 'entrypointRecord'
    && node.type !== 'openApiDocument'
    && node.type !== 'requestRecord'
    && node.type !== 'responseContentRecord'
    && node.type !== 'responseRecord';
}
