/* eslint-disable max-lines */
import type { Logger } from '@codegena/oas3-core/logger';
import type {
  AbstractTransitiveNode,
  TransitiveNode,
  UnknownTransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import type { Node } from 'jsonc-parser';
import merge from 'lodash/merge';

import type { ActiveJsoncTree } from './active-jsonc-tree';
import type {
  ExpectedValueType,
  ExpectingValue,
} from './active-jsonc-tree/expecting-value';
import { JsonParseError } from './json-parse-error';
import type { ReconstructedJsoncValue } from './reconstruct-jsonc-value';
import { getNodeErrorText } from './utils';

export type UnknownOptions = Record<string, unknown>;

export interface SchemaConvertorHooks {
  onTransactionComplete: (callback: () => void) => void;
}

export interface SchemaConvertorProps<
  TOptions extends UnknownOptions = UnknownOptions,
> extends Pick<
    AbstractTransitiveNode,
    'referredTransitiveNodes'
  > {
  alreadyProcessedSchemas: WeakMap<Node, TransitiveNode>;
  convertors: SchemaConvertor[];
  flatProcessedSchemas: Set<TransitiveNode>;
  jsoncTree: ActiveJsoncTree;
  logger: Logger;
  options?: TOptions;
  path: string[];
  processNestedSchema: SchemaConvertorFn;
  processAsInline?: boolean;
  referredWithName?: string;
  schemaMixin?: Record<string, unknown>;
  breadcrumbs?: string[];
  tags?: string[];
  schemaConvertorHooks: SchemaConvertorHooks;
  skipCaching?: boolean;
  skipAddingToResult?: boolean;
  skipConvertors?: SchemaConvertor[];
  skipUnprocessableSchemaWarning?: boolean;
}

export interface ProcessNestedSchemaProps
  extends Pick<
    SchemaConvertorProps,
    | 'schemaMixin'
    | 'skipCaching'
    | 'skipConvertors'
    | 'skipUnprocessableSchemaWarning'
  > {
  absPath: string[];
  extendedPart?: Pick<
    AbstractTransitiveNode,
    | 'associatedArrayIndex'
    | 'associatedKeyPattern'
    | 'associatedPropertyName'
    | 'breadcrumbs'
    | 'isExcludedFromResult'
    | 'isInline'
    | 'isRequired'
    | 'nestedBy'
    | 'options'
    | 'referredBy'
    | 'referredTransitiveNodes'
    | 'suggestedName'
    | 'tags'
  >;
}

export type SchemaConvertorFn<
  TOptions extends UnknownOptions = UnknownOptions,
> = (
  props: SchemaConvertorProps<Partial<TOptions>>,
) => TransitiveNode | null;

/**
 * Convertor in a line of prioritized convertors.
 * It supposed, the line of `SchemaConvertor` implementations consequently
 * visit schema until the result.
 */
export abstract class SchemaConvertorAbstract<
  TOptions extends UnknownOptions = UnknownOptions,
>
implements Omit<
  SchemaConvertorProps<Partial<TOptions>>,
  'processNestedSchema' | 'schemaConvertorHooks'
> {
  constructor(
    protected props: SchemaConvertorProps<TOptions>,
  ) {}

  get alreadyProcessedSchemas(): SchemaConvertorProps['alreadyProcessedSchemas'] {
    return this.props.alreadyProcessedSchemas;
  }

  get convertors(): SchemaConvertorProps['convertors'] {
    return this.props.convertors;
  }

  get flatProcessedSchemas(): SchemaConvertorProps['flatProcessedSchemas'] {
    return this.props.flatProcessedSchemas;
  }

  get jsoncTree(): SchemaConvertorProps['jsoncTree'] {
    return this.props.jsoncTree;
  }

  get logger(): SchemaConvertorProps['logger'] {
    return this.props.logger;
  }

  get options(): TOptions | undefined {
    return {
      ...this.getDefaultOptions(),
      ...this.props.options ?? {},
    };
  }

  get path(): SchemaConvertorProps['path'] {
    return this.props.path;
  }

  get processAsInline(): SchemaConvertorProps['processAsInline'] {
    return this.props.processAsInline;
  }

  get referredWithName(): SchemaConvertorProps['referredWithName'] {
    return this.props.referredWithName;
  }

  get schemaMixin(): SchemaConvertorProps['schemaMixin'] {
    return this.props.schemaMixin;
  }

  get tags(): SchemaConvertorProps['tags'] {
    return this.props.tags;
  }

  get breadcrumbs(): SchemaConvertorProps['breadcrumbs'] {
    return this.props.breadcrumbs;
  }

  get source(): ReconstructedJsoncValue {
    return this.jsoncTree.getReconstructedJsonc(this.path);
  }

  getDataAs<
    TExpectedValueType extends ExpectedValueType,
  >(
    expectingValueType: TExpectedValueType | TExpectedValueType[],
    subPath: string[] = [],
  ): ExpectingValue<TExpectedValueType> | undefined {
    return this.jsoncTree.getDataAs(
      expectingValueType,
      [...this.path, ...subPath],
    );
  }

  protected mergeSchemaWithMixin(schema: object): Record<string, unknown> {
    const mergedSchema = merge({}, this.props.schemaMixin ?? {}, schema);
    const mixinRequired = this.props.schemaMixin?.['required'];
    const schemaRequired = 'required' in schema
      ? schema.required
      : undefined;

    if (Array.isArray(mixinRequired) && Array.isArray(schemaRequired)) {
      mergedSchema['required'] = [...new Set([
        ...mixinRequired,
        ...schemaRequired,
      ])];
    }

    return mergedSchema;
  }

  protected processNestedSchema({
    absPath,
    extendedPart = {},
    skipCaching = false,
    skipConvertors,
    schemaMixin,
    skipUnprocessableSchemaWarning = true,
  }: ProcessNestedSchemaProps): TransitiveNode | null {
    const isSamePath = absPath.length === this.path.length
      && absPath.every((part, index) => part === this.path[index]);

    const nestedSchemaMixin = schemaMixin
      ?? (isSamePath ? this.props.schemaMixin : undefined);

    const originalTransitiveNode = this.props.processNestedSchema({
      ...this.props,
      path: absPath,
      schemaMixin: nestedSchemaMixin,
      skipAddingToResult: extendedPart.isExcludedFromResult,
      skipCaching: skipCaching || !!nestedSchemaMixin,
      skipConvertors,
      skipUnprocessableSchemaWarning,
      referredTransitiveNodes: extendedPart.referredTransitiveNodes,
      referredWithName: extendedPart.suggestedName
        ?? (isSamePath ? this.props.referredWithName : undefined),
      breadcrumbs: extendedPart.breadcrumbs ?? this.props.breadcrumbs,
      tags: extendedPart.tags ?? this.props.tags,
    });

    if (!originalTransitiveNode) {
      return originalTransitiveNode;
    }

    const { referredTransitiveNodes, ...metadata } = extendedPart;

    // Child and reference nodes already hold this object's identity.
    Object.defineProperties(
      originalTransitiveNode,
      Object.getOwnPropertyDescriptors(metadata),
    );

    if (referredTransitiveNodes
      && originalTransitiveNode.type !== 'union'
      && originalTransitiveNode.type !== 'intersection'
    ) {
      originalTransitiveNode.referredTransitiveNodes = referredTransitiveNodes;
    }

    return originalTransitiveNode;
  }

  protected createUnknownTransitiveNode(
    props: Pick<
      UnknownTransitiveNode,
      | 'associatedArrayIndex'
      | 'associatedKeyPattern'
      | 'associatedPropertyName'
      | 'isRequired'
      | 'nestedBy'
      | 'source'
    >,
  ): UnknownTransitiveNode {
    return {
      isExcludedFromResult: true,
      isInline: true,
      type: 'unknown',
      ...props,
    };
  }

  protected warnPropertiesAreIgnoredInSchema({
    logLevel = 'warn',
    messageHint,
    properties,
    subPath = [],
  }: {
    logLevel?: 'info' | 'warn';
    messageHint?: string;
    properties: string[];
    subPath?: string[];
  }): void {
    const schemaSource = this.jsoncTree.getDataAs(
      'object',
      subPath,
    );

    if (!schemaSource) {
      return;
    }

    properties.forEach((propertyName) => {
      const propertyJsonc = this.getIgnoredPropertyJsonc(
        [...this.path, ...subPath, propertyName],
      );

      if (!propertyJsonc) {
        return;
      }

      const stringPath = subPath.join('.') || 'root schema';
      const message = [
        `Property "${propertyName}" at ${stringPath} was ignored.`,
        ...(messageHint ? [messageHint] : []),
        getNodeErrorText(
          propertyJsonc.getOriginalFileContent(),
          propertyJsonc.node,
          propertyJsonc.sourceFileId,
        ),
      ].join('\n');

      this.logger[logLevel]({ node: propertyJsonc.node }, message);
    });
  }

  private getIgnoredPropertyJsonc(
    path: string[],
  ): ReconstructedJsoncValue | null {
    try {
      return this.jsoncTree.getReconstructedJsonc(path, true);
    }
    catch (error) {
      if (error instanceof JsonParseError) {
        return null;
      }

      throw error;
    }
  }

  abstract convert(): TransitiveNode | null;
  abstract getDefaultOptions(): TOptions;

  /**
   * Registers cleanup for the end of the current schema conversion.
   */
  abstract registerHook(hooks: SchemaConvertorHooks): SchemaConvertorAbstract;
}

export type SchemaConvertorConstructor<
  TOptions extends UnknownOptions = UnknownOptions,
> = new (
  prop: SchemaConvertorProps<TOptions>,
) => SchemaConvertorAbstract<TOptions>;

export type SchemaConvertor<
  TOptions extends UnknownOptions = UnknownOptions,
> = (
  | SchemaConvertorFn<TOptions>
  | SchemaConvertorConstructor<TOptions>
);

export function isSchemaConvertorConstructor(
  value: SchemaConvertor,
): value is SchemaConvertorConstructor {
  return !!value?.prototype?.constructor?.prototype;
}
