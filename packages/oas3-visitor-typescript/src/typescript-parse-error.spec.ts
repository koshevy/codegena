import { extractTransitiveNodesFromSchema } from '@codegena/oas3-core/transitive-parser';
import colors from 'ansi-colors';

import { TypescriptParseError } from './typescript-parse-error';

describe('TypescriptParseError', () => {
  it('should show the source ID and numbered code around the failed node', () => {
    const content = '{\n  "type": "string"\n}';
    const [node] = extractTransitiveNodesFromSchema({
      jsoncTextData: content,
      srcFileId: 'customer.jsonc',
    });

    if (!node) {
      throw new Error('Expected a transitive node.');
    }

    const error = new TypescriptParseError('Unsupported declaration', node, false);

    const cause = new Error('Unsupported node');
    const errorWithOptions = new TypescriptParseError('Unsupported declaration', {
      transitiveNode: node,
      logger: false,
      cause,
    });

    expect(errorWithOptions.message).toBe(error.message);
    expect(errorWithOptions.cause).toBe(cause);
    expect(colors.stripColor(error.message).replaceAll(/ +$/gm, '')).toBe(
      'Error occurred at converting to TypeScript time with a message:\n'
      + 'Unsupported declaration\n'
      + 'Encountered at:\n'
      + 'customer.jsonc:1:1\n'
      + '> 1 | {\n'
      + '    | ^\n'
      + '  2 |   "type": "string"',
    );
  });
});
