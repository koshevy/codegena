/**
 * Resolves only local JSON Pointers; external documents need a resolver.
 */
export function getLocalReferencePath(ref: string): string[] | null {
  if (!ref.startsWith('#/')) {
    return null;
  }

  return ref.slice(2)
    .split('/')
    .map((part) => (
      part.replaceAll('~1', '/').replaceAll('~0', '~')
    ));
}
