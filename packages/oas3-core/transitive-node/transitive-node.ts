import type {
  ReconstructedJsoncValue,
  ReconstructedObjectJsoncValue,
} from './reconstructed-jsonc-value';

export type JsonSchemaTransitiveNodeType = (
  | 'array'
  | 'conditional'
  | 'intersection'
  | 'reference'
  | 'scalar'
  | 'structure'
  | 'union'
  | 'unknown'
);

export type OpenApiTransitiveNodeType = (
  | 'contentTypeRecord'
  | 'entrypointRecord'
  | 'openApiDocument'
  | 'requestRecord'
  | 'responseContentRecord'
  | 'responseHeadersRecord'
  | 'responseRecord'
);

export type TransitiveNodeType = (
  | JsonSchemaTransitiveNodeType
  | OpenApiTransitiveNodeType
);

export type ScalarTransitiveNodeType = (
  'boolean' | 'integer' | 'number' | 'null' | 'string'
);

export interface HasMixin {
  /**
   * Mixin is a common part of a schema having to be mixed
   * to every subschema. Used with `$ref`, `allOf`, `anyOf`, `oneOf`,
   * `if`/`else`, and other composite schema types.
   */
  mixin: TransitiveNode | null;
}

export interface HasSubTypes<
  TKey extends string = string,
  TSubtype extends TransitiveNode = TransitiveNode,
> {
  subTypes: Partial<Record<TKey, TSubtype>>;
}

/**
 * @see https://json-schema.org/understanding-json-schema/reference/annotations
 */
export interface AbstractTransitiveNodeAnnotations {
  comment?: string;
  default?: unknown;
  deprecated?: boolean;
  description?: string;
  examples?: unknown;
  readOnly?: boolean;
  writeOnly?: boolean;
  title?: string;
}

export interface AbstractTransitiveNode {
  annotations?: AbstractTransitiveNodeAnnotations;
  associatedArrayIndex?: number;
  associatedKeyPattern?: string;
  associatedPropertyName?: string;
  associatedRef?: string;
  /**
   * Ordered literal values combined from separate object-property value ranges.
   * fixme: to simplify
   * */
  combinedValueTuple?: unknown[];
  /**
   * Means this one is excluded from converting result
   * and available only by local link
   */
  isExcludedFromResult?: boolean;
  /** Marks a type generated from incomplete or unsupported schema details. */
  isFallbackType?: boolean;
  isInline?: boolean;
  /**
   * Marks this property as having to never appear in types.
   * Analogue of `{ propertyName?: never }` in TypeScript.
   */
  isNever?: boolean;
  isNullable?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  isWriteOnly?: boolean;
  name?: string;
  /**
   * Transitive nodes that includes this one in theirs {@link nestedTransitiveNodes}
   * Transitive nodes that includes this one in theirs {@link nestedTransitiveNodes}
   */
  nestedBy?: TransitiveNode[];
  /**
   * Transitive nodes used in nested declarations:
   * properties, array items.
   */
  nestedTransitiveNodes?: TransitiveNode[];
  /** Schemas whose matching values must be excluded from this node. */
  not?: TransitiveNode[];
  options?: Record<string, unknown>;
  rangeOfValues?: unknown[];
  /**
   * Transitive nodes that includes this one in theirs {@link referredTransitiveNodes}
   */
  referredBy?: TransitiveNode[];
  /**
   * Transitive nodes that this one referred on directly:
   * extended, implemented, and type concatenations (such as unions and intersections).
   */
  referredTransitiveNodes?: TransitiveNode[];
  source: ReconstructedJsoncValue;
  /**
   * Name that supposed to be used by previously-level transitive node
   * at recursive converting time. Has lower priority then {@link name}.
   */
  suggestedName?: string;
  /**
   * Parts of an OpenAPI operationId used for directory navigation.
   * These stay separate from tags supplied by the specification.
   */
  breadcrumbs?: string[];
  /**
   * Tags have to come from OpenAPI spec and determine subdirectories/domains.
   */
  tags?: string[];
  type: TransitiveNodeType;
}

export interface UnknownTransitiveNode extends AbstractTransitiveNode {
  type: 'unknown';
  nestedTransitiveNodes?: never;
  referredTransitiveNodes?: never;
}

export interface ArrayTransitiveNode extends AbstractTransitiveNode {
  itemsInCommon?: TransitiveNode;
  itemsTuple?: TransitiveNode[];
  maxLength?: number;
  minLength?: number;
  restItemsInTuple?: TransitiveNode;
  type: 'array';
}

export interface StructureTransitiveNode<TKey extends string = string>
  extends AbstractTransitiveNode {

  additionalProperties?: TransitiveNode | false;
  /**
   * By default, record key is `string`.
   * JsonSchema's `propertyNames` allows to change it to custom pattern.
   */
  /** Every pattern must match when several `propertyNames` schemas combine. */
  defaultKeyPattern?: RegExp | RegExp[];
  isRecursive?: boolean;
  properties?: Record<TKey, TransitiveNode>;
  propertyPatterns?: [RegExp, TransitiveNode][];
  source: ReconstructedObjectJsoncValue;
  type: 'structure';
}

