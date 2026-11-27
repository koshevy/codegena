import { createGraphPayload, type GraphPayload } from '@codegena/graph-core';
import { CollectingLogger } from '@codegena/oas3-core/logger';
import {
  jsonSchemaToTypescript,
  type JsonSchemaToTypescriptProps,
} from '@codegena/oas3-visitor-typescript';

export interface ConvertSourceToGraphProps {
  mode?: JsonSchemaToTypescriptProps['mode'];
  sourceFileId: string;
  sourceText: string;
}

/**
 * Convert source text with the current visitor and preserve its diagnostics.
 */
export async function convertSourceToGraph({
  mode = 'separateFiles',
  sourceFileId,
  sourceText,
}: ConvertSourceToGraphProps): Promise<GraphPayload> {
  const logCollector = new CollectingLogger({
    sourceFileId,
    sourceText,
  });

  const groups = await jsonSchemaToTypescript({
    jsoncTextData: sourceText,
    logger: logCollector.logger,
    mode,
    srcFileId: sourceFileId,
  });

  return createGraphPayload(groups, logCollector.getLogs());
}
