import { posix } from 'pathe';

import type { SeparatedGroupPlan } from './plan-separated-groups';

type GroupBeforeFileName = Omit<SeparatedGroupPlan, 'fileName'>;

interface DirectoryEntries {
  directories: Set<string>;
  files: Set<string>;
}

function getDirectoryEntries(
  entriesByDirectory: Map<string, DirectoryEntries>,
  directory: string,
): DirectoryEntries {
  const existingEntries = entriesByDirectory.get(directory);

  if (existingEntries) {
    return existingEntries;
  }

  const entries = {
    directories: new Set<string>(),
    files: new Set<string>(),
  };

  entriesByDirectory.set(directory, entries);

  return entries;
}

export function compactOasDirectories(
  directoriesByGroup: Map<GroupBeforeFileName, string>,
): Map<GroupBeforeFileName, string> {
  const entriesByDirectory = new Map<string, DirectoryEntries>();

  directoriesByGroup.forEach((directory, group) => {
    const segments = directory.split('/').filter(Boolean);

    segments.forEach((segment, index) => {
      const parent = segments.slice(0, index).join('/');

      getDirectoryEntries(entriesByDirectory, parent)
        .directories.add(segment);
    });

    getDirectoryEntries(entriesByDirectory, directory)
      .files.add(posix.basename(group.root.relativeFilePath));
  });

  return new Map([...directoriesByGroup].map(([group, directory]) => {
    const segments = directory.split('/').filter(Boolean);
    const compactedSegments = segments.reduce<string[]>((compacted, segment, index) => {
      const parentSegments = segments.slice(0, index);
      const parent = parentSegments.join('/');
      const entries = entriesByDirectory.get(parent);
      const isRepeatsParent = segment === compacted.at(-1);
      const isOnlyEntry = entries?.files.size === 0
        && entries.directories.size === 1;

      return isRepeatsParent || isOnlyEntry
        ? compacted
        : [...compacted, segment];
    }, []);

    return [group, compactedSegments.join('/')] as const;
  }));
}
