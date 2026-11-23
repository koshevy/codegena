import {
  isHasDependentRequired,
  isSchemaObject,
} from '@codegena/oas3-core/json-schema';
import type { Node } from 'jsonc-parser';

import type {
  StructureTransitiveNode,
  TransitiveNode,
  UnionTransitiveNode,
} from '../../transitive-node';
import {
  SchemaConvertorAbstract,
  type SchemaConvertorHooks,
  type UnknownOptions,
} from '../schema-convertor';

export type SchemaConvertorDependentRequiredOptions = UnknownOptions;

const defaultOptions: SchemaConvertorDependentRequiredOptions = {};

export class SchemaConvertorDependentRequired extends SchemaConvertorAbstract<
  SchemaConvertorDependentRequiredOptions
> {
  private static cachedTransitiveNodes = new WeakMap<Node, UnionTransitiveNode>();

  convert(): StructureTransitiveNode | UnionTransitiveNode | null {
    const schema = this.getDataAs('object');
    const dependentRequired = this.jsoncTree.getData([
      ...this.path,
      'dependentRequired',
    ]);

    if (dependentRequired === undefined) {
      return null;
    }

    if (!isSchemaObject(schema, true)
      || !isHasDependentRequired(schema)
    ) {
      this.logger.warn(
        { node: this.source.node },
        [
          'Ignored dependentRequired:',
          'expected an object schema and a record of string arrays.',
        ].join(' '),
      );

      return null;
    }

    const cachedItem = SchemaConvertorDependentRequired.cachedTransitiveNodes.get(
      this.source.node,
    );

    if (cachedItem) {
      return cachedItem;
    }

    const union: UnionTransitiveNode = {
      mixin: null,
      referredTransitiveNodes: [],
      source: this.source,
      type: 'union',
    };

    SchemaConvertorDependentRequired.cachedTransitiveNodes.set(this.source.node, union);

    const original = this.processNestedSchema({
      absPath: this.path,
      extendedPart: {
        isExcludedFromResult: true,
        referredTransitiveNodes: this.props.referredTransitiveNodes,
      },
      skipCaching: true,
      skipConvertors: [
        ...this.props.skipConvertors ?? [],
        SchemaConvertorDependentRequired,
      ],
    });

    if (original?.type !== 'structure') {
      SchemaConvertorDependentRequired.cachedTransitiveNodes.delete(this.source.node);
      this.logger.warn(
        { node: this.source.node },
        'Ignored dependentRequired: nested conversion did not produce a structure.',
      );

      return null;
    }

    const variants = Object.entries(schema.dependentRequired).flatMap(([
      key,
      required,
    ]) => {
      if (original.properties?.[key]?.isRequired
        || required.every((name) => original.properties?.[name]?.isRequired)
      ) {
        return [];
      }

      return [this.createVariant(original, [key, ...required], union)];
    });

    if (!variants.length) {
      SchemaConvertorDependentRequired.cachedTransitiveNodes.delete(this.source.node);
      delete original.isExcludedFromResult;
      this.logger.warn(
        { node: this.source.node },
        [
          'Ignored dependentRequired: no applicable dependency variants;',
          'kept original structure.',
        ].join(' '),
      );

      return original;
    }

    union.referredTransitiveNodes = [
      this.createVariant(original, [], union),
      ...variants,
    ];

    return union;
  }

  getDefaultOptions(): SchemaConvertorDependentRequiredOptions {
    return defaultOptions;
  }

  registerHook(hooks: SchemaConvertorHooks): SchemaConvertorAbstract {
    hooks.onTransactionComplete(() => {
      SchemaConvertorDependentRequired.cachedTransitiveNodes = new WeakMap();
    });

    return this;
  }

  private createVariant(
    original: StructureTransitiveNode,
    required: string[],
    union: UnionTransitiveNode,
  ): StructureTransitiveNode {
    const variant: StructureTransitiveNode = {
      ...original,
      isExcludedFromResult: true,
      isInline: true,
      options: {
        ...original.options,
        transitiveNodeCacheKey: `dependentRequired:${JSON.stringify(required)}`,
      },
      referredBy: [union],
    };

    const originalProperties = new Map<string, TransitiveNode>(
      Object.entries(original.properties ?? {}).map(([name, property]) => [
        name,
        { ...property, nestedBy: [variant] },
      ]),
    );

    const properties = required.reduce((result, name) => {
      const property = result.get(name);

      if (property) {
        result.set(name, { ...property, isRequired: true });

        return result;
      }

      this.logger.warn(
        { node: this.source.node },
        `Missing dependentRequired property "${name}" was processed as \`unknown\`.`,
      );
      result.set(name, this.createUnknownTransitiveNode({
        associatedPropertyName: name,
        isRequired: true,
        nestedBy: [variant],
        source: this.source,
      }));

      return result;
    }, originalProperties);

    variant.properties = Object.fromEntries(properties);
    variant.propertyPatterns = original.propertyPatterns?.map(([pattern, property]) => [
      pattern,
      { ...property, nestedBy: [variant] },
    ]);
    variant.nestedTransitiveNodes = [
      ...properties.values(),
      ...(variant.propertyPatterns ?? []).map(([, property]) => property),
    ];

    return variant;
  }
}
