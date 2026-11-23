import type {
  SearchSuggestionsItemProps,
  SearchSuggestionsSource,
} from '../index';

export const demoSearchSuggestions: SearchSuggestionsItemProps[] = [
  {
    id: 'directory-metrics',
    kind: 'directory',
    nodeId: 'metrics',
    title: './metrics',
    directoryCount: 0,
    fileCount: 3,
  },
  {
    id: 'file-error-response',
    kind: 'file',
    nodeId: '_common/error-response.ts',
    title: '_common/error-response.ts',
    snippet: {
      activeColumnNumber: 18,
      activeLineNumber: 1,
      lines: [
        { content: 'export interface ErrorResponse { message: string }', lineNumber: 1 },
      ],
    },
  },
  {
    id: 'declaration-api-connect',
    kind: 'declaration',
    nodeId: 'index.ts::Api1PasswordConnect',
    title: 'Api1PasswordConnect',
    declarationType: 'Namespace',
    fileName: 'index.ts',
    snippet: {
      activeColumnNumber: 18,
      activeLineNumber: 17,
      lines: [
        { content: 'export namespace Api1PasswordConnect {', lineNumber: 17 },
      ],
    },
  },
  {
    id: 'spec-snippet',
    kind: 'spec-snippet',
    title: 'oas3-onepassword-connect.json',
    snippet: {
      activeColumnNumber: 9,
      activeLineNumber: 52,
      lines: [
        {
          content: '"summary": "Retrieve a list of API Requests that have been made.",',
          lineNumber: 51,
        },
        {
          content: '"operationId": "Activity_getApiRequests",',
          lineNumber: 52,
        },
        { content: '"security": [', lineNumber: 53 },
      ],
    },
    sourceLocation: {
      col: 9,
      fileName: 'oas3-onepassword-connect.json',
      line: 52,
    },
  },
  {
    id: 'warning-reference',
    kind: 'warning',
    sourceLocation: {
      col: 21,
      fileName: 'oas3-onepassword-connect.json',
      line: 1526,
    },
    title: 'Unable to resolve a nested reference.',
  },
];

export const demoSearchSuggestionsSource: SearchSuggestionsSource = (
  sourceText,
) => {
  const query = sourceText.trim().toLocaleLowerCase();

  return {
    isTruncated: false,
    suggestions: demoSearchSuggestions.filter((item) => (
      !query
      || item.title.toLocaleLowerCase().includes(query)
      || (item.kind === 'declaration'
        && item.fileName.toLocaleLowerCase().includes(query))
      || ('snippet' in item
        && item.snippet?.lines.some(({ content }) => (
          content.toLocaleLowerCase().includes(query)
        )))
    )),
  };
};

const overflowingSearchSuggestions: SearchSuggestionsItemProps[] = Array.from(
  { length: 40 },
  (_, index) => ({
    id: `file-${index}`,
    kind: 'file',
    title: `generated/example-file-${index + 1}.ts`,
    snippet: {
      activeColumnNumber: 18,
      activeLineNumber: 1,
      lines: [
        {
          content: `export interface ExampleFile${index + 1} { id: string }`,
          lineNumber: 1,
        },
      ],
    },
  }),
);

export const overflowingSearchSuggestionsSource: SearchSuggestionsSource = (
  sourceText,
) => {
  const query = sourceText.trim().toLocaleLowerCase();

  return {
    isTruncated: true,
    suggestions: overflowingSearchSuggestions.filter((item) => (
      item.title.toLocaleLowerCase().includes(query)
    )),
  };
};
