import { posix } from 'pathe';

import type { BarrelPlan } from './barrel-plan';
import type { SeparatedGroupPlan } from '../plan-separated-groups';

function getAvailableBarrelPath(
  preferredPath: string,
  occupiedFiles: Set<string>,
): string {
  if (!occupiedFiles.has(preferredPath)) {
    return preferredPath;
  }

  const directory = posix.dirname(preferredPath);

  for (let suffix = 0; suffix < occupiedFiles.size; suffix += 1) {
    const fileName = posix.join(directory, `barrel${suffix || ''}.ts`);

    if (!occupiedFiles.has(fileName)) {
      return fileName;
    }
  }

  throw new Error(`Unable to find an available barrel path in ${directory}.`);
}

export function planTypeBarrels(
  groups: SeparatedGroupPlan[],
  documentFileName: string,
): BarrelPlan[] {
  const directoryOfDocument = posix.dirname(documentFileName);
  const occupiedFiles = new Set(groups.map(({ fileName }) => fileName));
  const barrels = new Map<string, BarrelPlan>();

  for (const group of groups) {
    if (group.fileName === documentFileName) {
      continue;
    }

    const directory = posix.dirname(group.fileName);
    const barrel = barrels.get(directory) ?? {
      fileName: posix.join(directory, 'index.ts'),
      sourceGroups: [],
      operationFiles: [],
    };

    if (group.root.transitiveNode.type === 'entrypointRecord') {
      barrel.operationFiles.push(group.fileName);
    }
    else {
      barrel.sourceGroups.push(group);
    }

    barrels.set(directory, barrel);
  }

  return [...barrels].flatMap(([directory, barrel]) => {
    const firstOperation = barrel.operationFiles[0];

    if (firstOperation) {
      return [{ ...barrel, fileName: firstOperation }];
    }

    if (directory === directoryOfDocument) {
      return [];
    }

    const fileName = getAvailableBarrelPath(barrel.fileName, occupiedFiles);

    return [{ ...barrel, fileName }];
  });
}
