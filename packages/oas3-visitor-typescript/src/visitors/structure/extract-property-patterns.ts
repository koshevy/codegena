import { defaultLogger, type Logger } from '@codegena/oas3-core/logger';
import type { StructureTransitiveNode } from '@codegena/oas3-core/transitive-node';
import { getNodeErrorText } from '@codegena/oas3-core/transitive-parser';
import { factory, type TypeNode } from 'typescript';

import {
  areTypesSimplyEqual,
  compressTypeNodes,
  createFallbackKeyType,
  createFallbackType,
  extractTransitiveNodeIdentifier,
} from '../../ast-utils';
import { regexToTemplate } from '../../regex-to-template';
import type { VisitorFnProps } from '../../typescript-parser-visitor-fn';
import type { VisitorMicroContext } from '../../visitor-micro-context';

export interface ConvertPropertyPatternsProps
  extends Pick<VisitorFnProps, 'getAnotherByTransitiveNode'> {

  microContext?: VisitorMicroContext;
  logger?: Logger;
  transitiveNode: StructureTransitiveNode;
}

export function extractPropertyPatterns({
  getAnotherByTransitiveNode,
  microContext = { shouldBeGroupedWith: [] },
  logger = defaultLogger,
  transitiveNode,
}: ConvertPropertyPatternsProps): TypeNode | null {
  const {
    additionalProperties: additionalPropertiesTransitiveNode,
    propertyPatterns,
    source,
  } = transitiveNode;
  const { node, jsonPath } = source;

  let directPatternTypes: TypeNode[] = [];
  const refinedPatternTypes: {
    key: TypeNode;
    value: [TypeNode];
  }[] = [];

  const createDefaultKeyType = (): TypeNode => {
    const keyPatterns = transitiveNode.defaultKeyPattern;

    if (!keyPatterns) {
      return createFallbackKeyType();
    }

    const keyTypes = (
      Array.isArray(keyPatterns) ? keyPatterns : [keyPatterns]
    ).map((item) => regexToTemplate(item));

    return keyTypes.length === 1
      ? keyTypes[0]
      : factory.createIntersectionTypeNode(keyTypes);
  };

  // additionalProperties is defined and the same
  if (
    typeof additionalPropertiesTransitiveNode === 'object'
    && additionalPropertiesTransitiveNode
    && additionalPropertiesTransitiveNode.source === source
  ) {
    directPatternTypes.push(createFallbackType());
  }
  // additionalProperties is defined and not the same
  else if (
    typeof additionalPropertiesTransitiveNode === 'object'
    && additionalPropertiesTransitiveNode
  ) {
    const fullPathOfAdditionalProperties = [
      ...jsonPath,
      'additionalProperties',
    ];

    const extractAdditionalPropertiesType = (): TypeNode => {
      const {
        isInline,
        name,
      } = additionalPropertiesTransitiveNode;

      const nestedExtractingResult = getAnotherByTransitiveNode(
        additionalPropertiesTransitiveNode,
      );
      const isCycledDependency = typeof nestedExtractingResult === 'function';
      const additionalPropertiesIdentifier = isCycledDependency || (!isInline && name)
        ? extractTransitiveNodeIdentifier(
            additionalPropertiesTransitiveNode,
            nestedExtractingResult,
            transitiveNode,
          )
        : nestedExtractingResult.ast as TypeNode;

      if (typeof nestedExtractingResult === 'function') {
        logger?.info(
          { node },
          [
            `Recursive dependency detected: ${fullPathOfAdditionalProperties.join('.')}.`,
            'It is OK, don\'t worry!',
          ].join('\n'),
        );

        microContext.hasCycleDependencies = true;
        microContext.shouldBeGroupedWith.push(
          nestedExtractingResult,
        );
      }

      return additionalPropertiesIdentifier;
    };

    try {
      directPatternTypes.push(extractAdditionalPropertiesType());
    }
    catch (error) {
      logger?.warn(
        { error, node },
        [
          `Error occurred at parsing of ${fullPathOfAdditionalProperties.join('.')}`,
          'Default value of additional properties decided to use unknown.',
          getNodeErrorText(
            additionalPropertiesTransitiveNode.source.getOriginalFileContent(),
            additionalPropertiesTransitiveNode.source.node,
            additionalPropertiesTransitiveNode.source.sourceFileId,
          ),
        ].join('\n'),
      );

      directPatternTypes.push(createFallbackType());
    }
  }
  // additionalProperties is true, but unknown
  else if (additionalPropertiesTransitiveNode) {
    logger?.warn(
      { node },
      [
        `Type of ${jsonPath.join('.')}.additionalProperties is not set.`,
        'In order to keep type safety, it decided to use unknown.',
        getNodeErrorText(
          source.getOriginalFileContent(),
          node,
          source.sourceFileId,
        ),
      ].join('\n'),
    );

    directPatternTypes.push(
      createFallbackType(),
    );
  }

  propertyPatterns?.forEach(([regexp, nestedTransitiveNode]) => {
    const keyType = regexToTemplate(regexp);
    let valueTypeIdentifier: TypeNode;

    try {
      const valueType = getAnotherByTransitiveNode(nestedTransitiveNode);

      valueTypeIdentifier = extractTransitiveNodeIdentifier(
        nestedTransitiveNode,
        valueType,
        transitiveNode,
      );
    }
    catch (error) {
      logger?.warn(
        { error, node },
        [
          'Error occurred at parsing of:',
          `${jsonPath.join('.')}.propertyPatterns.${String(regexp)}`,
          'Used unknown type as a fallback.',
          getNodeErrorText(
            nestedTransitiveNode.source.getOriginalFileContent(),
            nestedTransitiveNode.source.node,
            nestedTransitiveNode.source.sourceFileId,
          ),
        ].join('\n'),
      );

      valueTypeIdentifier = createFallbackType();
    }

    if (areTypesSimplyEqual(createFallbackKeyType(), keyType)
      || areTypesSimplyEqual(createDefaultKeyType(), keyType)
    ) {
      directPatternTypes.push(valueTypeIdentifier);
    }
    else {
      // check if value could be grouped by the same key
      const alreadyExistingGroup = refinedPatternTypes
        .find(({ key: existingKeyType }) => (
          areTypesSimplyEqual(existingKeyType, keyType)
        ));

      // I really hate this nested "if"! But it makes sense here.
      if (alreadyExistingGroup) {
        alreadyExistingGroup.value.push(valueTypeIdentifier);
      }
      else {
        refinedPatternTypes.push({
          key: keyType,
          value: [valueTypeIdentifier],
        });
      }
    }
  });

  let directTypesSummarised: TypeNode | undefined;

  directPatternTypes = compressTypeNodes(directPatternTypes);

  if (directPatternTypes.length === 1) {
    directTypesSummarised = factory.createTypeReferenceNode('Record', [
      createDefaultKeyType(),
      directPatternTypes[0],
    ]);
  }
  else if (directPatternTypes.length) {
    directTypesSummarised = factory.createTypeReferenceNode('Record', [
      createDefaultKeyType(),
      factory.createUnionTypeNode(directPatternTypes),
    ]);
  }

  const wrappedRefinedPatternTypes = refinedPatternTypes
    .map(({ key, value }) => {
      const valueTypesUniq = compressTypeNodes(value);
      const valueTypeSummarized = valueTypesUniq.length === 1
        ? valueTypesUniq[0]
        : factory.createUnionTypeNode(valueTypesUniq);

      return factory.createTypeReferenceNode('Record', [key, valueTypeSummarized]);
    });

  if (directTypesSummarised && wrappedRefinedPatternTypes.length) {
    return factory.createIntersectionTypeNode([
      directTypesSummarised,
      ...wrappedRefinedPatternTypes,
    ]);
  }

  if (directTypesSummarised) {
    return directTypesSummarised;
  }

  if (wrappedRefinedPatternTypes.length === 1) {
    return wrappedRefinedPatternTypes[0];
  }

  if (wrappedRefinedPatternTypes.length) {
    return factory.createIntersectionTypeNode(
      wrappedRefinedPatternTypes,
    );
  }

  return null;
}
