import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import type { Node as TsNode } from 'typescript';

import { addTransitiveNodeComment } from './add-transitive-node-comment';
import { addExportModifier } from '../ast-utils/add-export-modifier';

export function enrichTypescriptNode(
  ast: TsNode,
  transitiveNode: TransitiveNode,
): TsNode {
  const exportedAst = addExportModifier(ast);

  return addTransitiveNodeComment(exportedAst, transitiveNode);
}
