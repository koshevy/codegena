import type { Node } from 'jsonc-parser';

import { reconstructJsoncArray } from './reconstruct-jsonc-array';
import { reconstructJsoncObject } from './reconstruct-jsonc-object';
import { reconstructJsoncUnknown } from './reconstruct-jsonc-unknown';
import type { ReconstructedJsoncValue } from './reconstructed-jsonc-value';

export function reconstructJsonc(
  node: Node,
  sourceFileId: string,
  getOriginalFileContent: () => string,
  jsonPath: string[] = [],
): ReconstructedJsoncValue {
  return reconstructJsoncUnknown(
    node,
    sourceFileId,
    getOriginalFileContent,
    {
      array: reconstructJsoncArray,
      object: reconstructJsoncObject,
      unknown: reconstructJsoncUnknown,
    },
    jsonPath,
  );
}
