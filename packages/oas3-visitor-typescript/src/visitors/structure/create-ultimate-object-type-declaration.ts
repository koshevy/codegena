import { defaultLogger } from '@codegena/oas3-core/logger';
import type { StructureTransitiveNode } from '@codegena/oas3-core/transitive-node';
import { getNodeErrorText } from '@codegena/oas3-core/transitive-parser';
import {
  type DeclarationStatement,
  factory,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

import { extractPropertyPatterns } from './extract-property-patterns';
import { extractPropertySignatures } from './extract-property-signatures';
import { extractReferredIdentifiers } from './extract-referred-identifiers';
import { extractReferredTypes } from './extract-referred-types';
import {
  createFallbackObjectType,
  createTypeAliasDeclaration,
  hasInlineTransitiveNodes,
} from '../../ast-utils';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';

export function createUltimateObjectTypeDeclaration(props: VisitorFnProps & {
  name: string;
  transitiveNode: StructureTransitiveNode;
}): DeclarationStatement | TypeNode {
  const {
    getAnotherByTransitiveNode,
    logger = defaultLogger,
    name,
    transitiveNode,
  } = props;
  const patternsType = extractPropertyPatterns(props);
  const propertySignatures = extractPropertySignatures(props);
  const { node, jsonPath } = transitiveNode.source;
  const { referredTransitiveNodes = [] } = transitiveNode;
  const defaultObjectTypeWarning = 'Used Record<string, unknown> as a fallback.';
  const currentPathStringified = jsonPath.length
    ? jsonPath.join('.')
    : 'root schema';

  const getSourceLocationText = (): string => getNodeErrorText(
    transitiveNode.source.getOriginalFileContent(),
    node,
    transitiveNode.source.sourceFileId,
  );

  const hasRefs = referredTransitiveNodes.length > 0;
  const containsInlineTransitiveNodes = hasInlineTransitiveNodes(
    referredTransitiveNodes,
  );

  const referredTypes = hasRefs
    ? extractReferredTypes({
        getAnotherByTransitiveNode,
        referredTransitiveNodes,
        processRefsAsNamed: !containsInlineTransitiveNodes,
        transitiveNode,
      })
    : null;

  const createDeclaration = (): DeclarationStatement | TypeNode | null => {
    const hasPartsToIntersect = Boolean(referredTypes || propertySignatures?.length);

    if (hasPartsToIntersect && patternsType) {
      const intersectionType = factory.createIntersectionTypeNode([
        ...(patternsType ? [patternsType] : []),
        ...(referredTypes ? referredTypes : []),
        ...(
          propertySignatures
            ? [factory.createTypeLiteralNode(propertySignatures)]
            : []
        ),
      ]);

      return transitiveNode.isInline
        ? intersectionType
        : createTypeAliasDeclaration(name, intersectionType);
    }

    if (referredTypes
      && propertySignatures?.length
      && (containsInlineTransitiveNodes || transitiveNode.isInline)
    ) {
      const literalType = factory.createTypeLiteralNode(propertySignatures);
      const intersectionType = factory.createIntersectionTypeNode([
        ...referredTypes,
        literalType,
      ]);

      return transitiveNode.isInline
        ? intersectionType
        : createTypeAliasDeclaration(name, intersectionType);
    }

    if (hasRefs && propertySignatures?.length) {
      const identifiers = extractReferredIdentifiers(
        referredTransitiveNodes,
      );

      const heritageClause = factory.createHeritageClause(
        SyntaxKind.ExtendsKeyword,
        identifiers,
      );

      return factory.createInterfaceDeclaration(
        undefined,
        name,
        undefined,
        [heritageClause],
        propertySignatures,
      );
    }

    if (propertySignatures?.length) {
      return transitiveNode.isInline
        ? factory.createTypeLiteralNode(propertySignatures)
        : factory.createInterfaceDeclaration(
            undefined,
            name,
            undefined,
            undefined,
            propertySignatures,
          );
    }

    if (patternsType) {
      return transitiveNode.isInline
        ? patternsType
        : createTypeAliasDeclaration(name, patternsType);
    }
    return null;
  };

  let declaration: DeclarationStatement | TypeNode | null = null;

  try {
    declaration = createDeclaration();
  }
  catch (error) {
    logger.error(
      { error, node },
      [
        `Error occurred at parsing of ${currentPathStringified} with message:`,
        (error instanceof Error) ? error.message : String(error),
        defaultObjectTypeWarning,
        getSourceLocationText(),
      ].join('\n'),
    );
  }

  if (declaration) {
    return declaration;
  }

  logger.warn(
    { node },
    [
      `Unable to correctly parse object at ${currentPathStringified}`,
      defaultObjectTypeWarning,
      getSourceLocationText(),
    ].join('\n'),
  );

  return transitiveNode.isInline
    ? createFallbackObjectType()
    : createTypeAliasDeclaration(name, createFallbackObjectType());
}
