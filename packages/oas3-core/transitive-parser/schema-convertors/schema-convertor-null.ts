import { isSchemaNull } from '@codegena/oas3-core/json-schema';

import type { NullScalarTransitiveNode } from '../../transitive-node';
import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';

export type SchemaConvertorNullOptions = UnknownOptions;

const defaultOptions: SchemaConvertorNullOptions = {};

export class SchemaConvertorNull
  extends SchemaConvertorAbstract<SchemaConvertorNullOptions> {
  convert(): NullScalarTransitiveNode | null {
    const schema = this.getDataAs('object');

    if (!isSchemaNull(schema, true)) {
      return null;
    }

    return {
      scalarType: 'null',
      source: this.source,
      type: 'scalar',
    };
  }

  getDefaultOptions(): SchemaConvertorNullOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }
}
