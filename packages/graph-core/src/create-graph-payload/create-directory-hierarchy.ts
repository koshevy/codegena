import type { GraphPayloadEdge } from '../graph-payload-edge';
import type {
  GraphPayloadDirectoryNode,
  GraphPayloadGroupNode,
} from '../graph-payload-node';

interface DirectoryHierarchy {
  directories: GraphPayloadDirectoryNode[];
  edges: GraphPayloadEdge[];
  groups: GraphPayloadGroupNode[];
}

function getParentDirectoryId(path: string): string {
  const separatorIndex = path.lastIndexOf('/');

  return separatorIndex === -1 ? '.' : path.slice(0, separatorIndex);
}

function createPlacementEdge(source: string, target: string): GraphPayloadEdge {
  return {
    data: { relation: 'placement' },
    id: `${source}->${target}`,
    label: 'placement',
    source,
    target,
  };
}

/** Adds one directory per generated path segment, with a virtual output root. */
export function createDirectoryHierarchy(
  groups: GraphPayloadGroupNode[],
): DirectoryHierarchy {
  const directoryPaths = [...new Set(groups.flatMap(({ data }) => {
    const segments = data.fileName.split('/').slice(0, -1);

    return segments.map((_, index) => segments.slice(0, index + 1).join('/'));
  }))];

  if (directoryPaths.length === 0) {
    return { directories: [], edges: [], groups };
  }

  const root: GraphPayloadDirectoryNode = {
    data: { kind: 'directory', label: './', relativeDirectoryPath: '.' },
    id: '.',
    type: 'directory',
  };

  const directories = directoryPaths.map((path): GraphPayloadDirectoryNode => ({
    data: {
      kind: 'directory',
      label: path.split('/').at(-1) ?? path,
      relativeDirectoryPath: `./${path}`,
    },
    id: path,
    parentId: getParentDirectoryId(path),
    type: 'directory',
  }));

  const placedGroups = groups.map((group): GraphPayloadGroupNode => ({
    ...group,
    parentId: getParentDirectoryId(group.data.fileName),
  }));

  const edges = [
    ...directories.map(({ id, parentId }) => createPlacementEdge(
      parentId ?? '.',
      id,
    )),
    ...placedGroups.map(({ id, parentId }) => createPlacementEdge(
      parentId ?? '.',
      id,
    )),
  ];

  return { directories: [root, ...directories], edges, groups: placedGroups };
}
