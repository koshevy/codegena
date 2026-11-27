import { parseTree } from 'jsonc-parser';

import { CollectingLogger } from './collecting-logger';

describe('CollectingLogger', () => {
  it('retains structured errors and locates JSONC warnings', () => {
    const sourceText = '{\n  "name": true\n}';
    const node = parseTree(sourceText)?.children?.[0];

    if (!node) {
      throw new Error('Expected a JSONC property node.');
    }

    const formattedLogs: string[] = [];
    const collector = new CollectingLogger({
      output: (line) => formattedLogs.push(line),
      sourceFileId: 'sample.jsonc',
      sourceText,
    });
    const error = new TypeError('Invalid value');

    collector.logger.warn({ node }, 'Unexpected property');
    collector.logger.error({ error, node }, 'Could not convert property');

    expect(formattedLogs).toEqual([
      'WARN: Unexpected property',
      'ERROR: Could not convert property',
    ]);

    expect(collector.getLogs()).toEqual([
      {
        jsoncNode: { col: 3, fileName: 'sample.jsonc', line: 2 },
        level: 'warn',
        message: 'Unexpected property',
        node,
      },
      {
        error,
        jsoncNode: { col: 3, fileName: 'sample.jsonc', line: 2 },
        level: 'error',
        message: 'Could not convert property',
        node,
      },
    ]);
  });

  it('does not locate a node against another source file', () => {
    const sourceText = '{ "ok": true }';
    const node = parseTree(sourceText);

    if (!node) {
      throw new Error('Expected a JSONC node.');
    }

    const collector = new CollectingLogger({
      sourceFileId: 'first.jsonc',
      sourceText,
    });

    collector.logger.warn({ node, sourceFileId: 'second.jsonc' }, 'Other file');

    const [log] = collector.getLogs();

    expect(log).toMatchObject({
      level: 'warn',
      message: 'Other file',
      node,
    });
    expect(log?.jsoncNode).toBeUndefined();
  });

  it('collects the same interpolated message that it outputs', () => {
    const formattedLogs: string[] = [];
    const collector = new CollectingLogger({
      output: (line) => formattedLogs.push(line),
    });

    collector.logger.info('Hello %s', 'world');

    expect(collector.getLogs()).toEqual([{
      level: 'info',
      message: 'Hello world',
    }]);
    expect(formattedLogs).toEqual(['INFO: Hello world']);
  });
});
