import type { GraphPayloadNode } from '@codegena/graph-core';

import type { GraphSearchDocument } from './graph-search-document';

export function mapGraphNodeToSearchDocument(
  node: GraphPayloadNode,
  children: GraphPayloadNode[],
  parent?: GraphPayloadNode,
): GraphSearchDocument {
  const { data, id } = node;

  if (data.kind === 'directory') {
    const directoryCount = children.filter((child) => (
      child.data.kind === 'directory'
    )).length;
    const fileCount = children.filter((child) => (
      child.data.kind === 'group'
    )).length;
    const directoryTitle = data.relativeDirectoryPath;

    return {
      id: `node:${id}`,
      searchText: directoryTitle,
      suggestion: {
        directoryCount,
        fileCount,
        id: `node:${id}`,
        kind: 'directory',
        nodeId: id,
        title: directoryTitle,
      },
      title: directoryTitle,
    };
  }

  if (data.kind === 'group') {
    const fileTitle = data.fileName;

    return {
      id: `node:${id}`,
      searchText: [
        fileTitle,
        data.text,
        data.programmingLanguage,
      ].join(' '),
      snippetText: data.text,
      suggestion: {
        id: `node:${id}`,
        kind: 'file',
        nodeId: id,
        title: fileTitle,
      },
      title: fileTitle,
    };
  }

  const title = data.identifierName ?? data.label;
  const fileName = data.relativeFilePath.split('/').at(-1) ?? data.relativeFilePath;
  const formattedText = parent?.data.kind === 'group'
    ? parent.data.text
    : undefined;
  const hasFormattedFile = formattedText !== undefined
    && data.line !== undefined;

  return {
    id: `node:${id}`,
    searchText: [
      title,
      data.label,
      data.text,
      data.relativeFilePath,
      data.line ? `line:${data.line}` : '',
      data.programmingLanguage,
    ].join(' '),
    snippetMatchText: data.text,
    snippetStartLine: hasFormattedFile ? data.line : undefined,
    snippetText: hasFormattedFile ? formattedText : data.text,
    suggestion: {
      declarationType: data.declarationType,
      fileName,
      id: `node:${id}`,
      kind: 'declaration',
      nodeId: id,
      sourceLocation: data.sourceLocation,
      title,
    },
    title,
  };
}
