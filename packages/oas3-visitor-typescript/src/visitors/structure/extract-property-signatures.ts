import { defaultLogger, type Logger } from '@codegena/oas3-core/logger';
import type { StructureTransitiveNode } from '@codegena/oas3-core/transitive-node';
import { getNodeErrorText } from '@codegena/oas3-core/transitive-parser';
import {
  factory,
  type PropertySignature,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

import { resolveInheritedProperty } from './resolve-inherited-property';
import {
  createFallbackType,
  createPropertyName,
  extractTransitiveNodeIdentifier,
} from '../../ast-utils';
import { addTransitiveNodeComment } from '../../misc-utils';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';
import type { VisitorMicroContext } from '../../visitor-micro-context';

export interface ExtractPropertySignaturesProps
  extends Pick<VisitorFnProps, 'getAnotherByTransitiveNode'> {

  microContext?: VisitorMicroContext;
  logger?: Logger;
  transitiveNode: StructureTransitiveNode;
}

export function extractPropertySignatures({
  getAnotherByTransitiveNode,
  microContext = { shouldBeGroupedWith: [] },
  logger = defaultLogger,
  transitiveNode,
}: ExtractPropertySignaturesProps): PropertySignature[] | null {
  const { properties } = transitiveNode;

  if (!properties) {
    return null;
  }

  return Object.entries(properties).map((
    [propertyName, propertyTransitiveNode],
  ) => {
    const inheritedProperty = propertyTransitiveNode.isRequired
      && propertyTransitiveNode.type === 'unknown'
      && !propertyTransitiveNode.isNever
      ? resolveInheritedProperty(transitiveNode, propertyName)
      : undefined;

    const resolvedProperty = inheritedProperty
      ? {
          ...inheritedProperty,
          isRequired: true,
          options: {
            ...inheritedProperty.options,
            // A redeclaration must not reuse the base property's pending parse.
            transitiveNodeCacheKey: [
              'inherited',
              ...transitiveNode.source.jsonPath,
              propertyName,
            ].join('/'),
          },
        }
      : propertyTransitiveNode;

    if (resolvedProperty.isNever) {
      const neverPropertySignature = factory.createPropertySignature(
        undefined,
        createPropertyName(propertyName),
        factory.createToken(SyntaxKind.QuestionToken),
        factory.createKeywordTypeNode(SyntaxKind.NeverKeyword),
      );

      return addTransitiveNodeComment(
        neverPropertySignature,
        resolvedProperty,
      );
    }

    const { isInline, source } = resolvedProperty;

    const questionMark = resolvedProperty.isRequired
      ? undefined
      : factory.createToken(SyntaxKind.QuestionToken);

    let propertyTypeIdentifier: ReturnType<
      typeof extractTransitiveNodeIdentifier
    >;

    const extractPropertyType = (): ReturnType<
      typeof extractTransitiveNodeIdentifier
    > => {
      const nestedExtractingResult = getAnotherByTransitiveNode(
        resolvedProperty,
      );
      const isCycledDependency = typeof nestedExtractingResult === 'function';

      const resolvedType = isCycledDependency || !isInline
        ? extractTransitiveNodeIdentifier(
            resolvedProperty,
            nestedExtractingResult,
            transitiveNode,
          )
        : nestedExtractingResult.ast as TypeNode;

      if (typeof nestedExtractingResult === 'function') {
        logger?.info(
          { node: source.node },
          [
            `Recursive dependency detected: ${source.jsonPath.join('.')}.`,
            'It is OK, don\'t worry!',
          ].join('\n'),
        );

        microContext.hasCycleDependencies = true;
        microContext.shouldBeGroupedWith.push(
          nestedExtractingResult,
        );
      }

      return resolvedType;
    };

    try {
      propertyTypeIdentifier = extractPropertyType();
    }
    catch {
      logger?.warn(
        { node: source.node },
        [
          `Error occurred at parsing of ${source.jsonPath.join('.')}.`,
          'Used unknown type as a fallback.',
          getNodeErrorText(
            source.getOriginalFileContent(),
            source.node,
            source.sourceFileId,
          ),
        ].join('\n'),
      );

      propertyTypeIdentifier = createFallbackType();
    }

    const propertySignature = factory.createPropertySignature(
      undefined,
      createPropertyName(propertyName),
      questionMark,
      propertyTypeIdentifier,
    );

    return addTransitiveNodeComment(propertySignature, resolvedProperty);
  });
}
