import type { GraphPayload } from '@codegena/graph-core';

import type { ConvertSourceToGraphProps } from './convert-source-to-graph';

export interface GraphConversionWorkerRequest {
  input: ConvertSourceToGraphProps;
  type: 'convert';
}

export type GraphConversionWorkerResponse = (
  | { graph: GraphPayload; type: 'converted' }
  | { message: string; type: 'failed' }
);
