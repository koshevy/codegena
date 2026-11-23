import {
  isHasAllOfVariants,
  isHasAnyOfVariants,
  isHasOneOfVariantsRequired,
  isNotSgnificantSchema,
} from '@codegena/oas3-core/json-schema';
import type {
  CombinedTransitiveNode,
  IntersectionTransitiveNode,
  TransitiveNode,
  UnionTransitiveNode,
} from '@codegena/oas3-core/transitive-node';

import { getRequiredPropertyNames } from '../../transitive-utils';
import {
  SchemaConvertorAbstract,
  SchemaConvertorHooks,
  type UnknownOptions,
} from '../schema-convertor';

export type SchemaConvertorSomeOfOptions = UnknownOptions;

const defaultOptions: SchemaConvertorSomeOfOptions = {};

export class SchemaConvertorSomeOf extends SchemaConvertorAbstract<
  SchemaConvertorSomeOfOptions
> {
  private static readonly cachedTransitiveNodes = new Map<
    string,
    CombinedTransitiveNode
  >();

  convert(): CombinedTransitiveNode | null {
    const schema = this.getDataAs('object');
    const variantsInfo = getVariantsInfo(schema);

    if (!schema || !variantsInfo) {
      return null;
    }

    const commonSchema = { ...schema };

    delete commonSchema['allOf'];
    delete commonSchema['anyOf'];
    delete commonSchema['oneOf'];

    const schemaMixin = this.mergeSchemaWithMixin(commonSchema);
    const inlineMixin = isNotSgnificantSchema(schemaMixin);

    const cachedItemPath = this.createUniqueIdByPath(this.path);
    const cachedItem = SchemaConvertorSomeOf.cachedTransitiveNodes.get(
      cachedItemPath,
    );

    if (cachedItem) {
      return cachedItem;
    }

    const mutableTransitiveNode = this.createCombinedTransitiveNode(
      variantsInfo,
    );

    SchemaConvertorSomeOf.cachedTransitiveNodes.set(
      cachedItemPath,
      mutableTransitiveNode,
    );

    const variants = variantsInfo.variants.map(
      (_, index) => this.extractVariant(
        index,
        mutableTransitiveNode,
        variantsInfo.propertyName,
        inlineMixin ? schemaMixin : undefined,
      ),
    );

    if (variantsInfo.type === 'intersection') {
      const excludedVariants = variants.flatMap(
        (variant) => variant.not ?? [],
      );

      if (excludedVariants.length) {
        mutableTransitiveNode.not = excludedVariants;
      }

      mutableTransitiveNode.referredTransitiveNodes = variants.filter(
        (variant) => !variant.not?.length,
      );
    }
    else {
      mutableTransitiveNode.referredTransitiveNodes = variants;
    }

    const mixin: TransitiveNode | null = inlineMixin
      ? null
      : this.processNestedSchema({
          absPath: this.path,
          extendedPart: {
            isExcludedFromResult: true,
            isInline: true,
          },
          skipCaching: true,
          skipConvertors: [
            ...this.props.skipConvertors ?? [],
            SchemaConvertorSomeOf,
          ],
        });

    if (mixin?.type === 'structure' && mixin.properties) {
      const requiredProperties = getRequiredPropertyNames(mutableTransitiveNode);

      mixin.properties = Object.fromEntries(
        Object.entries(mixin.properties).map(([propertyName, property]) => [
          propertyName,
          requiredProperties.has(propertyName)
            ? { ...property, isRequired: true }
            : property,
        ]),
      );

      mixin.nestedTransitiveNodes = [
        ...Object.values(mixin.properties),
        ...(mixin.propertyPatterns ?? []).map(([, property]) => property),
      ];
    }

    mutableTransitiveNode.mixin = mixin;

    return mutableTransitiveNode;
  }

  getDefaultOptions(): SchemaConvertorSomeOfOptions {
    return defaultOptions;
  }

  registerHook(
    hooks: SchemaConvertorHooks,
  ): SchemaConvertorAbstract {
    hooks.onTransactionComplete(() => {
      SchemaConvertorSomeOf.cachedTransitiveNodes.clear();
    });

    return this;
  }

  private extractVariant(
    index: number,
    parentTransitiveNode: CombinedTransitiveNode,
    variantsPropertyName: CombinedVariantsInfo['propertyName'],
    schemaMixin?: Record<string, unknown>,
  ): TransitiveNode {
    const path = [...this.path, variantsPropertyName, String(index)];
    const transitiveNode = this.processNestedSchema({
      absPath: path,
      extendedPart: {
        isExcludedFromResult: true,
        isInline: true,
        referredBy: [parentTransitiveNode],
      },
      schemaMixin,
      skipUnprocessableSchemaWarning: false,
    });

    if (transitiveNode) {
      return transitiveNode;
    }

    return this.createUnknownTransitiveNode({
      source: this.jsoncTree.getReconstructedJsonc(path),
    });
  }

  private createUniqueIdByPath(path: string[]): string {
    return [
      this.props.jsoncTree.getSourceFileId(),
      '#',
      ...path,
    ].join('/');
  }

  private createCombinedTransitiveNode(
    variantsInfo: CombinedVariantsInfo,
  ): CombinedTransitiveNode {
    const source = this.source;

    if (variantsInfo.type === 'intersection') {
      return {
        mixin: null,
        referredTransitiveNodes: [],
        source,
        type: 'intersection',
      } satisfies IntersectionTransitiveNode;
    }

    return {
      ...(variantsInfo.isExclusive && { isExclusive: true }),
      mixin: null,
      referredTransitiveNodes: [],
      source,
      type: 'union',
    } satisfies UnionTransitiveNode;
  }
}

interface CombinedVariantsInfoBase {
  propertyName: 'anyOf' | 'oneOf';
  variants: unknown[];
}

type CombinedVariantsInfo = (
  | (
    & CombinedVariantsInfoBase
    & {
      isExclusive?: boolean;
      type: 'union';
    }
  )
  | {
    propertyName: 'allOf';
    type: 'intersection';
    variants: unknown[];
  }
);

function getVariantsInfo(schema: unknown): CombinedVariantsInfo | null {
  if (isHasAllOfVariants(schema)) {
    return {
      propertyName: 'allOf',
      type: 'intersection',
      variants: schema.allOf,
    };
  }

  if (isHasOneOfVariantsRequired(schema)) {
    return {
      isExclusive: true,
      propertyName: 'oneOf',
      type: 'union',
      variants: schema.oneOf,
    };
  }

  if (isHasAnyOfVariants(schema)) {
    return {
      isExclusive: false,
      propertyName: 'anyOf',
      type: 'union',
      variants: schema.anyOf,
    };
  }

  return null;
}
