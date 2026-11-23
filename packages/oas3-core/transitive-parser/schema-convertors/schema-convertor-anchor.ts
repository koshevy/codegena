import {
  isHasAnchor,
  isHasDynamicAnchor,
} from '@codegena/oas3-core/json-schema';
import type { UnknownTransitiveNode } from '@codegena/oas3-core/transitive-node';

import {
  SchemaConvertorAbstract,
  type UnknownOptions,
} from '../schema-convertor';

export type SchemaConvertorAnchorOptions = UnknownOptions;

const defaultOptions: SchemaConvertorAnchorOptions = {};

/** Preserves a named, unconstrained schema as a referable type. */
export class SchemaConvertorAnchor
  extends SchemaConvertorAbstract<SchemaConvertorAnchorOptions> {
  convert(): UnknownTransitiveNode | null {
    const schema = this.getDataAs('object');

    if (!isHasAnchor(schema) && !isHasDynamicAnchor(schema)) {
      return null;
    }

    this.logger.warn(
      { node: this.source.node },
      'Anchor-only schema has no type constraints; using unknown.',
    );

    return {
      source: this.source,
      type: 'unknown',
    };
  }

  getDefaultOptions(): SchemaConvertorAnchorOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }
}
