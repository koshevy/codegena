import kebabCase from 'lodash/kebabCase';
import {
  type DeclarationStatement,
  type TypeNode,
} from 'typescript';

import { createAstToString } from './create-ast-to-string';
import { createTypeAliasDeclaration } from './create-type-alias-declaration';

export async function printDeclarationStatement(
  typeAliasDeclaration: DeclarationStatement,
  fileName?: string,
): Promise<string> {
  return createAstToString(
    typeAliasDeclaration,
    fileName ?? `${kebabCase(typeAliasDeclaration.name?.text) ?? 'source-file'}.ts`,
  )();
}

export async function printTypeDeclaration(
  typeName: string,
  typeNode: TypeNode,
  fileName = `${kebabCase(typeName)}.ts`,
): Promise<string> {
  return printDeclarationStatement(
    createTypeAliasDeclaration(typeName, typeNode),
    fileName,
  );
}
