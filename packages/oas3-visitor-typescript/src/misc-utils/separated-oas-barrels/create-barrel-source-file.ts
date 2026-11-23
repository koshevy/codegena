import { posix } from 'pathe';
import { factory, type SourceFile } from 'typescript';

import type { BarrelPlan } from './barrel-plan';
import { createGroupSourceFile } from '../../ast-utils/create-group-source-file';

export function createBarrelSourceFile(
  { fileName, sourceGroups }: BarrelPlan,
  outputFileName = fileName,
): SourceFile {
  const exports = sourceGroups.map((group) => {
    const declarations = group.groupedItems.flatMap(({ identifierName }) => (
      identifierName
        ? [factory.createExportSpecifier(false, undefined, identifierName)]
        : []
    ));
    const moduleName = posix.basename(group.fileName, posix.extname(group.fileName));

    return factory.createExportDeclaration(
      undefined,
      true,
      factory.createNamedExports(declarations),
      factory.createStringLiteral(`./${moduleName}`),
    );
  });

  const statements = exports.length
    ? exports
    : [factory.createExportDeclaration(undefined, true, factory.createNamedExports([]))];

  return createGroupSourceFile(outputFileName, statements, []);
}
