import { isSchemaBoolean } from '@codegena/oas3-core/json-schema';

import type { BooleanScalarTransitiveNode } from '../../transitive-node';
import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';

export type SchemaConvertorBooleanOptions = UnknownOptions;

const defaultOptions: SchemaConvertorBooleanOptions = {};

export class SchemaConvertorBoolean
  extends SchemaConvertorAbstract<SchemaConvertorBooleanOptions> {
  convert(): BooleanScalarTransitiveNode | null {
    const schema = this.getDataAs('object');

    if (!isSchemaBoolean(schema, true)) {
      return null;
    }

    return {
      scalarType: 'boolean',
      source: this.source,
      type: 'scalar',
    };
  }

  getDefaultOptions(): SchemaConvertorBooleanOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }
}
