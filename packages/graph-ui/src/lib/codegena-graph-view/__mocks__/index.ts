import type { GraphPayload } from '@codegena/graph-core';

import comprehensiveGraphJson from './comprehensive-graph.json';
import coreVocabularyGraphJson from './core-vocabulary-meta-schema-graph.json';
import geometryGraphJson from './json-schema-from-internet-geometry-graph.json';

/** Story snapshots derived from the matching graph-core examples. */
export const comprehensiveGraph = comprehensiveGraphJson as GraphPayload;
export const coreVocabularyGraph = coreVocabularyGraphJson as GraphPayload;
export const geometryGraph = geometryGraphJson as GraphPayload;
