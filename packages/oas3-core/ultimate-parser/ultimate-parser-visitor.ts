import type { Logger } from '@codegena/oas3-core/logger';
import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';

import type { DeclarationType } from './declaration-type';

export type ProgrammingLanguage = string;

export interface ProgrammingLanguageInfo {
  programmingLanguage: ProgrammingLanguage;
  programmingLanguageVersion: string;
}

export type AnotherTransitiveNodeParsingResult<
  TAstObject extends object = object,
> = (
  | UltimateParserVisitorResult<TAstObject>
  | (() => Promise<UltimateParserVisitorResult<TAstObject>>)
);

export interface UltimateParserVisitorResult<
  TAstObject extends object = object,
> extends ProgrammingLanguageInfo {
  ast: TAstObject;
  /** The category of declaration, when this result declares one. */
  declarationType?: DeclarationType;
  /**
   * Results used by this declaration, including its inline child types.
   */
  dependencies?: AnotherTransitiveNodeParsingResult<TAstObject>[];
  /** The rendered declaration name, when this result declares an identifier. */
  identifierName?: string;
  /**
   * Stable declaration prefix, captured before formatting, for locating this
   * declaration in the final generated source.
   */
  keySnippet?: string;
  relativeFilePath: string;
  /**
   * Results that must be emitted in the same declaration group.
   */
  shouldBeGroupedWith?: AnotherTransitiveNodeParsingResult<TAstObject>[];
  toString: () => Promise<string>;
  transitiveNode: TransitiveNode;
}

export interface UltimateParserVisitorResultGroup<
  TSourceFileObject extends object = object,
  TAstObject extends object = object,
> {
  /**
   * Final output filename for the grouped source file.
   */
  fileName: string;
  groupedItems: UltimateParserVisitorResult<TAstObject>[];
  /**
   * Other declaration groups used by this group.
   */
  relatedGroups?: UltimateParserVisitorResultGroup<TSourceFileObject, TAstObject>[];
  sourceFile: TSourceFileObject;
  toString: () => Promise<string>;
}

export interface UltimateParserVisitorCommonProps<
  TAstObject extends object = object,
> {
  getAnotherByTransitiveNode: (
    transitiveNode: TransitiveNode,
  ) => AnotherTransitiveNodeParsingResult<TAstObject>;
  logger?: Logger;
  options?: {
    /**
     * Names a shared directory from its parent path and sibling directories.
     */
    getCommonDirectoryName?: (
      path: string[],
      otherDirectoriesAtParent: string[],
    ) => string;
    oneOfMode?: 'sameAsAnyOf' | 'sameAsAnyOfForRefs' | 'completeOpposition';
    transformFilePath?: (
      originalFileName: string,
      transitiveNode: TransitiveNode,
    ) => string;
  };
}

export interface UltimateParserVisitorParsingProps<
  TAstObject extends object = object,
> extends UltimateParserVisitorCommonProps<TAstObject> {
  suggestedName?: string;
  transitiveNode: TransitiveNode;
}

export interface UltimateParserVisitor<
  TAstObject extends object = object,
  TSourceFileObject extends object = object,
> {
  createFallbackType(
    transitiveNode: TransitiveNode,
  ): UltimateParserVisitorResult<TAstObject>;

  getProgrammingLanguageInfo(): ProgrammingLanguageInfo;

  /**
   * Render a node before its deferred imports are resolved.
   */
  renderTransitiveNodeWithoutImports(
    props: UltimateParserVisitorParsingProps<TAstObject>,
  ): UltimateParserVisitorResult<TAstObject>;

  /**
   * Render imports after node rendering so deferred dependencies can resolve.
   */
  renderTransitiveNodeImports(
    intermediateResult: UltimateParserVisitorResult<TAstObject>
  ): Promise<TAstObject[]>;

  groupInSeparatedFiles(
    intermediateResults: UltimateParserVisitorResult<TAstObject>[],
  ): Promise<UltimateParserVisitorResultGroup<TSourceFileObject, TAstObject>[]>;

  groupInSingleFile(
    intermediateResults: UltimateParserVisitorResult<TAstObject>[],
  ): UltimateParserVisitorResultGroup<TSourceFileObject, TAstObject>;

  /**
   * Reset visitor-local state before a new group of roots is rendered.
   */
  prepareToRender?(): void;
}
