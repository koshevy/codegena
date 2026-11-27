import {
  isHasDynamicRef,
  isHasRef,
} from '@codegena/oas3-core/json-schema';
import type {
  RefTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import trim from 'lodash/trim';

import { JsonParseError } from '../json-parse-error';
import {
  SchemaConvertorAbstract,
  SchemaConvertorHooks,
  type UnknownOptions,
} from '../schema-convertor';

export interface ExternalSchemaResolverProps<
  TFileNameOptional extends boolean = false,
> {
  fileName: TFileNameOptional extends false ? string : (string | undefined);
  localPath: string[];
}

export interface SchemaConvertorRefOptions extends UnknownOptions {
  externalSchemaResolver?: (
    props: ExternalSchemaResolverProps,
  ) => TransitiveNode | null;
}

const defaultOptions: SchemaConvertorRefOptions = {};
const refPathRegexp = /^[^#]*#\/[^#]+$/;

export class SchemaConvertorRef extends SchemaConvertorAbstract<
  SchemaConvertorRefOptions
> {
  private static readonly alreadyMetItems = new Set<string>();
  private static readonly cachedTransitiveNodes = new Map<
    string,
    RefTransitiveNode
  >();

  convert(): TransitiveNode | null {
    const schema = this.getDataAs('object');
    const hasRef = isHasRef(schema);
    const hasDynamicRef = isHasDynamicRef(schema);

    if (!hasRef && !hasDynamicRef) {
      return null;
    }

    const { externalSchemaResolver } = this.options ?? this.getDefaultOptions();
    const cachedItemPath = this.createUniqueIdByPath(this.path);
    const isAlreadyMet = SchemaConvertorRef.alreadyMetItems.has(cachedItemPath);

    if (!isAlreadyMet) {
      SchemaConvertorRef.alreadyMetItems.add(cachedItemPath);
    }

    const cachedItem = SchemaConvertorRef.cachedTransitiveNodes.get(cachedItemPath);

    if (cachedItem) {
      return cachedItem;
    }

    let refTransitiveNode: RefTransitiveNode['ref'] | null;

    const ref = hasRef ? schema.$ref : schema.$dynamicRef;
    const refLocation = hasRef
      ? this.mapRefToJsonPointer(ref)
      : this.mapDynamicRefToJsonPointer(ref);

    const localPath = refLocation?.localPath ?? [];
    const fileName = refLocation?.fileName;

    const mutableTransitiveNode = {
      type: 'reference',
      source: this.source,
      suggestedName: this.props.referredWithName,
    } as RefTransitiveNode;
    const refSuggestedName = localPath.at(-1);

    SchemaConvertorRef.cachedTransitiveNodes.set(
      cachedItemPath,
      mutableTransitiveNode,
    );

    if (!refLocation) {
      refTransitiveNode = this.createFallbackTransitiveNode();
    }
    else if (fileName && externalSchemaResolver) {
      refTransitiveNode = externalSchemaResolver({ fileName, localPath });
    }
    else if (fileName && !externalSchemaResolver) {
      refTransitiveNode = this.createFallbackTransitiveNode();
    }
    else {
      const uniquePath = this.createUniqueIdByPath(localPath);
      const isRefAlreadyMet = SchemaConvertorRef.alreadyMetItems.has(uniquePath);

      if (!isRefAlreadyMet) {
        SchemaConvertorRef.alreadyMetItems.add(uniquePath);
      }

      refTransitiveNode = this.processNestedSchema({
        absPath: localPath,
        extendedPart: {
          isExcludedFromResult: isRefAlreadyMet,
          referredBy: [mutableTransitiveNode],
          suggestedName: refSuggestedName,
        },
      });
    }

    refTransitiveNode ||= this.createFallbackTransitiveNode();

    mutableTransitiveNode.ref = refTransitiveNode;
    mutableTransitiveNode.mixin = this.processNestedSchema({
      absPath: this.path,
      extendedPart: {
        isInline: true,
        isExcludedFromResult: true,
        referredTransitiveNodes: [refTransitiveNode],
        suggestedName: this.props.referredWithName,
      },
      skipCaching: true,
      skipConvertors: [
        ...this.props.skipConvertors ?? [],
        SchemaConvertorRef,
      ],
    });

    if (mutableTransitiveNode.mixin) {
      mutableTransitiveNode.referredBy = [
        mutableTransitiveNode.mixin,
      ];
    }

    return mutableTransitiveNode;
  }

  getDefaultOptions(): SchemaConvertorRefOptions {
    return defaultOptions;
  }

  registerHook(
    hooks: SchemaConvertorHooks,
  ): SchemaConvertorAbstract {
    hooks.onTransactionComplete(() => {
      if (SchemaConvertorRef.alreadyMetItems.size > 0) {
        SchemaConvertorRef.alreadyMetItems.clear();
      }

      if (SchemaConvertorRef.cachedTransitiveNodes.size > 0) {
        SchemaConvertorRef.cachedTransitiveNodes.clear();
      }
    });

    return this;
  }

  private createFallbackTransitiveNode(): TransitiveNode {
    return this.createUnknownTransitiveNode({
      isRequired: true,
      source: this.source,
    });
  }

  private createUniqueIdByPath(path: string[]): string {
    return [
      this.props.jsoncTree.getSourceFileId(),
      '#',
      ...path,
    ].join('/');
  }

  private mapDynamicRefToJsonPointer(
    ref: string,
  ): ExternalSchemaResolverProps<true> | null {
    if (/^[^#]+#[A-Za-z_][-A-Za-z0-9._]*$/.test(ref)) {
      this.logger.warn(
        { node: this.source.node },
        `$dynamicRef ${ref} cannot be resolved: external anchors are not indexed`,
      );
      return null;
    }

    if (ref !== '#'
      && ref.startsWith('#')
      && !ref.startsWith('#/')
    ) {
      const anchorName = ref.slice(1);
      const anchorNode = this.jsoncTree.getAnchor(anchorName);

      if (!anchorNode) {
        this.logger.warn(
          { node: this.source.node },
          `$dynamicRef ${ref} cannot be resolved: anchor is not indexed`,
        );
        return null;
      }

      return {
        fileName: undefined,
        localPath: anchorNode.jsonPath,
      };
    }

    return this.mapRefToJsonPointer(ref, '$dynamicRef');
  }

  private mapRefToJsonPointer(
    ref: string,
    keyword: '$ref' | '$dynamicRef' = '$ref',
  ): ExternalSchemaResolverProps<true> {
    if (trim(ref, ' /') === '#') {
      return {
        fileName: undefined,
        localPath: [],
      };
    }

    if (!refPathRegexp.test(ref)) {
      throw new JsonParseError(
        `${keyword} ${ref} is not correct JSON Schema Reference`,
        this.source.getOriginalFileContent(),
        this.source.node,
        {
          logger: this.logger,
          sourceFileId: this.source.sourceFileId,
        },
      );
    }

    const [
      fileName,
      localPathString,
    ] = ref.split('#');

    const localPath = localPathString.split('/').filter(Boolean);

    return { fileName, localPath };
  }
}
