import { isSchemaArray } from '@codegena/oas3-core/json-schema';

import type {
  ArrayTransitiveNode,
  TransitiveNode,
  UnionTransitiveNode,
} from '../../transitive-node';
import {
  SchemaConvertorAbstract,
  SchemaConvertorHooks,
  type UnknownOptions,
} from '../schema-convertor';
import { isNonNegativeInteger } from '../utils';

export type SchemaConvertorArrayOptions = UnknownOptions;

type ArrayItemSchema = Record<string, unknown> | boolean;

const defaultOptions: SchemaConvertorArrayOptions = {};

export class SchemaConvertorArray extends SchemaConvertorAbstract<
  SchemaConvertorArrayOptions
> {
  private static readonly cachedTransitiveNodes = new Map<
    string,
    ArrayTransitiveNode
  >();

  convert(): ArrayTransitiveNode | null {
    const schema = this.getDataAs('object');

    if (!isSchemaArray(schema, true)) {
      return null;
    }

    const mergedSchema = this.mergeSchemaWithMixin(schema);
    const cachedItemPath = this.createUniqueIdByPath(this.path);

    const cachedItem = SchemaConvertorArray.cachedTransitiveNodes.get(
      cachedItemPath,
    );

    if (cachedItem) {
      return cachedItem;
    }

    const mutableTransitiveNode: ArrayTransitiveNode = {
      source: this.source,
      type: 'array',
    };

    const maxItems = mergedSchema['maxItems'];
    const minItems = mergedSchema['minItems'];

    if (isNonNegativeInteger(maxItems)) {
      mutableTransitiveNode.maxLength = maxItems;
    }

    if (isNonNegativeInteger(minItems)) {
      mutableTransitiveNode.minLength = minItems;
    }

    SchemaConvertorArray.cachedTransitiveNodes.set(
      cachedItemPath,
      mutableTransitiveNode,
    );

    const itemsTuple = this.extractItemsTuple(
      mutableTransitiveNode,
      mergedSchema,
    );

    const nonArrayItems = this.extractNonArrayItems(
      mutableTransitiveNode,
      mergedSchema,
    );

    const combinedNonArrayItems = this.combineItemNodes(
      nonArrayItems,
      mutableTransitiveNode,
    );

    if (itemsTuple) {
      mutableTransitiveNode.itemsTuple = itemsTuple;
      mutableTransitiveNode.restItemsInTuple = combinedNonArrayItems;
    }
    else {
      mutableTransitiveNode.itemsInCommon = combinedNonArrayItems;
    }

    if (!itemsTuple
      && (!combinedNonArrayItems || combinedNonArrayItems.type === 'unknown')
    ) {
      mutableTransitiveNode.isFallbackType = true;
    }

    const nestedTransitiveNodes = [
      ...(mutableTransitiveNode.itemsTuple ?? []),
      ...(mutableTransitiveNode.itemsInCommon
        ? [mutableTransitiveNode.itemsInCommon]
        : []),
      ...(mutableTransitiveNode.restItemsInTuple
        ? [mutableTransitiveNode.restItemsInTuple]
        : []),
    ];

    if (nestedTransitiveNodes.length) {
      mutableTransitiveNode.nestedTransitiveNodes = nestedTransitiveNodes;
    }

    return mutableTransitiveNode;
  }

  getDefaultOptions(): SchemaConvertorArrayOptions {
    return defaultOptions;
  }

  registerHook(
    hooks: SchemaConvertorHooks,
  ): SchemaConvertorAbstract {
    hooks.onTransactionComplete(() => {
      SchemaConvertorArray.cachedTransitiveNodes.clear();
    });

    return this;
  }

  private extractItemsTuple(
    parentTransitiveNode: ArrayTransitiveNode,
    schema: Record<string, unknown>,
  ): TransitiveNode[] | undefined {
    const prefixItems = this.getArrayItems(schema, 'prefixItems');
    const items = this.getItems(schema);
    const hasItemsTuple = Array.isArray(prefixItems) || Array.isArray(items);

    if (!hasItemsTuple) {
      return undefined;
    }

    const tupleItems = [
      ...(prefixItems ?? []).map((_, index) => this.extractItem(
        ['prefixItems', String(index)],
        parentTransitiveNode,
        index,
      )),
      ...(Array.isArray(items)
        ? items.map((_, index) => this.extractItem(
            ['items', String(index)],
            parentTransitiveNode,
            (prefixItems?.length ?? 0) + index,
          ))
        : []),
    ];

    return tupleItems.filter((item): item is TransitiveNode => !!item);
  }

  private extractNonArrayItems(
    parentTransitiveNode: ArrayTransitiveNode,
    schema: Record<string, unknown>,
  ): TransitiveNode[] {
    const items = this.getItems(schema);
    const unevaluatedItems = schema['unevaluatedItems'];

    return [
      ...(items !== undefined && !Array.isArray(items)
        ? [this.extractItem(['items'], parentTransitiveNode)]
        : []),
      ...(isArrayItemSchema(unevaluatedItems)
        ? [this.extractItem(['unevaluatedItems'], parentTransitiveNode)]
        : []),
    ].filter((item): item is TransitiveNode => !!item);
  }

  private extractItem(
    subPath: string[],
    parentTransitiveNode: ArrayTransitiveNode,
    associatedArrayIndex?: number,
  ): TransitiveNode | null {
    const absolutePath = [...this.path, ...subPath];
    const schema = this.getItemSchema(subPath);

    if (schema === false) {
      return null;
    }

    const extendedPart = {
      isExcludedFromResult: true,
      isInline: true,
      nestedBy: [parentTransitiveNode],
      ...(associatedArrayIndex !== undefined && { associatedArrayIndex }),
    };

    if (schema === true) {
      return this.createUnknownTransitiveNode({
        ...extendedPart,
        source: this.jsoncTree.getReconstructedJsonc(absolutePath),
      });
    }

    const transitiveNode = this.processNestedSchema({
      absPath: absolutePath,
      extendedPart,
    });

    if (transitiveNode) {
      return transitiveNode;
    }

    return this.createUnknownTransitiveNode({
      ...extendedPart,
      source: this.jsoncTree.getReconstructedJsonc(absolutePath),
    });
  }

  private combineItemNodes(
    items: TransitiveNode[],
    parentTransitiveNode: ArrayTransitiveNode,
  ): TransitiveNode | undefined {
    if (!items.length) {
      return undefined;
    }

    if (items.length === 1) {
      return items[0];
    }

    const unionTransitiveNode: UnionTransitiveNode = {
      isExcludedFromResult: true,
      isInline: true,
      mixin: null,
      nestedBy: [parentTransitiveNode],
      referredTransitiveNodes: items,
      source: this.source,
      type: 'union',
    };

    items.forEach((item) => {
      item.referredBy = [
        ...item.referredBy ?? [],
        unionTransitiveNode,
      ];
    });

    return unionTransitiveNode;
  }

  private createUniqueIdByPath(path: string[]): string {
    return [
      this.props.jsoncTree.getSourceFileId(),
      '#',
      ...path,
    ].join('/');
  }

  private getItems(
    schema: Record<string, unknown>,
  ): ArrayItemSchema | unknown[] | undefined {
    const items = schema['items'];

    if (Array.isArray(items) || isArrayItemSchema(items)) {
      return items;
    }

    return undefined;
  }

  private getArrayItems(
    schema: Record<string, unknown>,
    property: string,
  ): unknown[] | undefined {
    const items = schema[property];

    return Array.isArray(items) ? items : undefined;
  }

  private getItemSchema(subPath: string[]): ArrayItemSchema | undefined {
    const schema = this.jsoncTree.getData([...this.path, ...subPath]);

    return isArrayItemSchema(schema) ? schema : undefined;
  }
}

function isArrayItemSchema(value: unknown): value is ArrayItemSchema {
  return typeof value === 'boolean'
    || (typeof value === 'object' && value !== null && !Array.isArray(value));
}
