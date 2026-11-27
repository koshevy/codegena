export const specificationExamples = [
  { name: 'Account schema', path: '/specifications/account.schema.jsonc' },
  { name: '1Password', path: '/specifications/one-password.json' },
] as const;

export function getSpecificationPath(specUrl: string): string {
  return `/playground/${encodeURIComponent(specUrl)}`;
}
