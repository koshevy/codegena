import { isHasNot } from '@codegena/oas3-core/json-schema';
import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';

import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';

export type SchemaConvertorNotOptions = UnknownOptions;

const defaultOptions: SchemaConvertorNotOptions = {};

export class SchemaConvertorNot extends SchemaConvertorAbstract<
  SchemaConvertorNotOptions
> {
  convert(): TransitiveNode | null {
    const schema = this.getDataAs('object');

    if (!isHasNot(schema)) {
      if (typeof schema === 'object'
        && schema !== null
        && 'not' in schema
      ) {
        this.logger.warn(
          { node: this.source.node },
          'Ignored not: expected a JSON Schema object or boolean.',
        );
      }

      return null;
    }

    const transitiveNode = this.processNestedSchema({
      absPath: this.path,
      extendedPart: { isExcludedFromResult: true },
      skipCaching: true,
      skipConvertors: [
        ...this.props.skipConvertors ?? [],
        SchemaConvertorNot,
      ],
    });

    const excludedNode = this.processNestedSchema({
      absPath: [...this.path, 'not'],
      extendedPart: { isExcludedFromResult: true, isInline: true },
    });

    if (!excludedNode
      || excludedNode.type === 'unknown'
      || excludedNode.isFallbackType
    ) {
      this.logger.warn(
        { node: this.source.node },
        'Ignored not: nested conversion returned an unknown or fallback node.',
      );

      if (!transitiveNode) {
        return null;
      }

      const {
        isExcludedFromResult: _excludedFromOriginal,
        ...originalNode
      } = transitiveNode;

      return originalNode;
    }

    const {
      isExcludedFromResult: _isExcludedFromResult,
      ...baseNode
    } = transitiveNode ?? this.createUnknownTransitiveNode({
      source: this.source,
    });

    return {
      ...baseNode,
      not: [...baseNode.not ?? [], excludedNode],
    };
  }

  getDefaultOptions(): SchemaConvertorNotOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }
}
