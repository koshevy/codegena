import {
  isSchemaInteger,
  isSchemaNumber,
  isVariativeSchema,
} from '@codegena/oas3-core/json-schema';

import type {
  NumericScalarTransitiveNode,
  ScalarTransitiveNodeType,
} from '../../transitive-node';
import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';

export type SchemaConvertorNumberOptions = UnknownOptions;

const defaultOptions: SchemaConvertorNumberOptions = {};

export class SchemaConvertorNumber
  extends SchemaConvertorAbstract<SchemaConvertorNumberOptions> {
  convert(): NumericScalarTransitiveNode | null {
    const schema = this.getDataAs('object');
    const isInteger = isSchemaInteger(schema, true);
    const isNumber = isSchemaNumber(schema, true);

    if (!isInteger && !isNumber) {
      return null;
    }

    const isVariativeNumber = isVariativeSchema(schema, 'number');
    const mergedSchema = this.mergeSchemaWithMixin(schema);
    const scalarType = isNumber && (!isInteger || isVariativeNumber)
      ? 'number'
      : 'integer';

    return {
      numberOptions: this.extractNumberOptions(scalarType, mergedSchema),
      scalarType,
      source: this.source,
      type: 'scalar',
    };
  }

  getDefaultOptions(): SchemaConvertorNumberOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }

  private extractNumberOptions(
    schemaType: Extract<ScalarTransitiveNodeType, 'integer' | 'number'>,
    schema: Record<string, unknown>,
  ): NumericScalarTransitiveNode['numberOptions'] {
    const exclusiveMaximum = schema['exclusiveMaximum'];
    const exclusiveMinimum = schema['exclusiveMinimum'];
    const maximum = schema['maximum'];
    const minimum = schema['minimum'];
    const multipleOf = schema['multipleOf'];

    return {
      ...((typeof exclusiveMaximum === 'number') && { exclusiveMaximum }),
      ...((typeof exclusiveMinimum === 'number') && { exclusiveMinimum }),
      isFloat: schemaType === 'number',
      ...((typeof maximum === 'number') && { maximum }),
      ...((typeof minimum === 'number') && { minimum }),
      ...((typeof multipleOf === 'number') && { multipleOf }),
    };
  }
}