interface ScalarTransitiveNodeBase<
  TScalarType extends ScalarTransitiveNodeType,
> extends AbstractTransitiveNode {
  scalarType: TScalarType;
  type: 'scalar';
}

export interface BooleanScalarTransitiveNode
  extends ScalarTransitiveNodeBase<'boolean'> {

  numberOptions?: never;
  stringOptions?: never;
}

export interface NullScalarTransitiveNode
  extends ScalarTransitiveNodeBase<'null'> {

  numberOptions?: never;
  stringOptions?: never;
}

export interface NumericScalarTransitiveNode
  extends ScalarTransitiveNodeBase<'integer' | 'number'> {

  numberOptions: {
    exclusiveMaximum?: number;
    exclusiveMinimum?: number;
    isFloat: boolean;
    maximum?: number;
    minimum?: number;
    multipleOf?: number;
  };
  stringOptions?: never;
}

export interface StringScalarTransitiveNode
  extends ScalarTransitiveNodeBase<'string'> {

  numberOptions?: never;
  stringOptions?: {
    format?: string;
    maxLength?: number;
    minLength?: number;
    pattern?: RegExp;
  };
}

export type ScalarTransitiveNode = (
  | BooleanScalarTransitiveNode
  | NullScalarTransitiveNode
  | NumericScalarTransitiveNode
  | StringScalarTransitiveNode
);

export interface RefTransitiveNode extends AbstractTransitiveNode, HasMixin {
  ref: TransitiveNode;
  type: 'reference';
}

export interface UnionTransitiveNode extends AbstractTransitiveNode, HasMixin {
  isExclusive?: boolean;
  isVariativeSchema?: boolean;
  type: 'union';
}

export interface IntersectionTransitiveNode
  extends AbstractTransitiveNode, HasMixin {

  type: 'intersection';
}

export type CombinedTransitiveNode = (
  | IntersectionTransitiveNode
  | UnionTransitiveNode
);

export interface ConditionalTransitiveNode extends AbstractTransitiveNode, HasMixin {
  /**
   * Condition could be one of two things:
   * - Complete subschema (has to be parsed as `T extends TCondition ? ...`)
   * - Depending on property (has to be parsed as `keyof T extends TKey ? ...`)
   */
  condition: TransitiveNode | string;
  positiveResult?: TransitiveNode;
  negativeResult?: TransitiveNode;
  type: 'conditional';
}

export interface ContentTypeRecordTransitiveNode extends
  AbstractTransitiveNode,
  HasSubTypes<
    string,
    JsonSchemaTransitiveNode
  > {

  type: 'contentTypeRecord';
}

export interface ResponseContentRecordTransitiveNode extends AbstractTransitiveNode,
  HasSubTypes<string, ContentTypeRecordTransitiveNode> {

  type: 'responseContentRecord';
}

export interface ResponseRecordTransitiveNode extends AbstractTransitiveNode {
  content?: ResponseContentRecordTransitiveNode;
  headerRecord?: ResponseHeadersRecordTransitiveNode;
  /**
   * Response headers keyed by HTTP status code or `default`.
   */
  headers?: Record<string, StructureTransitiveNode>;
  type: 'responseRecord';
}

export interface ResponseHeadersRecordTransitiveNode extends AbstractTransitiveNode {
  headers: Record<string, StructureTransitiveNode>;
  statuses: string[];
  type: 'responseHeadersRecord';
}

export interface RequestRecordTransitiveNode extends AbstractTransitiveNode {
  content?: ContentTypeRecordTransitiveNode;
  headers?: StructureTransitiveNode;
  type: 'requestRecord';
}

export interface EntrypointRecordTransitiveNode extends
  AbstractTransitiveNode {

  method: string;
  /**
   * Original OpenAPI operationId, when supplied by the source document.
   */
  operationId?: string;
  /**
   * Tags written on the operation.
   */
  originalTags?: string[];
  path: string;
  pathParameters?: StructureTransitiveNode;
  queryParameters?: StructureTransitiveNode;
  request?: RequestRecordTransitiveNode;
  response?: ResponseRecordTransitiveNode;
  type: 'entrypointRecord';
}

/**
 * Root of one OpenAPI document and its ordered HTTP operations.
 */
export interface OpenApiDocumentTransitiveNode extends AbstractTransitiveNode {
  entrypoints: EntrypointRecordTransitiveNode[];
  type: 'openApiDocument';
}

export type JsonSchemaTransitiveNode = (
  | ArrayTransitiveNode
  | ConditionalTransitiveNode
  | IntersectionTransitiveNode
  | RefTransitiveNode
  | ScalarTransitiveNode
  | StructureTransitiveNode
  | UnionTransitiveNode
  | UnknownTransitiveNode
);

export type OpenApiTransitiveNode = (
  | ContentTypeRecordTransitiveNode
  | EntrypointRecordTransitiveNode
  | OpenApiDocumentTransitiveNode
  | RequestRecordTransitiveNode
  | ResponseContentRecordTransitiveNode
  | ResponseHeadersRecordTransitiveNode
  | ResponseRecordTransitiveNode
);

export type TransitiveNode = (
  | JsonSchemaTransitiveNode
  | OpenApiTransitiveNode
);
