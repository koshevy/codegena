import type { GraphPayload } from '@codegena/graph-core';

import tree from './__fixtures__/onepassword-generated-file-tree.graph.json';

/**
 * File-tree projection from the OnePassword specification used by the
 * GeneratedFilesList ConstrainedDirectories story. See __fixtures__/README.md
 * for its source hash and the fields retained for this illustration.
 */
export const onePasswordGeneratedFileTree = tree as GraphPayload;
