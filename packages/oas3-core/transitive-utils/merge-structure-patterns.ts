import type {
  StructureTransitiveNode,
  TransitiveNode,
} from '../transitive-node';

type PropertyPatterns = StructureTransitiveNode['propertyPatterns'];
type KeyPattern = StructureTransitiveNode['defaultKeyPattern'];

export function mergeStructurePatterns(
  first: StructureTransitiveNode,
  second: StructureTransitiveNode,
  mergeValue: (
    firstValue: TransitiveNode,
    secondValue: TransitiveNode,
  ) => TransitiveNode,
): {
  defaultKeyPattern: KeyPattern;
  propertyPatterns: PropertyPatterns;
} {
  const propertyPatterns = [...first.propertyPatterns ?? []];
  const secondPatterns = second.propertyPatterns ?? [];

  for (const [pattern, node] of secondPatterns) {
    const matchingIndex = propertyPatterns.findIndex(
      ([candidatePattern]) => arePatternsEqual(candidatePattern, pattern),
    );

    if (matchingIndex === -1) {
      propertyPatterns.push([pattern, node]);

      continue;
    }

    const [existingPattern, existingNode] = propertyPatterns[matchingIndex];

    propertyPatterns[matchingIndex] = [
      existingPattern,
      mergeValue(existingNode, node),
    ];
  }

  return {
    defaultKeyPattern: mergeKeyPatterns(
      first.defaultKeyPattern,
      second.defaultKeyPattern,
    ),
    propertyPatterns: propertyPatterns.length
      ? propertyPatterns
      : undefined,
  };
}

function mergeKeyPatterns(
  first: KeyPattern,
  second: KeyPattern,
): KeyPattern {
  const patterns = [
    ...toPatternList(first),
    ...toPatternList(second),
  ];

  const distinctPatterns = patterns.filter((pattern, index) => (
    patterns.slice(0, index).every(
      (previousPattern) => !arePatternsEqual(previousPattern, pattern),
    )
  ));

  if (distinctPatterns.length === 1) {
    return distinctPatterns[0];
  }

  return distinctPatterns.length ? distinctPatterns : undefined;
}

function toPatternList(pattern: KeyPattern): RegExp[] {
  if (!pattern) {
    return [];
  }

  return Array.isArray(pattern) ? pattern : [pattern];
}

function arePatternsEqual(first: RegExp, second: RegExp): boolean {
  return first.source === second.source && first.flags === second.flags;
}
