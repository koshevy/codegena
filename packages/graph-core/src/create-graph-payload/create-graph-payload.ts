import type { CollectedLog } from '@codegena/oas3-core/logger';
import type {
  UltimateParserVisitorResultGroup,
} from '@codegena/oas3-core/ultimate-parser';

import type { GraphPayload } from '../graph-payload';
import { collectGraphPayloadGroups } from './collect-graph-payload-groups';
import { createReferenceEdges } from './create-reference-edges';
import {
  mapCollectedLogToGraphPayloadLogEntry,
} from './map-collected-log-to-graph-payload-log-entry';
import { placeGraphPayloadDirectories } from './place-graph-payload-directories';

/**
 * Convert declaration groups and their dependencies to graph nodes and edges.
 */
export async function createGraphPayload<
  TAstObject extends object,
  TSourceFileObject extends object,
>(
  input: (
    | UltimateParserVisitorResultGroup<TSourceFileObject, TAstObject>
    | UltimateParserVisitorResultGroup<TSourceFileObject, TAstObject>[]
  ),
  logInputs: CollectedLog[] = [],
): Promise<GraphPayload<TAstObject>> {
  const groups = Array.isArray(input) ? input : [input];
  const logEntries = logInputs.map((logInput) => (
    mapCollectedLogToGraphPayloadLogEntry(logInput)
  ));
  const logs = logEntries.map(({ log }) => log);
  const collected = await collectGraphPayloadGroups(groups, logEntries);
  const referenceEdges = await createReferenceEdges(collected);
  const placement = placeGraphPayloadDirectories(
    collected.nodes,
    collected.idsByItem,
  );

  return {
    edges: [
      ...placement.edges,
      ...collected.importEdges,
      ...referenceEdges,
    ],
    logs,
    nodes: placement.nodes,
  };
}
