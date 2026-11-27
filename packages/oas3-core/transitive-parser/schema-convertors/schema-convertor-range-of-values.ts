import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

import type { TransitiveNode } from '../../transitive-node';
import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';

export type SchemaConvertorRangeOfValuesOptions = UnknownOptions;

const defaultOptions: SchemaConvertorRangeOfValuesOptions = {};

export class SchemaConvertorRangeOfValues extends SchemaConvertorAbstract<
  SchemaConvertorRangeOfValuesOptions
> {
  convert(): TransitiveNode | null {
    const rangeOfValues = this.extractRangeOfValues();

    if (!rangeOfValues.length) {
      return null;
    }

    const transitiveNode = this.processNestedSchema({
      absPath: this.path,
      extendedPart: { isExcludedFromResult: true },
      skipCaching: true,
      skipConvertors: [
        ...this.props.skipConvertors ?? [],
        SchemaConvertorRangeOfValues,
      ],
    });

    if (!transitiveNode) {
      return {
        rangeOfValues,
        source: this.source,
        type: 'unknown',
      };
    }

    const {
      isExcludedFromResult: _isExcludedFromResult,
      ...reprocessedTransitiveNode
    } = transitiveNode;

    return {
      ...reprocessedTransitiveNode,
      rangeOfValues,
    };
  }

  getDefaultOptions(): SchemaConvertorRangeOfValuesOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }

  private extractRangeOfValues(): unknown[] {
    const constValue = this.jsoncTree.getData([...this.path, 'const']);
    const enumValues = this.getDataAs('array', ['enum']) ?? [];
    const values = [
      ...(constValue === undefined ? [] : [constValue]),
      ...enumValues,
    ];

    return uniqWith(values, isEqual);
  }
}
