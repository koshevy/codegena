import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import type {
  AnotherTransitiveNodeParsingResult,
  ProgrammingLanguageInfo,
  UltimateParserVisitor,
  UltimateParserVisitorParsingProps,
  UltimateParserVisitorResult,
  UltimateParserVisitorResultGroup,
} from '@codegena/oas3-core/ultimate-parser';
import {
  isInterfaceDeclaration,
  isModuleDeclaration,
  isTypeAliasDeclaration,
  type Node as TsNode,
  type SourceFile,
  type Statement,
} from 'typescript';

import {
  createAstToString,
  createImportDeclarations,
  getDeclarationKeySnippet,
  getTypeScriptDeclarationType,
} from './ast-utils';
import {
  collectImmediateGroupedResults,
  createFallbackVisitorResult,
  createSingleFileGroup,
  isForwardedResult,
  planSeparatedGroups,
  resetIdentifiers,
} from './misc-utils';
import { renderSeparatedGroups } from './misc-utils/render-separated-groups';
import { programmingLanguageInfo } from './programming-language-info';
import type { VisitorFnProps } from './typescript-parser-visitor-fn';
import type { TypescriptParserVisitorResult } from './typescript-parser-visitor-result';
import { defaultVisitorFns } from './typescript-parser-visitor.config';
import type { VisitorMicroContext } from './visitor-micro-context';

export class TypescriptParserVisitor implements UltimateParserVisitor<
  TsNode, SourceFile
> {
  private readonly importContexts = new WeakMap<
    UltimateParserVisitorResult<TsNode>,
    {
      microContext: VisitorMicroContext;
      transformFilePath: NonNullable<
        NonNullable<VisitorFnProps['options']>['transformFilePath']
      >;
    }
  >();

  /**
   * @param visitorFns
   * For testing purposes.
   * Needed to create mocks with custom visitor functions.
   */
  constructor(
    public visitorFns = defaultVisitorFns,
    public options?: VisitorFnProps['options'],
  ) {}

  prepareToRender(): void {
    resetIdentifiers();
  }

  async renderTransitiveNodeImports(
    intermediateResult: TypescriptParserVisitorResult,
    ownerResult = intermediateResult,
    fileNamesByAst?: Map<TsNode, string>,
  ): Promise<Statement[]> {
    return createImportDeclarations(intermediateResult, (result) => (
      fileNamesByAst?.get(result.ast)
      ?? this.getTransformedFilePath(result, ownerResult)
    ));
  }

  async groupInSeparatedFiles(
    intermediateResults: UltimateParserVisitorResult<TsNode>[],
  ): Promise<UltimateParserVisitorResultGroup<SourceFile, TsNode>[]> {
    const renderableResults = collectImmediateGroupedResults(intermediateResults);

    const { groups, fileNamesByAst } = await planSeparatedGroups(
      renderableResults,
      (result, filePath) => this.getTransformedFilePath(
        result,
        result,
        filePath,
      ),
      this.options?.getCommonDirectoryName,
    );

    return renderSeparatedGroups(groups, (result, root) => (
      this.renderTransitiveNodeImports(result, root, fileNamesByAst)
    ));
  }

  groupInSingleFile(
    intermediateResults: UltimateParserVisitorResult<TsNode>[],
  ): UltimateParserVisitorResultGroup<SourceFile, TsNode> {
    return createSingleFileGroup(intermediateResults, (firstResult) => (
      this.getTransformedFilePath(firstResult, firstResult, 'types.ts')
    ));
  }

  createFallbackType(
    transitiveNode: TransitiveNode,
  ): UltimateParserVisitorResult<TsNode> {
    return createFallbackVisitorResult(transitiveNode);
  }

  getProgrammingLanguageInfo(): ProgrammingLanguageInfo {
    return programmingLanguageInfo;
  }

  renderTransitiveNodeWithoutImports(
    props: UltimateParserVisitorParsingProps<TsNode>,
  ): UltimateParserVisitorResult<TsNode> {
    const { getAnotherByTransitiveNode, logger, transitiveNode } = props;
    const options = this.options ?? props.options;

    for (const visitor of this.visitorFns) {
      const dependencies = new Set<AnotherTransitiveNodeParsingResult<TsNode>>();
      const microContext: VisitorMicroContext = { shouldBeGroupedWith: [] };

      const result = visitor({
        getAnotherByTransitiveNode: (nestedNode) => {
          const dependency = getAnotherByTransitiveNode(nestedNode);

          dependencies.add(dependency);

          if (typeof dependency === 'function') {
            microContext.hasCycleDependencies = true;
            microContext.shouldBeGroupedWith.push(dependency);
          }

          return dependency;
        },
        transitiveNode,
        logger,
        microContext,
        options,
      });

      if (!result) {
        continue;
      }

      const groupsFromInlineDependencies = [
        ...dependencies,
      ].flatMap((dependency) => (
        typeof dependency === 'function' || !dependency.transitiveNode.isInline
          ? []
          : dependency.shouldBeGroupedWith ?? []
      ));

      const groupedWith = [
        ...new Set([
          ...(result.shouldBeGroupedWith ?? []),
          ...microContext.shouldBeGroupedWith,
          ...groupsFromInlineDependencies,
        ]),
      ];

      const directDependencies = [...new Set([
        ...(result.dependencies ?? []),
        ...dependencies,
        ...groupedWith,
      ].flatMap((dependency) => (
        isForwardedResult(dependency, result)
          ? dependency.dependencies ?? []
          : [dependency]
      )))];

      const declarationType = getTypeScriptDeclarationType(result.ast)
        ?? result.declarationType;
      let identifierName: string | undefined;

      if (isInterfaceDeclaration(result.ast)
        || isTypeAliasDeclaration(result.ast)
        || isModuleDeclaration(result.ast)
      ) {
        identifierName = result.ast.name.text;
      }

      const parsedResult = {
        ...result,
        annotationsSourceNode: transitiveNode,
        declarationType,
        dependencies: directDependencies,
        identifierName,
        keySnippet: getDeclarationKeySnippet(
          result.ast,
          transitiveNode.isInline,
        ),
        shouldBeGroupedWith: groupedWith,
        toString: createAstToString(
          result.ast,
          result.relativeFilePath,
          transitiveNode,
        ),
      };

      if (options?.transformFilePath) {
        this.importContexts.set(parsedResult, {
          microContext,
          transformFilePath: options.transformFilePath,
        });
      }

      return parsedResult;
    }

    const fallbackResult = this.createFallbackType(transitiveNode);

    if (options?.transformFilePath) {
      this.importContexts.set(
        fallbackResult,
        {
          microContext: { shouldBeGroupedWith: [] },
          transformFilePath: options.transformFilePath,
        },
      );
    }

    return fallbackResult;
  }

  private getTransformedFilePath(
    result: UltimateParserVisitorResult<TsNode>,
    ownerResult: UltimateParserVisitorResult<TsNode>,
    originalFileName = result.relativeFilePath,
  ): string {
    const importContext = this.importContexts.get(ownerResult);
    const transformFilePath = importContext?.transformFilePath
      ?? this.options?.transformFilePath;

    return transformFilePath?.(
      originalFileName,
      result.transitiveNode,
      this.importContexts.get(result)?.microContext,
    ) ?? originalFileName;
  }
}
