import { pascalCaseTypeName } from '@codegena/oas3-core/transitive-utils';
import groupBy from 'lodash/groupBy';

/**
 * Finds the shortest distinct suffix of each operation tag path.
 */
export function getDistinctTagNamespaceNames(
  tagPaths: string[][],
): string[] {
  const mapTagPathsToNames = (candidateDepths: number[]): string[] => (
    tagPaths.map((tags, index) => (
      tags.slice(-candidateDepths[index])
        .map((item) => pascalCaseTypeName(item))
        .join('')
    ))
  );

  const maximumDepth = Math.max(
    1,
    ...tagPaths.map(({ length }) => length),
  );

  let depths = tagPaths.map(() => 1);
  let level = 1;

  while (level < maximumDepth) {
    const currentDepths = depths;
    const candidateNames = mapTagPathsToNames(currentDepths);

    const collisions = Object.values(groupBy(
      candidateNames.map((name, index) => ({ name, index })),
      'name',
    )).filter(({ length }) => length > 1);

    if (!collisions.length) {
      return candidateNames;
    }

    const expandableIndices = new Set(collisions.flatMap((collision) => (
      collision
        .map(({ index }) => index)
        .filter((index) => currentDepths[index] < tagPaths[index].length)
    )));

    if (!expandableIndices.size) {
      break;
    }

    depths = currentDepths.map((depth, index) => (
      expandableIndices.has(index) ? depth + 1 : depth
    ));
    level += 1;
  }

  // Distinct paths can still normalize to the same TypeScript identifier.
  const names = mapTagPathsToNames(depths);

  return names.map((name, index) => {
    const previousMatches = names.slice(0, index).filter((other) => (
      other === name
    )).length;

    return previousMatches ? `${name}${previousMatches + 1}` : name;
  });
}
