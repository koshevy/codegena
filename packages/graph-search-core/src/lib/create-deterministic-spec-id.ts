import { parse, type ParseError } from 'jsonc-parser';

function sortObjectKeys(_key: string, value: unknown): unknown {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).toSorted(([left], [right]) => (
      left.localeCompare(right)
    )),
  );
}

/**
 * Identify equal specifications independently of JSON key order or spacing.
 */
export async function createDeterministicSpecId(
  specification: unknown,
): Promise<string> {
  const parseErrors: ParseError[] = [];
  const parsed = typeof specification === 'string'
    ? parse(specification, parseErrors)
    : specification;
  const isValidParsed = parseErrors.length === 0 && parsed !== undefined;
  const content = isValidParsed ? parsed : specification;
  const normalized = JSON.stringify(content, sortObjectKeys);
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(normalized),
  );
  const digestBytes = new Uint8Array(digest);
  const bytes = digestBytes.slice(0, 16);

  bytes[6] = (bytes[6] & 0x0f) | 0x80;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}
