import { defaultLogger, type Logger } from '@codegena/oas3-core/logger';
import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';

import {
  type ProgrammingLanguage,
  UltimateParserVisitor,
  type UltimateParserVisitorResult,
  type UltimateParserVisitorResultGroup,
} from './ultimate-parser-visitor';

export type UltimateParserResultKey = (
  `${ProgrammingLanguage}:${string}`
);

export type UltimateParserResult = Record<
  UltimateParserResultKey,
  UltimateParserVisitorResult[]
>;

type RenderTransitiveNodeResult = ReturnType<
  UltimateParserVisitor['renderTransitiveNodeWithoutImports']
>;
type UltimateParserVisitorResultMap = Map<
  string,
  UltimateParserVisitorResult
>;
type UltimateParserVisitorResultPromiseMap = Map<
  string,
  () => Promise<RenderTransitiveNodeResult>
>;

export class UltimateParser {
  private static visitors: UltimateParserVisitor[] = [];

  private visitorCaches = new WeakMap<
    UltimateParserVisitor,
    UltimateParserVisitorResultMap
  >();

  /**
   * Stores info about the meet transitive nodes between sessions.
   * Helps to resolve cycle dependencies.
   */
  private visitorOccurrences = new WeakMap<
    UltimateParserVisitor,
    UltimateParserVisitorResultPromiseMap
  >();

  constructor(
    private visitors = UltimateParser.visitors,
    private logger = defaultLogger,
  ) {
    if (!visitors.length) {
      throw new Error('Parser visitors not set!');
    }
  }

  static registerVisitors(
    visitors: UltimateParserVisitor | UltimateParserVisitor[],
  ): void {
    UltimateParser.visitors = Array.isArray(visitors)
      ? visitors
      : [visitors];
  }

  /**
   * Caching and cycle dependencies resolving middleware
   * for visitors.
   */
  renderTransitiveNodeWithoutImports(
    visitor: UltimateParserVisitor,
    transitiveNode: TransitiveNode,
  ): RenderTransitiveNodeResult | (() => Promise<RenderTransitiveNodeResult>) {
    const [
      visitorCaches,
      visitorOccurrences,
    ] = this.ensureCachesAndOccurrences(visitor);

    const { isInline } = transitiveNode;
    const transitiveNodeCacheKey = transitiveNode.options?.[
      'transitiveNodeCacheKey'
    ];

    const uniqueKey = [
      transitiveNode.source.sourceFileId,
      '#',
      ...transitiveNode.source.jsonPath,
      `#${transitiveNode.type}`,
      ...(transitiveNode.name || transitiveNode.suggestedName
        ? [`#${transitiveNode.name ?? transitiveNode.suggestedName}`]
        : []),
      ...(transitiveNode.type === 'scalar'
        ? [`#${transitiveNode.scalarType}`]
        : []),
      ...(isInline ? ['#inline'] : []),
      ...(typeof transitiveNodeCacheKey === 'string'
        ? [`#${transitiveNodeCacheKey}`]
        : []),
    ].join('/');

    const alreadyCached = visitorCaches.get(
      uniqueKey,
    );

    if (alreadyCached) {
      return alreadyCached;
    }

    const alreadyOccurred = visitorOccurrences.get(
      uniqueKey,
    );

    if (alreadyOccurred) {
      return alreadyOccurred;
    }

    let resultSync: RenderTransitiveNodeResult | undefined;

    /**
     * Does parsing in microtask.
     * Created promise could be tracked as a marker of future (pending) task
     * and save it at first iteration marking as having to be resolved later.
     *
     * It is a way to deal with cycled dependencies.
     */
    const enclosedPromise = new Promise<RenderTransitiveNodeResult>((resolve) => {
      visitorOccurrences.set(
        uniqueKey,
        () => {
          if (!enclosedPromise) {
            // fixme make more informative
            throw new Error('No Promise');
          }

          return enclosedPromise;
        },
      );

      const parsingBodyResult = visitor.renderTransitiveNodeWithoutImports({
        transitiveNode,
        logger: this.logger,
        getAnotherByTransitiveNode: (anotherTransitiveNode) => (
          this.renderTransitiveNodeWithoutImports(visitor, anotherTransitiveNode)
        ),
      });

      resolve(parsingBodyResult);
      visitorCaches.set(uniqueKey, parsingBodyResult);
      resultSync = parsingBodyResult;
    });

    if (!resultSync) {
      return visitor.createFallbackType(transitiveNode);
    }

    return resultSync;
  }

  renderAllTransitiveNodesInSingleFile<
    TAstObject extends object,
    TSourceFileObject extends object,
  >(
    visitor: UltimateParserVisitor<TAstObject, TSourceFileObject>,
    transitiveNodes: TransitiveNode[],
  ): UltimateParserVisitorResultGroup<TSourceFileObject, TAstObject> {
    const results = this.renderAllTransitiveNodes(visitor, transitiveNodes);

    return visitor.groupInSingleFile(results);
  }

  async renderAllTransitiveNodesGrouped<
    TAstObject extends object,
    TSourceFileObject extends object,
  >(
    visitor: UltimateParserVisitor<TAstObject, TSourceFileObject>,
    transitiveNodes: TransitiveNode[],
  ): Promise<UltimateParserVisitorResultGroup<TSourceFileObject, TAstObject>[]> {
    const results = this.renderAllTransitiveNodes(visitor, transitiveNodes);

    return visitor.groupInSeparatedFiles(results);
  }

  resetCaches(): void {
    this.visitors.forEach((visitor) => {
      const cache = this.visitorCaches.get(visitor);
      const occurrences = this.visitorOccurrences.get(visitor);

      if (cache) {
        cache.clear();
      }

      if (occurrences) {
        occurrences.clear();
      }
    });
  }

  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  private renderAllTransitiveNodes<TAstObject extends object>(
    visitor: UltimateParserVisitor<TAstObject>,
    transitiveNodes: TransitiveNode[],
  ): UltimateParserVisitorResult<TAstObject>[] {
    this.visitorCaches.delete(visitor);
    this.visitorOccurrences.delete(visitor);
    visitor.prepareToRender?.();

    const results: UltimateParserVisitorResult<TAstObject>[] = [];
    const seenResults = new Set<object>();

    for (const transitiveNode of transitiveNodes) {
      const result = this.renderTransitiveNodeWithoutImports(
        visitor,
        transitiveNode,
      );

      if (typeof result === 'function') {
        throw new TypeError('A top-level transitive node cannot be deferred.');
      }

      if (seenResults.has(result.ast)) {
        continue;
      }

      seenResults.add(result.ast);
      results.push(result as UltimateParserVisitorResult<TAstObject>);
    }

    return results;
  }

  private ensureCachesAndOccurrences(
    visitor: UltimateParserVisitor,
  ): [
    UltimateParserVisitorResultMap,
    UltimateParserVisitorResultPromiseMap,
  ] {
    if (!this.visitorCaches.has(visitor)) {
      this.visitorCaches.set(visitor, new Map());
    }

    if (!this.visitorOccurrences.has(visitor)) {
      this.visitorOccurrences.set(visitor, new Map());
    }

    return [
      this.visitorCaches.get(visitor) as UltimateParserVisitorResultMap,
      this.visitorOccurrences.get(visitor) as UltimateParserVisitorResultPromiseMap,
    ];
  }
}

export default UltimateParser;
