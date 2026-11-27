import { isVariativeSchema } from '@codegena/oas3-core/json-schema';
import type {
  TransitiveNode,
  UnionTransitiveNode,
} from '@codegena/oas3-core/transitive-node';

import {
  SchemaConvertorAbstract,
  type SchemaConvertorConstructor,
  type UnknownOptions,
} from '../schema-convertor';
import { SchemaConvertorArray } from './schema-convertor-array';
import { SchemaConvertorBoolean } from './schema-convertor-boolean';
import { SchemaConvertorNull } from './schema-convertor-null';
import { SchemaConvertorNumber } from './schema-convertor-number';
import { SchemaConvertorString } from './schema-convertor-string';
import { SchemaConvertorStructure } from './schema-convertor-structure';

export type SchemaConvertorVariativeOptions = UnknownOptions;

const defaultOptions: SchemaConvertorVariativeOptions = {};

const nestedConvertors: SchemaConvertorConstructor[] = [
  SchemaConvertorArray,
  SchemaConvertorBoolean,
  SchemaConvertorNumber,
  SchemaConvertorNull,
  SchemaConvertorString,
  SchemaConvertorStructure,
];

export class SchemaConvertorVariative extends SchemaConvertorAbstract<
  SchemaConvertorVariativeOptions
> {
  convert(): UnionTransitiveNode | null {
    const schema = this.getDataAs('object');

    if (!isVariativeSchema(schema)) {
      return null;
    }

    const referredTransitiveNodes = nestedConvertors
      .map((Convertor) => this.convertVariativeSchema(Convertor))
      .filter((transitiveNode): transitiveNode is TransitiveNode => (
        !!transitiveNode
      ));

    if (!referredTransitiveNodes.length) {
      return null;
    }

    const variativeTransitiveNode: UnionTransitiveNode = {
      isVariativeSchema: true,
      mixin: null,
      referredTransitiveNodes,
      source: this.source,
      type: 'union',
    };

    referredTransitiveNodes.forEach((transitiveNode) => {
      transitiveNode.referredBy = [
        ...transitiveNode.referredBy ?? [],
        variativeTransitiveNode,
      ];
    });

    return variativeTransitiveNode;
  }

  getDefaultOptions(): SchemaConvertorVariativeOptions {
    return defaultOptions;
  }

  registerHook(): SchemaConvertorAbstract {
    return this;
  }

  private convertVariativeSchema(
    Convertor: SchemaConvertorConstructor,
  ): TransitiveNode | null {
    const convertor = new Convertor(this.props);

    return convertor
      .registerHook(this.props.schemaConvertorHooks)
      .convert();
  }
}
