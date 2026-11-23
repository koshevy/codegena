import type { GraphPayload } from '@codegena/graph-core';

export const searchGraph: GraphPayload = {
  edges: [
    {
      data: { relation: 'placement' },
      id: '.->activity',
      label: 'placement',
      source: '.',
      target: 'activity',
    },
    {
      data: { relation: 'placement' },
      id: 'activity->activity/api-request.ts',
      label: 'placement',
      source: 'activity',
      target: 'activity/api-request.ts',
    },
  ],
  logs: [{
    error: {
      message: 'Invalid activity data\n> 12 | const activity = {}\n     | ^',
      name: 'JsonParseError',
    },
    jsoncNode: { col: 4, fileName: 'sample.jsonc', line: 12 },
    level: 'warn',
    message: 'Activity request could not be parsed',
  }],
  nodes: [
    {
      data: { kind: 'directory', label: './', relativeDirectoryPath: '.' },
      id: '.',
      type: 'directory',
    },
    {
      data: {
        kind: 'directory',
        label: 'activity',
        relativeDirectoryPath: './activity',
      },
      id: 'activity',
      parentId: '.',
      type: 'directory',
    },
    {
      data: {
        fileName: 'activity/api-request.ts',
        kind: 'group',
        label: 'api-request.ts',
        programmingLanguage: 'TypeScript',
        text: 'export interface ApiRequest { activity: string }',
      },
      id: 'activity/api-request.ts',
      parentId: 'activity',
      type: 'default',
    },
    {
      data: {
        ast: {},
        declarationType: 'Interface',
        identifierName: 'ApiRequest',
        kind: 'item',
        label: 'ApiRequest',
        logs: [],
        programmingLanguage: 'TypeScript',
        programmingLanguageVersion: '5',
        relativeFilePath: 'activity/api-request.ts',
        sourceLocation: { col: 3, fileName: 'sample.jsonc', line: 12 },
        text: 'export interface ApiRequest { activity: string }',
      },
      extent: 'parent',
      id: 'activity/api-request.ts::ApiRequest',
      parentId: 'activity/api-request.ts',
    },
  ],
};
