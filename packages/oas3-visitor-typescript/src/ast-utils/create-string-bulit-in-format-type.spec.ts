/* eslint-disable no-template-curly-in-string */
import {
  createStringBuiltInFormatType,
} from './create-string-built-in-format-type';
import { printTypeDeclaration } from './print-declaration-statement';

async function printBuiltInFormatType(format: string): Promise<string> {
  const type = createStringBuiltInFormatType(format);

  if (!type) {
    throw new Error(`Expected a type for ${format}.`);
  }

  const printed = await printTypeDeclaration('Value', type);

  return printed
    .replace(/^type Value = /, '')
    .replace(/;$/, '');
}

describe('createStringBuiltInFormatType', () => {
  it.each([
    ['binary', 'Blob'],
    ['date', '`${number}-${number}-${number}`'],
    ['date-time', [
      '`${number}-${number}-${number}T${number}:${number}:${number}',
      '${string}`',
    ].join('')],
    ['duration', '`P${string}`'],
    ['email', '`${string}@${string}`'],
    ['hostname', 'string'],
    ['idn-email', '`${string}@${string}`'],
    ['idn-hostname', 'string'],
    ['iri', '`${string}:${string}`'],
    ['iri-reference', 'string'],
    ['ipv4', '`${number}.${number}.${number}.${number}`'],
    ['ipv6', '`${string}:${string}`'],
    ['json-pointer', '"" | `/${string}`'],
    ['regex', 'string'],
    ['relative-json-pointer', '`${number}` | `${number}#` | `${number}/${string}`'],
    ['time', '`${number}:${number}:${number}${string}`'],
    ['uri', '`${string}:${string}`'],
    ['uri-reference', 'string'],
    ['uri-template', 'string'],
    ['uuid', '`${string}-${string}-${string}-${string}-${string}`'],
  ])('should create a type for %s', async (format, expected): Promise<void> => {
    expect(await printBuiltInFormatType(format)).toBe(expected);
  });

  it('should return null for a custom format', async () => {
    expect(createStringBuiltInFormatType('customer-code')).toBeNull();
  });
});
