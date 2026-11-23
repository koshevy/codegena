import { TypescriptParserVisitorResult } from './typescript-parser-visitor-result';

export interface VisitorMicroContext {
  hasCycleDependencies?: boolean;
  /**
   * Other results that must be emitted with the declaration being built.
   */
  shouldBeGroupedWith: (
    | TypescriptParserVisitorResult
    | (() => Promise<TypescriptParserVisitorResult>)
  )[];
}
