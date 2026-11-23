import { isHasIf } from '@codegena/oas3-core/json-schema';
import type {
  ConditionalTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';

import {
  SchemaConvertorAbstract,
  SchemaConvertorHooks,
  type UnknownOptions,
} from '../schema-convertor';

export type SchemaConvertorIfOptions = UnknownOptions;

const defaultOptions: SchemaConvertorIfOptions = {};

export class SchemaConvertorIf extends SchemaConvertorAbstract<
  SchemaConvertorIfOptions
> {
  private static readonly cachedTransitiveNodes = new Map<
    string,
    ConditionalTransitiveNode
  >();

  convert(): ConditionalTransitiveNode | null {
    const schema = this.getDataAs('object');

    if (!isHasIf(schema)) {
      return null;
    }

    const cachedItemPath = this.createUniqueIdByPath(this.path);
    const cachedItem = SchemaConvertorIf.cachedTransitiveNodes.get(
      cachedItemPath,
    );

    if (cachedItem) {
      return cachedItem;
    }

    const mutableTransitiveNode: ConditionalTransitiveNode = {
      condition: this.createUnknownTransitiveNode({
        source: this.jsoncTree.getReconstructedJsonc([
          ...this.path,
          'if',
        ]),
      }),
      mixin: null,
      source: this.source,
      type: 'conditional',
    };

    SchemaConvertorIf.cachedTransitiveNodes.set(
      cachedItemPath,
      mutableTransitiveNode,
    );

    mutableTransitiveNode.condition = this.extractConditionalPart('if');

    if (schema.then) {
      mutableTransitiveNode.positiveResult = this.extractConditionalPart('then');
    }

    if (schema.else) {
      mutableTransitiveNode.negativeResult = this.extractConditionalPart('else');
    }

    mutableTransitiveNode.mixin = this.processNestedSchema({
      absPath: this.path,
      extendedPart: {
        isExcludedFromResult: true,
        isInline: true,
      },
      skipCaching: true,
      skipConvertors: [
        ...this.props.skipConvertors ?? [],
        SchemaConvertorIf,
      ],
    });

    return mutableTransitiveNode;
  }

  getDefaultOptions(): SchemaConvertorIfOptions {
    return defaultOptions;
  }

  registerHook(
    hooks: SchemaConvertorHooks,
  ): SchemaConvertorAbstract {
    hooks.onTransactionComplete(() => {
      SchemaConvertorIf.cachedTransitiveNodes.clear();
    });

    return this;
  }

  private extractConditionalPart(
    propertyName: 'else' | 'if' | 'then',
  ): TransitiveNode {
    const path = [...this.path, propertyName];
    const transitiveNode = this.processNestedSchema({
      absPath: path,
      extendedPart: {
        isExcludedFromResult: true,
        isInline: true,
      },
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
}
