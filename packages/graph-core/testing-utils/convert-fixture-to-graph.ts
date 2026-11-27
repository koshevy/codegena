import type { GraphPayload } from '@codegena/graph-core';
import { convertSourceToGraph } from '@codegena/graph-core/conversion';
import type { JsonSchemaToTypescriptProps } from '@codegena/oas3-visitor-typescript';

import { fetchFixtureText } from './fetch-fixture-text';

export interface ConvertedFixtureGraph {
  graph: GraphPayload;
  sourceSchemaText: string;
}

export interface ConvertFixtureToGraphOptions {
  fixtureBaseUrl?: string;
  mode?: JsonSchemaToTypescriptProps['mode'];
  sourceSchemaText?: string;
}

/**
 * Convert a JSON Schema or OpenAPI fixture using the real generator and logs.
 * Supply sourceSchemaText for local files; browser stories fetch from fixtureBaseUrl.
 */
export async function convertFixtureToGraph(
  fixtureName: string,
  {
    fixtureBaseUrl = '/fixtures',
    mode = 'separateFiles',
    sourceSchemaText: providedSourceText,
  }: ConvertFixtureToGraphOptions = {},
): Promise<ConvertedFixtureGraph> {
  const sourceSchemaText = providedSourceText
    ?? await fetchFixtureText(fixtureName, fixtureBaseUrl);

  const graph = await convertSourceToGraph({
    mode,
    sourceFileId: fixtureName,
    sourceText: sourceSchemaText,
  });

  return { graph, sourceSchemaText };
}
