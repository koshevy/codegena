/**
 * Encode the same-origin source URL as one host route parameter.
 */
export function getPlaygroundPath(specUrl: string): string {
  return `/playground/${encodeURIComponent(specUrl)}`;
}

export const defaultPlaygroundPath = getPlaygroundPath(
  '/specifications/one-password.json',
);
