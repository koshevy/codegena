/* eslint-disable max-lines */
import {
  defaultLogger,
  type Logger,
} from '@codegena/oas3-core/logger';
import {
  type ParseOptions as JsoncParseOptions,
  type ParseError as JsoncParseError,
  type Node,
  parseTree,
} from 'jsonc-parser';
import get from 'lodash/get';
import trim from 'lodash/trim';

import type { ExpectingValue, ExpectedValueType } from './expecting-value';
import type { FileReadingAdapter } from './file-reading-adapter';
import { nodeFileReadingAdapter } from './file-reading-adapters';
import { isAnchorName } from '../../json-schema';
import { JsonParseError } from '../json-parse-error';
import {
  isHasJsonEntriesList,
  isReconstructedArrayJsoncValue,
  isReconstructedObjectJsoncValue,
  isReconstructedScalarJsoncValue,
  reconstructJsonc,
  type ReconstructedJsoncValue,
} from '../reconstruct-jsonc-value';
import { getNodeErrorText } from '../utils';

const schemaDataKeywords = new Set([
  'const',
  'default',
  'enum',
  'examples',
]);

export type ActiveJsoncTreeOptions = (
  // When need to load file path
  | {
    /**
     * Absolute path of a JSONC path to be loaded
     */
    srcFilePath: string;
  }
  // When file content already loaded
  | {
    jsoncTextData: string;
    srcFileId: string;
  }
) & {
  jsoncParseOptions?: JsoncParseOptions;
};

export type ActiveJsoncParseOptions = JsoncParseOptions;

export class ActiveJsoncTree {
  private readonly anchors = new Map<
    string,
    ReconstructedJsoncValue
  >();

  private readonly jsoncParseErrors: JsoncParseError[] = [];
  private readonly jsoncTextData: string;
  private readonly reconstructedJsonc: ReconstructedJsoncValue;
  private readonly srcFileId: string;

  constructor(
    options: ActiveJsoncTreeOptions,
    jsoncParseOptions: JsoncParseOptions = {
      allowEmptyContent: true,
      allowTrailingComma: true,
      disallowComments: false,
    },
    private logger: Logger = defaultLogger,
    fileReadingAdapter: FileReadingAdapter = nodeFileReadingAdapter,
  ) {
    if ('srcFilePath' in options) {
      this.jsoncTextData = fileReadingAdapter.readFile(options.srcFilePath);
      this.srcFileId = options.srcFilePath;
    }
    else {
      this.jsoncTextData = options.jsoncTextData;
      this.srcFileId = options.srcFileId;
    }

    const jsonc = parseTree(
      this.jsoncTextData,
      this.jsoncParseErrors,
      jsoncParseOptions,
    );

    if (!jsonc || this.jsoncParseErrors.length) {
      throw this.newJsoncError(
        'Met syntax error when tried to parse JSON tree',
        null,
      );
    }

    this.reconstructedJsonc = reconstructJsonc(
      jsonc,
      this.srcFileId,
      () => this.jsoncTextData,
      [],
    );

    this.extractAnchors();
  }

  getAllAnchors(): string[] {
    return [...this.anchors.keys()].toSorted();
  }

  getAllJsonPaths(): string[] {
    return isHasJsonEntriesList(this.reconstructedJsonc)
      ? this.reconstructedJsonc.jsonEntries
      : [];
  }

  getAnchor(anchor: string): ReconstructedJsoncValue | undefined {
    return this.anchors.get(anchor);
  }

  getData(path?: string | string[]): unknown {
    const rootValue = this.reconstructedJsonc.value;
    const normalizedPath = this.getNormalizedPath(path);

    if (!normalizedPath.length) {
      return rootValue;
    }

    return get(rootValue, normalizedPath);
  }

  /**
   * Gets value and ensures that the value has appropriate type.
   * Returns `undefined` and adds warn if the value doesn't meet expectations.
   */
  getDataAs<T extends ExpectedValueType>(
    expectingValueType: T | T[],
    path?: string | string[],
    shouldWarnIfNotSet = false,
  ): ExpectingValue<T> | undefined {
    const normalizedPath = this.getNormalizedPath(path);
    const expectingValueTypes = Array.isArray(expectingValueType)
      ? expectingValueType
      : [expectingValueType];

    const errorMessage = [
      `Value at path "${normalizedPath.join('.')}" expected to be:`,
      expectingValueTypes.join(', '),
    ].join('\n');

    const reconstructedJsonc = normalizedPath.reduce<
      ReconstructedJsoncValue | undefined
    >((current, pathPiece) => {
      if (!current) {
        return current;
      }

      if (isReconstructedArrayJsoncValue(current)) {
        return this.isNumericKey(pathPiece)
          ? current.items.at(Number(pathPiece))
          : undefined;
      }

      return isReconstructedObjectJsoncValue(current)
        ? current.properties[pathPiece]
        : undefined;
    }, this.reconstructedJsonc);

    if (!reconstructedJsonc) {
      if (shouldWarnIfNotSet) {
        this.logger.warn(errorMessage);
      }

      return undefined;
    }

    const value = reconstructedJsonc.value;

    // trying to meet an expected type
    for (const possibleValueType of expectingValueTypes) {
      if (['string', 'boolean', 'number'].includes(possibleValueType)) {
        return typeof value === possibleValueType
          ? value as ExpectingValue<T>
          : undefined;
      }

      if (possibleValueType === 'array') {
        return Array.isArray(value)
          ? value as ExpectingValue<T>
          : undefined;
      }

      if (possibleValueType === 'object') {
        return possibleValueType === 'object' && !!possibleValueType
          ? value as ExpectingValue<T>
          : undefined;
      }
    }

    this.logger.warn({ node: reconstructedJsonc.node }, errorMessage);

    return undefined;
  }

