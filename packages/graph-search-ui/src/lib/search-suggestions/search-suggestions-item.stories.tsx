import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';

import { SearchSuggestionsItem } from './search-suggestions-item';

const meta: Meta<typeof SearchSuggestionsItem> = {
  args: {
    item: {
      id: 'file',
      kind: 'file',
      snippet: {
        activeColumnNumber: 18,
        activeLineNumber: 1,
        lines: [
          {
            content: 'export interface ErrorResponse { message: string }',
            lineNumber: 1,
          },
        ],
      },
      title: '_common/error-response.ts',
    },
    query: 'Error',
  },
  component: SearchSuggestionsItem,
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: '50rem', width: '100%' }}>
        <Story />
      </Box>
    ),
  ],
  title: 'Codegena/Graph Search/Suggestion Items',
};

export default meta;

export const File: StoryObj<typeof SearchSuggestionsItem> = {};

export const Directory: StoryObj<typeof SearchSuggestionsItem> = {
  args: {
    item: {
      id: 'directory',
      kind: 'directory',
      title: './metrics',
      directoryCount: 2,
      fileCount: 3,
    },
    query: 'metrics',
  },
};

export const Declaration: StoryObj<typeof SearchSuggestionsItem> = {
  args: {
    item: {
      id: 'declaration',
      kind: 'declaration',
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
    query: 'Connect',
  },
};

export const SpecificationSnippet: StoryObj<typeof SearchSuggestionsItem> = {
  args: {
    item: {
      id: 'spec-snippet',
      kind: 'spec-snippet',
      title: 'oas3-onepassword-connect.json',
      snippet: {
        activeColumnNumber: 9,
        activeLineNumber: 52,
        lines: [
          { content: '"summary": "Retrieve a list of API Requests",', lineNumber: 51 },
          { content: '"operationId": "Activity_getApiRequests",', lineNumber: 52 },
          { content: '"security": [', lineNumber: 53 },
        ],
      },
    },
    query: 'Requests',
  },
};

export const Warning: StoryObj<typeof SearchSuggestionsItem> = {
  args: {
    item: {
      id: 'warning',
      kind: 'warning',
      title: 'Unable to resolve a nested reference.',
      sourceLocation: {
        col: 21,
        fileName: 'oas3-onepassword-connect.json',
        line: 1526,
      },
    },
    query: 'reference',
  },
};
