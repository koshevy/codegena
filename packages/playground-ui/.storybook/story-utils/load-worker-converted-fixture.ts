import { convertSourceToGraphInWorker } from '@codegena/graph-core/conversion';
import {
  fetchFixtureText,
  type ConvertedFixtureGraph,
} from '@codegena/graph-core/testing-utils';

interface LoadWorkerConvertedFixtureProps {
  fixtureBaseUrl: string;
  fixtureName: string;
  signal: AbortSignal;
}

export async function loadWorkerConvertedFixture({
  fixtureBaseUrl,
  fixtureName,
  signal,
}: LoadWorkerConvertedFixtureProps): Promise<ConvertedFixtureGraph> {
  const sourceSchemaText = await fetchFixtureText(
    fixtureName,
    fixtureBaseUrl,
  );

  signal.throwIfAborted();

  const worker = new Worker(
    new URL('./graph-conversion.worker.ts', import.meta.url),
    { type: 'module' },
  );

  const graph = await convertSourceToGraphInWorker({
    signal,
    sourceFileId: fixtureName,
    sourceText: sourceSchemaText,
    worker,
  });

  return { graph, sourceSchemaText };
}
