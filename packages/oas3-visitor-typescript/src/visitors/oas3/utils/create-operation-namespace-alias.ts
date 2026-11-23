import type { EntrypointRecordTransitiveNode } from '@codegena/oas3-core/transitive-node';
import {
  canHaveModifiers,
  factory,
  getModifiers,
  getSyntheticLeadingComments,
  isIdentifier,
  isInterfaceDeclaration,
  isModuleBlock,
  isModuleDeclaration,
  isTypeAliasDeclaration,
  NodeFlags,
  setSyntheticLeadingComments,
  SyntaxKind,
  type EntityName,
  type ImportEqualsDeclaration,
  type ModuleDeclaration,
  type Statement,
} from 'typescript';

import { isTypeOnlyNamespace } from '../../../ast-utils';
import { addTransitiveNodeComment } from '../../../misc-utils';

function forwardTypeMember(member: Statement, source: EntityName): Statement[] {
  const isExported = canHaveModifiers(member)
    && getModifiers(member)?.some(({ kind }) => kind === SyntaxKind.ExportKeyword);

  if (!isExported) {
    return [];
  }

  if (isTypeAliasDeclaration(member) || isInterfaceDeclaration(member)) {
    const reference = factory.createQualifiedName(source, member.name);
    const typeArguments = member.typeParameters?.map(({ name }) => (
      factory.createTypeReferenceNode(name)
    ));

    const alias = factory.createTypeAliasDeclaration(
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      member.name,
      member.typeParameters,
      factory.createTypeReferenceNode(reference, typeArguments),
    );

    return [setSyntheticLeadingComments(alias, getSyntheticLeadingComments(member))];
  }

  if (isModuleDeclaration(member) && isIdentifier(member.name)
    && member.body && isModuleBlock(member.body)
  ) {
    const reference = factory.createQualifiedName(source, member.name);
    const alias = forwardNamespace(member.name.text, member.body.statements, reference);

    return [setSyntheticLeadingComments(alias, getSyntheticLeadingComments(member))];
  }

  return [];
}

function forwardNamespace(
  name: string,
  members: readonly Statement[],
  source: EntityName,
): ModuleDeclaration {
  const aliases = members.flatMap((member) => forwardTypeMember(member, source));

  return factory.createModuleDeclaration(
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    factory.createIdentifier(name),
    factory.createModuleBlock(aliases),
    NodeFlags.Namespace,
  );
}

export function createOperationNamespaceAlias(
  aliasName: string,
  operation: ModuleDeclaration,
  entrypoint: EntrypointRecordTransitiveNode,
): ModuleDeclaration | ImportEqualsDeclaration {
  const source = factory.createIdentifier(operation.name.text);

  if (isTypeOnlyNamespace(operation)) {
    const alias = forwardNamespace(aliasName, operation.body.statements, source);

    return addTransitiveNodeComment(alias, entrypoint);
  }

  return factory.createImportEqualsDeclaration(
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    false,
    aliasName,
    source,
  );
}
