import type {
  GraphSuggestionCodeSnippet,
} from '../graph-suggestion';

export function createGraphSuggestionSnippet(
  text: string,
  query: string,
  startLine = 1,
): GraphSuggestionCodeSnippet | undefined {
  const queryTrimmed = query.trim();

  if (!queryTrimmed) {
    return undefined;
  }

  const lowercaseQuery = queryTrimmed.toLocaleLowerCase();
  const lines = text.split('\n');
  const exactIndex = lines.findIndex((line, index) => (
    index >= startLine - 1
    && line.includes(queryTrimmed)
  ));
  const activeIndex = exactIndex === -1
    ? lines.findIndex((line, index) => (
        index >= startLine - 1
        && line.toLocaleLowerCase().includes(lowercaseQuery)
      ))
    : exactIndex;

  if (activeIndex === -1) {
    return undefined;
  }

  const activeLine = lines[activeIndex] ?? '';
  const matchedLine = exactIndex === -1
    ? activeLine.toLocaleLowerCase()
    : activeLine;
  const matchedQuery = exactIndex === -1 ? lowercaseQuery : queryTrimmed;
  const activeColumnNumber = matchedLine.indexOf(matchedQuery) + 1;

  const firstIndex = Math.max(0, activeIndex - 1);
  const lastIndex = Math.min(lines.length, activeIndex + 2);

  return {
    activeColumnNumber,
    activeLineNumber: activeIndex + 1,
    lines: lines.slice(firstIndex, lastIndex).map((content, index) => ({
      content,
      lineNumber: firstIndex + index + 1,
    })),
  };
}
