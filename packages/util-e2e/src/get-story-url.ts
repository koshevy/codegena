/**
 * Builds a Storybook iframe path for a story and optional URL args.
 * Pass args in Storybook's semicolon-separated key:value format.
 */
export function getStoryUrl(storyId: string, args?: string): string {
  const query = new URLSearchParams({ id: storyId, viewMode: 'story' });

  if (args !== undefined) {
    query.set('args', args);
  }

  return `/iframe.html?${query.toString()}`;
}
