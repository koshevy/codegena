import type { GraphPayload } from '@codegena/graph-core';
import MiniSearch from 'minisearch';

import {
  createGraphSearchDocuments,
  createGraphSuggestionSnippet,
  type GraphSearchDocument,
} from './documents';
import type { GraphPayloadMiniSearchOptions } from './graph-payload-mini-search-options';
import type { GraphSearchSuggestionsResult } from './graph-search-suggestions-result';
import type { GraphSuggestion } from './graph-suggestion';
import {
  rankDefaultGraphSuggestions,
  scoreGraphSearchDocuments,
  selectGraphSearchResults,
} from './ranking-and-scoring';
import type { VisitHistory } from './visit-history';

/**
 * Index a graph once and return presentation-ready, ordered suggestions.
 */
export class GraphPayloadMiniSearch {
  private readonly index: MiniSearch<GraphSearchDocument>;
  private readonly documentsById: Map<string, GraphSearchDocument>;
  private defaultSuggestions: GraphSuggestion[];
  private defaultSuggestionVersion: number;
  private readonly rankDefaults: () => GraphSuggestion[];

  constructor(
    graphPayload: GraphPayload,
    private readonly visitHistory: VisitHistory,
    private readonly options: GraphPayloadMiniSearchOptions = {},
  ) {
    const childrenByParent = Map.groupBy(graphPayload.nodes.filter((node) => (
      node.parentId !== undefined
    )), (node) => node.parentId);

    const documents = createGraphSearchDocuments(
      graphPayload,
      childrenByParent,
      options.sourceSpecification,
    );

    this.documentsById = new Map(documents.map((document) => [
      document.id,
      document,
    ]));

    this.index = new MiniSearch({
      fields: ['title', 'searchText'],
      searchOptions: {
        boost: { title: 4 },
        combineWith: 'AND',
        prefix: true,
      },
    });

    this.index.addAll(documents);

    const scores = scoreGraphSearchDocuments(
      graphPayload,
      documents,
      childrenByParent,
    );

    const rankingProps = {
      documents,
      documentsById: this.documentsById,
      options,
      scores,
      visitHistory,
    };

    this.rankDefaults = () => rankDefaultGraphSuggestions(rankingProps);
    this.defaultSuggestions = this.rankDefaults();
    this.defaultSuggestionVersion = visitHistory.getVersion();
  }

  getAutoSuggestion(query: string): string {
    return this.index.autoSuggest(query.trim())[0]?.suggestion ?? '';
  }

  getSearchSuggestions(query = ''): GraphSearchSuggestionsResult {
    const queryTrimmed = query.trim();

    if (queryTrimmed.length < (this.options.minimumQueryLength ?? 3)) {
      const currentVersion = this.visitHistory.getVersion();

      if (currentVersion !== this.defaultSuggestionVersion) {
        this.defaultSuggestions = this.rankDefaults();
        this.defaultSuggestionVersion = currentVersion;
      }

      return {
        isTruncated: false,
        suggestions: this.defaultSuggestions,
      };
    }

    const selectedResults = selectGraphSearchResults({
      documentsById: this.documentsById,
      maximumCount: Math.min(this.options.searchSuggestionCount ?? 100, 100),
      query: queryTrimmed,
      results: this.index.search(queryTrimmed),
      visitHistory: this.visitHistory,
    });

    return {
      isTruncated: selectedResults.isTruncated,
      suggestions: selectedResults.results.flatMap(({ id }) => {
        const document = this.documentsById.get(String(id));

        return document
          ? [this.prepareSuggestion(document, queryTrimmed)]
          : [];
      }),
    };
  }

  dispose(): void {
    this.index.removeAll();
    this.documentsById.clear();
    this.defaultSuggestions = [];
  }

  private prepareSuggestion(
    document: GraphSearchDocument,
    query: string,
  ): GraphSuggestion {
    const { suggestion } = document;

    if (suggestion.kind === 'warning' || suggestion.kind === 'directory') {
      return suggestion;
    }

    const hasSnippetMatch = document.snippetMatchText === undefined
      || document.snippetMatchText.toLocaleLowerCase()
        .includes(query.toLocaleLowerCase());

    if (!hasSnippetMatch) {
      return suggestion;
    }

    const snippet = document.snippetText
      ? createGraphSuggestionSnippet(
          document.snippetText,
          query,
          document.snippetStartLine,
        )
      : undefined;

    if (!snippet) {
      return suggestion;
    }

    if (suggestion.kind === 'spec-snippet') {
      return {
        ...suggestion,
        snippet,
        sourceLocation: {
          col: snippet.activeColumnNumber,
          fileName: suggestion.title,
          line: snippet.activeLineNumber,
        },
      };
    }

    return { ...suggestion, snippet };
  }
}
