import {
  isInterfaceDeclaration,
  isModuleBlock,
  isModuleDeclaration,
  isTypeAliasDeclaration,
  type ModuleBlock,
  type ModuleDeclaration,
  type Statement,
} from 'typescript';

function isTypeOnlyMember(statement: Statement): boolean {
  return isTypeAliasDeclaration(statement)
    || isInterfaceDeclaration(statement)
    || (isModuleDeclaration(statement) && isTypeOnlyNamespace(statement));
}

export function isTypeOnlyNamespace(
  namespace: ModuleDeclaration,
): namespace is ModuleDeclaration & { body: ModuleBlock } {
  const { body } = namespace;

  return body !== undefined
    && isModuleBlock(body)
    && body.statements.every((member) => isTypeOnlyMember(member));
}
