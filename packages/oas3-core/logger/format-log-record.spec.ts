import colors from 'ansi-colors';

import { formatLogRecord } from './format-log-record';

describe('formatLogRecord', () => {
  it('keeps browser-safe output plain unless color is requested', () => {
    const record = { level: 40, msg: 'Fallback used' };

    expect(formatLogRecord(record)).toBe('WARN: Fallback used');
    expect(formatLogRecord(record, { colorize: true }))
      .toBe(`${colors.yellow('WARN')}: Fallback used`);
  });
});