  getErrors(): JsoncParseError[] {
    return this.jsoncParseErrors;
  }

  /**
   * @throws JsonParseError
   */
  getReconstructedJsonc(
    path?: string | string[],
    shouldSkipLoggingAtErrors = false,
  ): ReconstructedJsoncValue {
    const root = this.reconstructedJsonc;
    const normalizedPath = this.getNormalizedPath(path);

    if (!normalizedPath.length) {
      return root;
    }

    return normalizedPath.reduce<
      ReconstructedJsoncValue
    >((prevResult, pathPiece) => {
      const breadcrumbs = [...prevResult.jsonPath, pathPiece];
      const levelErrorPrefix = (
        `Tried attempting path ${breadcrumbs.join('.')}:`
      );

      if (isReconstructedScalarJsoncValue(prevResult)) {
        throw this.newJsoncError(
          [
            levelErrorPrefix,
            `scalar value "${prevResult.value}" can't have subitems!`,
          ].join('\n'),
          prevResult.node,
          shouldSkipLoggingAtErrors,
        );
      }

      let result: ReconstructedJsoncValue | undefined;

      if (isReconstructedArrayJsoncValue(prevResult)
        && this.isNumericKey(pathPiece)
      ) {
        result = prevResult.items.at(Number(pathPiece));
      }
      else if (!isReconstructedObjectJsoncValue(prevResult)) {
        throw this.newJsoncError(
          [
            levelErrorPrefix,
            `expected object value accessing key "${pathPiece}", but got an array!`,
          ].join('\n'),
          prevResult.node,
          shouldSkipLoggingAtErrors,
        );
      }
      else {
        result = prevResult.properties[pathPiece];
      }

      if (!result) {
        throw this.newJsoncError(
          [
            levelErrorPrefix,
            `got no value accessing key "${pathPiece}"!`,
          ].join('\n'),
          prevResult.node,
          shouldSkipLoggingAtErrors,
        );
      }

      return result;
    }, root);
  }

  getNode(path?: string | string[]): Node {
    return this.getReconstructedJsonc(path).node;
  }

  getSourceFileId(): string {
    return this.srcFileId;
  }

  private getNormalizedPath(
    path?: string | string[],
  ): string[] {
    if (!path || path.length === 0) {
      return [];
    }

    const unfiltered = typeof path === 'string'
      ? trim(path, './').trim().split(/[/\\.]/)
      : path;

    return unfiltered
      .map((piece) => piece.trim())
      .filter((piece) => piece.length > 0);
  }

  private isNumericKey(key: string): boolean {
    return !Number.isNaN(Number(key));
  }

  private newJsoncError(
    messageHint: string,
    node: Node | null,
    shouldSkipLogging = false,
  ): JsonParseError {
    return new JsonParseError(
      messageHint,
      this.jsoncTextData,
      node,
      {
        jsoncParseErrors: this.jsoncParseErrors,
        logger: shouldSkipLogging ? false : this.logger,
        sourceFileId: this.srcFileId,
      },
    );
  }

  private extractAnchors(): void {
    const anchorPaths = this.getAllJsonPaths()
      .map((path) => path.split('.'))
      .filter((path) => {
        const keyword = path.at(-1);

        return (keyword === '$anchor' || keyword === '$dynamicAnchor')
          && path.every((part) => !schemaDataKeywords.has(part));
      });

    for (const path of anchorPaths) {
      const anchorNode = this.getReconstructedJsonc(path);
      const anchorName = anchorNode.value;

      if (!isAnchorName(anchorName)) {
        const message = [
          `Anchor ignored at ${path.join('.')}.`,
          'Expected a valid anchor name.',
          getNodeErrorText(
            this.jsoncTextData,
            anchorNode.node,
            this.srcFileId,
          ),
        ].join('\n');

        this.logger.warn({ node: anchorNode.node }, message);
        continue;
      }

      this.anchors.set(
        anchorName,
        this.getReconstructedJsonc(path.slice(0, -1)),
      );
    }
  }
}
