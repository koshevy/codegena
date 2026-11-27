/* eslint-disable max-lines */
import { type Logger, defaultLogger } from '@codegena/oas3-core/logger';
import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import type { Node } from 'jsonc-parser';
import { parse } from 'pathe';

import {
  ActiveJsoncTree,
  type ActiveJsoncTreeOptions,
  type FileReadingAdapter,
  type ActiveJsoncParseOptions,
} from './active-jsonc-tree';
import { JsonParseError } from './json-parse-error';
import { isReconstructedObjectJsoncValue } from './reconstruct-jsonc-value';
import {
  isSchemaConvertorConstructor,
  type SchemaConvertor,
  type SchemaConvertorFn,
  type SchemaConvertorHooks,
  type SchemaConvertorProps,
} from './schema-convertor';
import {
  SchemaConvertorAnchor,
  SchemaConvertorArray,
  SchemaConvertorBoolean,
  SchemaConvertorDependentRequired,
  SchemaConvertorIf,
  SchemaConvertorNumber,
  SchemaConvertorNull,
  SchemaConvertorNot,
  SchemaConvertorSomeOf,
  SchemaConvertorRangeOfValues,
  SchemaConvertorSchemaAnnotation,
  SchemaConvertorOas3Content,
  SchemaConvertorOas3Document,
  SchemaConvertorOas3Operation,
  SchemaConvertorOas3Responses,
  SchemaConvertorRef,
  SchemaConvertorString,
  SchemaConvertorStructure,
  type SchemaConvertorAnchorOptions,
  SchemaConvertorVariative,
  type SchemaConvertorBooleanOptions,
  type SchemaConvertorDependentRequiredOptions,
  type SchemaConvertorArrayOptions,
  type SchemaConvertorNumberOptions,
  type SchemaConvertorNullOptions,
  type SchemaConvertorNotOptions,
  type SchemaConvertorRangeOfValuesOptions,
  type SchemaConvertorSchemaAnnotationOptions,
  type SchemaConvertorOas3ContentOptions,
  type SchemaConvertorOas3DocumentOptions,
  type SchemaConvertorOas3OperationOptions,
  type SchemaConvertorOas3ResponsesOptions,
  type SchemaConvertorRefOptions,
  type SchemaConvertorStringOptions,
  type SchemaConvertorStructureOptions,
  type SchemaConvertorVariativeOptions,
} from './schema-convertors';
import { getNodeErrorText } from './utils';
import { pascalCaseTypeName } from '../transitive-utils';

const builtInConvertors: SchemaConvertor[] = [
  SchemaConvertorSchemaAnnotation,
  SchemaConvertorOas3Document,
  SchemaConvertorOas3Operation,
  SchemaConvertorOas3Responses,
  SchemaConvertorOas3Content,
  SchemaConvertorNot,
  SchemaConvertorRangeOfValues,
  SchemaConvertorIf,
  SchemaConvertorSomeOf,
  SchemaConvertorRef,
  SchemaConvertorVariative,
  SchemaConvertorArray,
  SchemaConvertorBoolean,
  SchemaConvertorNumber,
  SchemaConvertorNull,
  SchemaConvertorString,
  SchemaConvertorDependentRequired,
  SchemaConvertorStructure,
  SchemaConvertorAnchor,
];

/**
 * Hardcoded merged options for all built-in convertors.
 */
export type BuiltInMergedOptions = (
  & SchemaConvertorAnchorOptions
  & SchemaConvertorBooleanOptions
  & SchemaConvertorDependentRequiredOptions
  & SchemaConvertorArrayOptions
  & SchemaConvertorNumberOptions
  & SchemaConvertorNullOptions
  & SchemaConvertorNotOptions
  & SchemaConvertorRangeOfValuesOptions
  & SchemaConvertorSchemaAnnotationOptions
  & SchemaConvertorOas3ContentOptions
  & SchemaConvertorOas3DocumentOptions
  & SchemaConvertorOas3OperationOptions
  & SchemaConvertorOas3ResponsesOptions
  & SchemaConvertorRefOptions
  & SchemaConvertorStringOptions
  & SchemaConvertorStructureOptions
  & SchemaConvertorVariativeOptions
);

// wrapper to closure in order to grab function context
const processNestedSchema: SchemaConvertorFn = (props) => (
  processSchema(props)
);

