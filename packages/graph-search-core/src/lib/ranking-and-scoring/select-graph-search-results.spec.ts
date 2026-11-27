import type { GraphPayload } from '@codegena/graph-core';
import type { SearchResult } from 'minisearch';

import type { GraphSearchDocument } from '../documents';
import { VisitHistory } from '../visit-history';
import { selectGraphSearchResults } from './select-graph-search-results';

const documents: GraphSearchDocument[] = [
  {
    id: 'directory',
    searchText: './users',
    suggestion: {
      directoryCount: 0,
      fileCount: 1,
      id: 'directory',
      kind: 'directory',
      title: './users',
    },
    title: './users',
  },
  {
    id: 'declaration',
    searchText: 'UsersCheckFollowingForUser',
    suggestion: {
      declarationType: 'Interface',
      fileName: 'users.ts',
      id: 'declaration',
      kind: 'declaration',
      title: 'UsersCheckFollowingForUser',
    },
    title: 'UsersCheckFollowingForUser',
  },
  {
    id: 'file',
    searchText: 'users.ts export interface UserRecord {}',
    snippetText: 'export interface UserRecord {}',
    suggestion: {
      id: 'file',
      kind: 'file',
      title: 'users.ts',
    },
    title: 'users.ts',
  },
];

const results: SearchResult[] = documents.map(({ id }) => ({
  id,
  match: {},
  queryTerms: ['user'],
  score: 1,
  terms: ['users'],
}));

const graph: GraphPayload = { edges: [], logs: [], nodes: [] };

describe('selectGraphSearchResults', () => {
  it('puts exact-case declaration titles before lowercase directory matches', () => {
    const history = new VisitHistory(graph, 'case-ranking');
    const documentsById = new Map(documents.map((document) => [
      document.id,
      document,
    ]));

    const capitalized = selectGraphSearchResults({
      documentsById,
      maximumCount: 100,
      query: 'User',
      results,
      visitHistory: history,
    });
    const lowercase = selectGraphSearchResults({
      documentsById,
      maximumCount: 100,
      query: 'user',
      results,
      visitHistory: history,
    });

    expect(capitalized.results.map(({ id }) => id)).toEqual([
      'declaration',
      'file',
      'directory',
    ]);
    expect(lowercase.results.map(({ id }) => id)).toEqual([
      'directory',
      'file',
      'declaration',
    ]);

    history.dispose();
  });
});
