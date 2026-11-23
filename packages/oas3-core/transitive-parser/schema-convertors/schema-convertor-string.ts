import { isSchemaString } from '@codegena/oas3-core/json-schema';

import type { StringScalarTransitiveNode } from '../../transitive-node';
import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';
import { createSafeRegExp } from './create-safe-regexp';

export type SchemaConvertorStringOptions = UnknownOptions;

const defaultOptions: SchemaConvertorStringOptions = {};

export class SchemaConvertorString
  extends SchemaConvertorAbstract<SchemaConvertorStringOptions> {
  convert(): StringScalarTransitiveNode | null {
    const schema = this.getDataAs('object');

    if (!isSchemaString(schema, true)) {
      return null;
    }

    const mergedSchema = this.mergeSchemaWithMixin(schema);
    const stringOptions = this.extractStringOptions(mergedSchema);

    return {
      scalarType: 'string',
      source: this.source,
      type: 'scalar',
      ...(stringOptions && { stringOptions }),
    };
  }

  getDefaultOptions(): SchemaConvertorStringOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }

  private extractStringOptions(
    schema: Record<string, unknown>,
  ): StringScalarTransitiveNode['stringOptions'] {
    const format = schema['format'];
    const maxLength = schema['maxLength'];
    const minLength = schema['minLength'];
    const pattern = this.extractPattern(schema);

    if (typeof format !== 'string'
      && typeof maxLength !== 'number'
      && typeof minLength !== 'number'
      && pattern === undefined
    ) {
      return undefined;
    }

    return {
      ...((typeof format === 'string') && { format }),
      ...((typeof maxLength === 'number') && { maxLength }),
      ...((typeof minLength === 'number') && { minLength }),
      ...(pattern && { pattern }),
    };
  }

  private extractPattern(schema: Record<string, unknown>): RegExp | undefined {
    const pattern = schema['pattern'];

    if (typeof pattern !== 'string') {
      return undefined;
    }

    const regexp = createSafeRegExp(pattern);

    if (!regexp) {
      this.logger.warn(
        { node: this.source.node },
        'Unable to safely parse string pattern. Used string as a fallback.',
      );
    }

    return regexp ?? undefined;
  }
}
