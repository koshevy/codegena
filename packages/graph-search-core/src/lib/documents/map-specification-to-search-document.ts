import type { GraphSearchSourceSpecification } from '../graph-search-source';
import type { GraphSearchDocument } from './graph-search-document';

export function mapSpecificationToSearchDocument(
  specification: GraphSearchSourceSpecification,
): GraphSearchDocument {
  return {
    id: 'specification',
    searchText: [specification.fileName, specification.text].join(' '),
    snippetText: specification.text,
    suggestion: {
      id: 'specification',
      kind: 'spec-snippet',
      sourceLocation: {
        col: 1,
        fileName: specification.fileName,
        line: 1,
      },
      title: specification.fileName,
    },
    title: specification.fileName,
  };
}