export function processSchema({
  alreadyProcessedSchemas,
  convertors,
  flatProcessedSchemas,
  jsoncTree,
  logger = defaultLogger,
  options,
  path,
  referredTransitiveNodes,
  referredWithName,
  schemaMixin,
  breadcrumbs,
  tags,
  schemaConvertorHooks,
  skipAddingToResult,
  skipCaching,
  skipConvertors,
  skipUnprocessableSchemaWarning = !!path.length,
}: SchemaConvertorProps): TransitiveNode | null {
  const node = jsoncTree.getNode(path);
  const reconstructedValue = jsoncTree.getReconstructedJsonc(path);
  const alreadyProcessedSchema = alreadyProcessedSchemas.get(node);

  if (!skipCaching && !schemaMixin && alreadyProcessedSchema) {
    return alreadyProcessedSchema;
  }

  let transitiveNode: TransitiveNode | null = null;
  const convertorProps = {
    alreadyProcessedSchemas,
    convertors,
    flatProcessedSchemas,
    jsoncTree,
    logger,
    options,
    path,
    processNestedSchema,
    referredTransitiveNodes,
    referredWithName,
    schemaMixin,
    breadcrumbs,
    tags,
    schemaConvertorHooks,
    skipConvertors,
  };

  for (const convertor of convertors) {
    if (skipConvertors && skipConvertors.includes(convertor)) {
      continue;
    }

    if (isSchemaConvertorConstructor(convertor)) {
      const convertorInstance = new convertor(convertorProps);

      transitiveNode = convertorInstance
        .registerHook(schemaConvertorHooks)
        .convert();
    }
    else {
      transitiveNode = convertor(convertorProps);
    }

    const inferredName = transitiveNode?.name
      ?? transitiveNode?.suggestedName
      ?? referredWithName;

    if (transitiveNode && !skipCaching && !schemaMixin) {
      alreadyProcessedSchemas.set(node, transitiveNode);
    }

    if (inferredName && transitiveNode && !transitiveNode.suggestedName) {
      transitiveNode.suggestedName = inferredName;
    }

    if (transitiveNode && !transitiveNode.tags && tags?.length) {
      transitiveNode.tags = tags;
    }

    if (transitiveNode && !transitiveNode.breadcrumbs && breadcrumbs?.length) {
      transitiveNode.breadcrumbs = breadcrumbs;
    }

    if (transitiveNode && !skipAddingToResult) {
      flatProcessedSchemas.add(transitiveNode);

      break;
    }

    if (transitiveNode) {
      break;
    }
  }

  if (!transitiveNode && !skipUnprocessableSchemaWarning) {
    const message = [
      `Unable to parse schema at path "${path.join('.')}". Skipped.`,
      getNodeErrorText(
        reconstructedValue.getOriginalFileContent(),
        node,
        reconstructedValue.sourceFileId,
      ),
    ].join('\n');

    logger.warn(
      { node, path },
      message,
    );
  }

  return transitiveNode;
}

export type ExtractTransitiveNodesFromSchemaProps<
  TMergedConvertorOptions extends SchemaConvertorProps['options'] = BuiltInMergedOptions,
> = ActiveJsoncTreeOptions & {
  convertors?: SchemaConvertor[];
  /**
   * Options common for all used convertors passed in {@link convertors}.
   * By default, is {@link BuiltInMergedOptions}.
   */
  fileReadingAdapter?: FileReadingAdapter;
  jsoncOptions?: ActiveJsoncParseOptions;
  logger?: Logger;
  mergedConvertorOptions?: TMergedConvertorOptions;
  referredWithName?: string;
};

export function extractTransitiveNodesFromSchema<
  TMergedConvertorOptions extends SchemaConvertorProps['options'] = BuiltInMergedOptions,
>(
  {
    convertors = builtInConvertors,
    fileReadingAdapter,
    jsoncOptions,
    logger = defaultLogger,
    mergedConvertorOptions,
    referredWithName,
    ...activeTreeOptions
  }: ExtractTransitiveNodesFromSchemaProps<TMergedConvertorOptions>,
): TransitiveNode[] {
  const transactionCompleteCallbacks: Array<() => void> = [];
  const jsoncTree = new ActiveJsoncTree(
    activeTreeOptions,
    jsoncOptions,
    logger,
    fileReadingAdapter,
  );
  const rootReconstructedJsonc = jsoncTree.getReconstructedJsonc();

  if (!isReconstructedObjectJsoncValue(rootReconstructedJsonc)) {
    throw new JsonParseError(
      'Expected JSON Schema or array of schemas, but got a scalar value!',
      rootReconstructedJsonc.getOriginalFileContent(),
      jsoncTree.getNode(),
      {
        jsoncParseErrors: jsoncTree.getErrors(),
        logger,
        sourceFileId: rootReconstructedJsonc.sourceFileId,
      },
    );
  }

  const schemaConvertorHooks: SchemaConvertorHooks = {
    onTransactionComplete: (callback) => {
      transactionCompleteCallbacks.push(callback);
    },
  };

  const { name: sourceFileNameBase } = parse(jsoncTree.getSourceFileId());
  const rootSchemaTitle = rootReconstructedJsonc.value['title'];
  const rootSchemaTitleTrimmed = typeof rootSchemaTitle === 'string'
    ? rootSchemaTitle.trim()
    : '';

  const rootSchemaName = pascalCaseTypeName(
    referredWithName ?? (rootSchemaTitleTrimmed || sourceFileNameBase),
  );

  const alreadyProcessedSchemas = new WeakMap<Node, TransitiveNode>();
  const flatProcessedSchemas = new Set<TransitiveNode>();

  void processSchema({
    alreadyProcessedSchemas,
    convertors,
    flatProcessedSchemas,
    jsoncTree,
    logger,
    options: mergedConvertorOptions,
    path: [],
    processNestedSchema,
    referredWithName: rootSchemaName,
    schemaConvertorHooks,
  });

  const result = [...flatProcessedSchemas].toReversed()
    .filter(({ name, suggestedName }) => name || suggestedName);

  transactionCompleteCallbacks.forEach((callback) => {
    callback();
  });

  return result;
}
