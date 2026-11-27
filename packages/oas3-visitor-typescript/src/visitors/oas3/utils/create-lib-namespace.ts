import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import {
  addSyntheticLeadingComment,
  factory,
  NodeFlags,
  SyntaxKind,
  type EntityName,
  type ModuleDeclaration,
  type TypeNode,
} from 'typescript';

import { addTransitiveNodeComment } from '../../../misc-utils';

export interface LibNamespaceMember {
  name: string;
  source: TransitiveNode;
  type: TypeNode;
}

export function createLibTypeReference(path: string[]): TypeNode {
  const [root, ...members] = path;

  if (!root) {
    throw new Error('A library type reference needs a namespace path.');
  }

  const entityName = members.reduce<EntityName>((parent, name) => (
    factory.createQualifiedName(parent, name)
  ), factory.createIdentifier(root));

  return factory.createTypeReferenceNode(entityName);
}

export function createLibNamespace(
  members: LibNamespaceMember[],
  name = 'Lib',
  nestedNamespacePath?: string,
): ModuleDeclaration {
  const aliases = members.map((member) => {
    const alias = factory.createTypeAliasDeclaration(
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      member.name,
      undefined,
      member.type,
    );

    return addTransitiveNodeComment(alias, member.source);
  });

  const namespace = factory.createModuleDeclaration(
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    factory.createIdentifier(name),
    factory.createModuleBlock(aliases),
    NodeFlags.Namespace,
  );

  const commentLines = [
    '*',
    ' * Flat list of all utility data types used by this OpenAPI declaration',
    ' * and defined in the specification.',
    ...(nestedNamespacePath
      ? [
          ' *',
          ' * These types are also available through nested namespace paths,',
          ` * such as {@link ${nestedNamespacePath}}.`,
        ]
      : []),
    ' ',
  ];

  return addSyntheticLeadingComment(
    namespace,
    SyntaxKind.MultiLineCommentTrivia,
    commentLines.join('\n'),
    true,
  );
}
