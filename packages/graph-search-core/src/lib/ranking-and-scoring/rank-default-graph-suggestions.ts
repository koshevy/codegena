import type { GraphSearchDocument } from '../documents';
import type { GraphPayloadMiniSearchOptions } from '../graph-payload-mini-search-options';
import type { GraphSuggestion } from '../graph-suggestion';
import type { VisitHistory } from '../visit-history';

interface RankDefaultGraphSuggestionsProps {
  documents: GraphSearchDocument[];
  documentsById: Map<string, GraphSearchDocument>;
  options: GraphPayloadMiniSearchOptions;
  scores: Map<string, number>;
  visitHistory: VisitHistory;
}

function topSuggestions(
  documents: GraphSearchDocument[],
  scores: Map<string, number>,
  count: number,
): GraphSuggestion[] {
  return documents
    .toSorted((left, right) => (
      (scores.get(right.id) ?? 0) - (scores.get(left.id) ?? 0)
      || left.title.localeCompare(right.title)
    ))
    .slice(0, count)
    .map(({ suggestion }) => suggestion);
}

export function rankDefaultGraphSuggestions({
  documents,
  documentsById,
  options,
  scores,
  visitHistory,
}: RankDefaultGraphSuggestionsProps): GraphSuggestion[] {
  const recent = visitHistory
    .getRecentSuggestionIds(options.recentSuggestionCount ?? 4)
    .flatMap((id) => {
      const document = documentsById.get(id);

      return document ? [document.suggestion] : [];
    });

  const rankedByKind = [
    topSuggestions(
      documents.filter(({ suggestion }) => (
        suggestion.kind === 'directory'
        && suggestion.nodeId !== '.'
      )),
      scores,
      options.directorySuggestionCount ?? 3,
    ),
    topSuggestions(
      documents.filter(({ suggestion }) => (
        suggestion.kind === 'declaration'
      )),
      scores,
      options.declarationSuggestionCount ?? 3,
    ),
    topSuggestions(
      documents.filter(({ suggestion }) => suggestion.kind === 'file'),
      scores,
      options.fileSuggestionCount ?? 3,
    ),
    topSuggestions(
      documents.filter(({ suggestion }) => suggestion.kind === 'warning'),
      scores,
      options.warningSuggestionCount ?? 3,
    ),
    documents
      .filter(({ suggestion }) => suggestion.kind === 'spec-snippet')
      .map(({ suggestion }) => suggestion),
  ].flat();

  const seen = new Set<string>();

  return [...recent, ...rankedByKind]
    .filter(({ id }) => {
      if (seen.has(id)) {
        return false;
      }

      seen.add(id);

      return true;
    })
    .slice(0, Math.min(options.defaultSuggestionCount ?? 10, 100));
}
