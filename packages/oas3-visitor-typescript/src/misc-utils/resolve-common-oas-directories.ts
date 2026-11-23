import type {
  UltimateParserVisitorParsingProps,
} from '@codegena/oas3-core/ultimate-parser';
import { posix } from 'pathe';

export type GetCommonDirectoryName = NonNullable<
  NonNullable<UltimateParserVisitorParsingProps['options']>[
    'getCommonDirectoryName'
  ]
>;

function getDefaultCommonDirectoryName(
  _path: string[],
  otherDirectoriesAtParent: string[],
): string {
  const occupiedNames = new Set(otherDirectoriesAtParent);

  if (!occupiedNames.has('_common')) {
    return '_common';
  }

  let suffix = 1;

  while (occupiedNames.has(`_common${suffix}`)) {
    suffix += 1;
  }

  return `_common${suffix}`;
}

export function resolveCommonOasDirectories<TGroup>(
  directoriesByGroup: Map<TGroup, string>,
  commonGroups: Set<TGroup>,
  getCommonDirectoryName: GetCommonDirectoryName = getDefaultCommonDirectoryName,
): Map<TGroup, string> {
  const siblingDirectories = new Map<string, Set<string>>();

  directoriesByGroup.values().forEach((directory) => {
    const segments = directory.split('/').filter(Boolean);

    segments.forEach((segment, index) => {
      const parent = segments.slice(0, index).join('/');
      const siblings = siblingDirectories.get(parent) ?? new Set<string>();

      siblings.add(segment);
      siblingDirectories.set(parent, siblings);
    });
  });

  const commonNamesByParent = new Map<string, string>();

  return new Map([...directoriesByGroup].map(([group, parent]) => {
    if (!commonGroups.has(group)) {
      return [group, parent] as const;
    }

    const parentSegments = parent.split('/').filter(Boolean);
    const siblingNames = [
      ...(siblingDirectories.get(parent) ?? []),
    ].toSorted();

    let name = commonNamesByParent.get(parent);

    if (!name) {
      name = getCommonDirectoryName(parentSegments, siblingNames);
      commonNamesByParent.set(parent, name);
    }

    if (!name || name.includes('/') || siblingNames.includes(name)) {
      throw new Error(`Invalid common directory name: ${name}`);
    }

    return [group, posix.join(parent, name)] as const;
  }));
}
