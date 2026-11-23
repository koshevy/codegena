/**
 * @see Parameter.in
 */
export const parameterTargets = [
  'path',
  'header',
  'query',
  'cookie',
] as const;

export type ParameterTarget = (typeof parameterTargets)[number];
