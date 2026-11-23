/* eslint-disable max-lines */
import {
  isHasPatternProperties,
  isSchemaObject,
} from '@codegena/oas3-core/json-schema';
import type {
  TransitiveNode,
  StructureTransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import type { Node } from 'jsonc-parser';
import isEmpty from 'lodash/isEmpty';

import { JsonParseError } from '../json-parse-error';
import { isReconstructedObjectJsoncValue } from '../reconstruct-jsonc-value';
import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';
import { getNodeErrorText } from '../utils';
import { createSafeRegExp } from './create-safe-regexp';

export interface SchemaConvertorStructureOptions extends UnknownOptions {
  /**
   * Adds missed properties from `required` to the properties list
   * as `unknown`. By default is `true`.
   */
  enrichPropertiesWithMissedRequired?: boolean;
}

const defaultOptions: SchemaConvertorStructureOptions = {
  enrichPropertiesWithMissedRequired: true,
};

export class SchemaConvertorStructure
  extends SchemaConvertorAbstract<SchemaConvertorStructureOptions> {
  /** Keeps recursive references attached to the structure being populated. */
  private static readonly activeNodes = new WeakMap<
    Node,
    StructureTransitiveNode
  >();

  convert(): StructureTransitiveNode | null {
    const schema = this.getDataAs('object');

    if (!isSchemaObject(schema, true)) {
      return null;
    }

    const mergedSchema = this.mergeSchemaWithMixin(schema);
    const canCache = !this.schemaMixin;

    const cachedNode = canCache
      ? SchemaConvertorStructure.activeNodes.get(this.source.node)
      : undefined;

    if (cachedNode) {
      return cachedNode;
    }

    if (!isReconstructedObjectJsoncValue(this.source)) {
      throw new JsonParseError(
        [
          'Expected a source to be an instance of the ReconstructedObjectJsoncValue.',
          'It may mean an internal error. Please, send bug report!',
        ].join('\n'),
        this.source.getOriginalFileContent(),
        this.source.node,
        {
          logger: this.logger,
          sourceFileId: this.source.sourceFileId,
        },
      );
    }

    this.warnPropertiesAreIgnoredInSchema({
      properties: ['maxProperties', 'minProperties'],
    });

    const resultMutable: StructureTransitiveNode = {
      source: this.source,
      type: 'structure',
    };

    if (canCache) {
      SchemaConvertorStructure.activeNodes.set(this.source.node, resultMutable);
    }

    try {
      this.populateStructureNode(resultMutable, mergedSchema);
    }
    finally {
      if (canCache) {
        SchemaConvertorStructure.activeNodes.delete(this.source.node);
      }
    }

    return resultMutable;
  }

  getDefaultOptions(): SchemaConvertorStructureOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }

  private populateStructureNode(
    resultMutable: StructureTransitiveNode,
    mergedSchema: Record<string, unknown>,
  ): void {
    resultMutable.properties = this.extractProperties(
      resultMutable,
      mergedSchema,
    );
    resultMutable.propertyPatterns = this.extractPropertyPatterns(resultMutable);
    resultMutable.defaultKeyPattern = this.extractDefaultKeyPattern(resultMutable);
    // must be extracted last because extractAdditionalProperties
    // depends on result of propertyPatterns and defaultKeyPattern
    resultMutable.additionalProperties = this.extractAdditionalProperties(resultMutable);

    if (resultMutable.properties) {
      resultMutable.nestedTransitiveNodes = Object.values(resultMutable.properties);
    }

    if (resultMutable.propertyPatterns) {
      resultMutable.nestedTransitiveNodes = [
        ...(resultMutable.nestedTransitiveNodes ?? []),
        ...resultMutable.propertyPatterns.map(([, transitiveNode]) => transitiveNode),
      ];
    }

    if (resultMutable.defaultKeyPattern === undefined) {
      delete resultMutable.defaultKeyPattern;
    }

    if (resultMutable.properties === undefined) {
      delete resultMutable.properties;
    }

    if (resultMutable.propertyPatterns === undefined) {
      delete resultMutable.propertyPatterns;
    }
  }

  /**
   * Should be called AFTER {@link extractPropertyPatterns} because
   * patterns mean need to forcedly change ability to have additional
   * properties to `true`.
   */
  private extractAdditionalProperties(
    parentTransitiveNode: StructureTransitiveNode,
  ): TransitiveNode | false | undefined {
    const additionalProperties = this.getDataAs(
      ['object', 'boolean'],
      ['additionalProperties'],
    );

    const unknownTransitiveNodeTemplate = this.createUnknownTransitiveNode({
      isRequired: false,
      nestedBy: [parentTransitiveNode],
      source: this.source,
    });

    if (additionalProperties !== undefined) {
      this.warnPropertiesAreIgnoredInSchema({
        messageHint: 'Ignored in prefer of additionalProperties.',
        properties: [
          'unevaluatedProperties',
        ],
      });
    }

    if (typeof additionalProperties === 'object'
      && additionalProperties !== null
    ) {
      const nestedSchema = this.processNestedSchema({
        absPath: [...this.path, 'additionalProperties'],
        extendedPart: {
          nestedBy: [parentTransitiveNode],
          isExcludedFromResult: true,
          // todo: describe cases isInline is false!
          //       $ref and other cases
          isInline: true,
        },
      });

      return nestedSchema
        ? nestedSchema
        : unknownTransitiveNodeTemplate;
    }

    let booleanValue: boolean | undefined;
    const hasDefaultKeyPattern = !!parentTransitiveNode.defaultKeyPattern;
    const unevaluatedProperties = this.getDataAs(
      'boolean',
      ['unevaluatedProperties'],
    );

    if (typeof additionalProperties === 'boolean') {
      booleanValue = additionalProperties;
    }
    else if (typeof unevaluatedProperties === 'boolean') {
      booleanValue = unevaluatedProperties;
    }

    if (hasDefaultKeyPattern && !booleanValue) {
      this.logger.warn(
        { node: this.source.node },
        [
          'Schema forcedly marked as having additional properties.',
          'Because the schema has parsed property patterns.',
          getNodeErrorText(
            this.source.getOriginalFileContent(),
            this.source.node,
            this.source.sourceFileId,
          ),
        ].join('\n'),
      );
    }

    if (hasDefaultKeyPattern || booleanValue) {
      return unknownTransitiveNodeTemplate;
    }

    return booleanValue === false ? false : undefined;
  }

  private extractProperties(
    parentTransitiveNode: StructureTransitiveNode,
    schema: Record<string, unknown>,
  ): Record<string, TransitiveNode> | undefined {
    const missedPropertiesFromRequired = (
      this.extractMissedPropertiesFromRequired(parentTransitiveNode, schema)
    );

    const propertySchemas = this.getDataAs('object', [
      'properties',
    ]);

    const explicitPropertiesByName = Object.keys(propertySchemas ?? {}).reduce(
      (result, property) => {
        const propertyPath = [...this.path, 'properties', property];
        const propertySource = this.jsoncTree.getReconstructedJsonc(propertyPath);
        const propertyNode = propertySource.node;

        const propertyTransitiveNode = this.processNestedSchema({
          absPath: propertyPath,
          extendedPart: {
            associatedPropertyName: property,
            // todo: describe cases isInline is false!
            //       $ref and other cases
            isInline: true,
            isRequired: !!missedPropertiesFromRequired?.[property],
            nestedBy: [parentTransitiveNode],
          },
        });

        if (!propertyTransitiveNode) {
          this.logger.warn(
            { node: propertyNode },
            [
              `Property at "${propertyPath.join('.')}" was processed as \`unknown\`.`,
              getNodeErrorText(
                this.source.getOriginalFileContent(),
                propertyNode,
                this.source.sourceFileId,
              ),
            ].join('\n'),
          );

          result.set(property, this.createUnknownTransitiveNode({
            associatedPropertyName: property,
            isRequired: !!missedPropertiesFromRequired?.[property],
            nestedBy: [parentTransitiveNode],
            source: propertySource,
          }));
        }
        else {
          result.set(property, propertyTransitiveNode);
        }

        return result;
      },
      new Map<string, TransitiveNode>(),
    );

    const explicitProperties = Object.fromEntries(explicitPropertiesByName);

    const combinedProperties = {
      ...this.options?.enrichPropertiesWithMissedRequired && missedPropertiesFromRequired,
      ...explicitProperties,
    };

    if (isEmpty(explicitProperties)
      && !this.options?.enrichPropertiesWithMissedRequired
    ) {
      this.warnPropertiesAreIgnoredInSchema({
        messageHint: [
          'Ignored because there are no `properties`.',
          'Use `enrichPropertiesWithMissedRequired`',
          'to add missed properties as `unknown`.',
        ].join(' '),
        properties: [
          'required',
        ],
      });
    }

    return isEmpty(combinedProperties)
      ? undefined
      : combinedProperties;
  }

  private extractMissedPropertiesFromRequired(
    parentTransitiveNode: StructureTransitiveNode,
    schema: Record<string, unknown>,
  ): Record<string, TransitiveNode> | undefined {
    const requiredFromSchema = schema['required'];

    if (!Array.isArray(requiredFromSchema)) {
      return undefined;
    }

    const originalRequired = this.getDataAs('array', ['required']) ?? [];
    const filledPropertiesFromReferredSchemas = this
      .withdrawPropertiesFromReferredSchemas(
        this.props.referredTransitiveNodes ?? [],
        new Map(),
      );

    const requiredProperties = requiredFromSchema.reduce(
      (result, requiredPropertyName) => {
        if (typeof requiredPropertyName !== 'string') {
          return result;
        }

        const originalIndex = originalRequired.indexOf(requiredPropertyName);
        const source = originalIndex !== -1
          ? this.jsoncTree.getReconstructedJsonc([
              ...this.path,
              'required',
              String(originalIndex),
            ])
          : this.source;

        const referredProperty = filledPropertiesFromReferredSchemas.get(
          requiredPropertyName,
        );

        result.set(requiredPropertyName, referredProperty
          ? {
              ...referredProperty,
              isRequired: true,
            }
          : this.createUnknownTransitiveNode({
              associatedPropertyName: requiredPropertyName,
              isRequired: true,
              nestedBy: [parentTransitiveNode],
              source,
            }));

        return result;
      },
      new Map<string, TransitiveNode>(),
    );

    return Object.fromEntries(requiredProperties);
  }

  private withdrawPropertiesFromReferredSchemas(
    referredSchemas: TransitiveNode[],
    accumulator: Map<string, TransitiveNode>,
    visited = new Set<TransitiveNode>(),
  ): Map<string, TransitiveNode> {
    return referredSchemas.reduce((result, referredTransitiveNode) => {
      if (visited.has(referredTransitiveNode)) {
        return result;
      }

      visited.add(referredTransitiveNode);

      if (referredTransitiveNode.type === 'reference') {
        return this.withdrawPropertiesFromReferredSchemas(
          [referredTransitiveNode.mixin, referredTransitiveNode.ref]
            .filter((target): target is TransitiveNode => !!target),
          result,
          visited,
        );
      }

      if (referredTransitiveNode.type !== 'structure') {
        return result;
      }

      const withProperties = Object.entries(
        referredTransitiveNode.properties ?? {},
      ).reduce((properties, [key, transitiveNode]) => {
        if (!properties.has(key)) {
          properties.set(key, transitiveNode);
        }

        return properties;
      }, result);

      return this.withdrawPropertiesFromReferredSchemas(
        referredTransitiveNode.referredTransitiveNodes ?? [],
        withProperties,
        visited,
      );
    }, accumulator);
  }

  private extractPropertyPatterns(
    parentTransitiveNode: StructureTransitiveNode,
  ): StructureTransitiveNode['propertyPatterns'] {
    let propertyPatterns: StructureTransitiveNode['propertyPatterns'];

    const rootSchema = this.getDataAs('object');
    const patternProperties = this.getDataAs(
      'object',
      ['patternProperties'],
    );

    const patternPropertiesPath = [...this.path, 'patternProperties'];

    if (patternProperties && isHasPatternProperties(rootSchema)) {
      propertyPatterns = Object.keys(
        rootSchema.patternProperties,
      ).reduce<
        [RegExp, TransitiveNode][]
      >((result, patternString) => {
        const nestedSchemaPath = [...patternPropertiesPath, patternString];

        let nestedSchema = this.processNestedSchema({
          absPath: nestedSchemaPath,
          extendedPart: {
            associatedKeyPattern: patternString,
            isExcludedFromResult: true,
            // todo: describe cases isInline is false!
            //       $ref and other cases
            isInline: true,
            nestedBy: [parentTransitiveNode],
          },
        });

        if (!nestedSchema) {
          const propertySource = this.jsoncTree.getReconstructedJsonc(nestedSchemaPath);
          const propertyNode = propertySource.node;

          nestedSchema = this.createUnknownTransitiveNode({
            associatedKeyPattern: patternString,
            isRequired: false,
            nestedBy: [parentTransitiveNode],
            source: propertySource,
          });

          this.logger.warn(
            { node: propertyNode },
            [
              `Property at ${nestedSchemaPath.join('.')} was processed as \`unknown\`.`,
              getNodeErrorText(
                propertySource.getOriginalFileContent(),
                propertyNode,
                propertySource.sourceFileId,
              ),
            ].join('\n'),
          );
        }

        const regexp = createSafeRegExp(patternString);

        if (!regexp) {
          const { source } = parentTransitiveNode;
          const { node } = source;

          this.logger.warn(
            { node },
            [
              `Regular expression /${patternString}/ is wrong or unsafe! Ignored.`,
              getNodeErrorText(
                source.getOriginalFileContent(),
                node,
                source.sourceFileId,
              ),
            ].join('\n'),
          );

          return result;
        }

        result.push([regexp, nestedSchema]);

        return result;
      }, []);
    }
    else if (patternProperties) {
      this.warnPropertiesAreIgnoredInSchema({
        messageHint: 'Property `patternProperties` in schema has wrong format.',
        properties: [
          'patternProperties',
        ],
      });
    }

    return propertyPatterns?.length
      ? propertyPatterns
      : undefined;
  }

  private extractDefaultKeyPattern(
    parentTransitiveNode: StructureTransitiveNode,
  ): StructureTransitiveNode['defaultKeyPattern'] {
    const patternString = this.getDataAs(
      'string',
      ['propertyNames', 'pattern'],
    );

    if (!patternString) {
      return undefined;
    }

    const regexp = createSafeRegExp(patternString);

    if (!regexp) {
      const { source } = parentTransitiveNode;
      const { node } = source;

      this.logger.warn(
        { node },
        [
          `Regular expression /${patternString}/ is wrong or unsafe! Ignored.`,
          getNodeErrorText(
            source.getOriginalFileContent(),
            node,
            source.sourceFileId,
          ),
        ].join('\n'),
      );
    }

    return regexp ?? undefined;
  }
}
