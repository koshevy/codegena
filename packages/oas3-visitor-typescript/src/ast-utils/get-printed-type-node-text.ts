import {
  createSourceFile,
  EmitHint,
  ScriptTarget,
  type TypeNode,
} from 'typescript';

import { createPrinterCached } from './create-printer-cached';

const sourceFile = createSourceFile('type-members.ts', '', ScriptTarget.Latest);

export function getPrintedTypeNodeText(typeNode: TypeNode): string {
  return createPrinterCached().printNode(
    EmitHint.Unspecified,
    typeNode,
    sourceFile,
  );
}
