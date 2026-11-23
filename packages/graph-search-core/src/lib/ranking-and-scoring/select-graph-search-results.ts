import type { SearchResult } from 'minisearch';

import type { GraphSearchDocument } from '../documents';
import type { VisitHistory } from '../visit-history';

const suggestionKindRank = {
  'directory': 0,
  'declaration': 1,
  'file': 2,
  'warning': 3,
  'spec-snippet': 4,
} as const;

const reservedKinds = [
  { kind: 'declaration', limit: 33 },
  { kind: 'file', limit: 33 },
  { kind: 'warning', limit: 33 },
  { kind: 'spec-snippet', limit: 1 },
] as const;

interface SelectedGraphSearchResults {
  isTruncated: boolean;
  results: SearchResult[];
}

interface SelectGraphSearchResultsProps {
  documentsById: Map<string, GraphSearchDocument>;
  maximumCount: number;
  query: string;
  results: SearchResult[];
  visitHistory: VisitHistory;
}

function getCaseMatchRank(
  document: GraphSearchDocument | undefined,
  query: string,
): number {
  if (document?.title.includes(query)) {
    return 2;
  }

  return document?.searchText.includes(query) ? 1 : 0;
}

export function selectGraphSearchResults({
  documentsById,
  maximumCount,
  query,
  results,
  visitHistory,
}: SelectGraphSearchResultsProps): SelectedGraphSearchResults {
  const caseRankById = new Map(results.map(({ id }) => {
    const key = String(id);

    return [
      key,
      getCaseMatchRank(documentsById.get(key), query),
    ] as const;
  }));
  const getResultCaseRank = ({ id }: SearchResult): number => (
    caseRankById.get(String(id)) ?? 0
  );

  const rankedResults = results.toSorted((left, right) => {
    const leftDocument = documentsById.get(String(left.id));
    const rightDocument = documentsById.get(String(right.id));
    const caseDifference = getResultCaseRank(right)
      - getResultCaseRank(left);
    const kindDifference = (
      suggestionKindRank[leftDocument?.suggestion.kind ?? 'spec-snippet']
      - suggestionKindRank[rightDocument?.suggestion.kind ?? 'spec-snippet']
    );

    return caseDifference
      || kindDifference
      || (
        right.score + visitHistory.getVisitRank(String(right.id))
        - left.score - visitHistory.getVisitRank(String(left.id))
      );
  });

  const resultsByKind = Map.groupBy(rankedResults, ({ id }) => (
    documentsById.get(String(id))?.suggestion.kind ?? 'spec-snippet'
  ));

  const hasSeveralKinds = resultsByKind.size > 1;
  const count = Math.max(0, maximumCount);

  if (!hasSeveralKinds) {
    return {
      isTruncated: rankedResults.length > count,
      results: rankedResults.slice(0, count),
    };
  }

  const reservedResults = reservedKinds.flatMap(({ kind, limit }) => (
    resultsByKind.get(kind)?.slice(0, limit) ?? []
  )).slice(0, count);
  const directories = resultsByKind.get('directory')?.slice(
    0,
    count - reservedResults.length,
  ) ?? [];
  const selectedByKind = Map.groupBy(
    [...directories, ...reservedResults],
    ({ id }) => (
      documentsById.get(String(id))?.suggestion.kind ?? 'spec-snippet'
    ),
  );
  const selectedResults = [...selectedByKind.entries()]
    .toSorted(([leftKind, leftResults], [rightKind, rightResults]) => {
      const leftRank = leftResults.reduce((rank, result) => (
        Math.max(rank, getResultCaseRank(result))
      ), 0);
      const rightRank = rightResults.reduce((rank, result) => (
        Math.max(rank, getResultCaseRank(result))
      ), 0);

      return rightRank - leftRank
        || suggestionKindRank[leftKind] - suggestionKindRank[rightKind];
    })
    .flatMap(([, groupResults]) => groupResults);

  return {
    isTruncated: rankedResults.length > selectedResults.length,
    results: selectedResults,
  };
}
