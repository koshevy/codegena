import { CollectingLogger } from './collecting-logger';
import type { Logger } from './logger';

export function createTestingLogger(
  logsCollection: string[],
): Logger {
  const collector = new CollectingLogger({
    output: (line) => logsCollection.push(line),
  });

  return collector.logger;
}
