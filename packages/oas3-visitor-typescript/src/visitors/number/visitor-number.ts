import type { Logger } from '@codegena/oas3-core/logger';
import type {
  NumericScalarTransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import { getNodeErrorText } from '@codegena/oas3-core/transitive-parser';
import {
  factory,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

import { createTypescriptTypeAliasVisitorResult } from '../../misc-utils';
import type { TypescriptParserVisitorFn } from '../../typescript-parser-visitor-fn';

export const visitorNumber: TypescriptParserVisitorFn = ({
  logger,
  suggestedName,
  transitiveNode,
}) => {
  if (transitiveNode.type !== 'scalar'
    || (transitiveNode.scalarType !== 'integer'
      && transitiveNode.scalarType !== 'number')
  ) {
    return null;
  }

  warnIgnoredNumberOptions(transitiveNode, logger);

  return createTypescriptTypeAliasVisitorResult({
    fallbackNameAspect: 'NumberType',
    logger,
    suggestedName,
    transitiveNode,
    typeNode: createNumberType(),
  });
};

function createNumberType(): TypeNode {
  return factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
}

function warnIgnoredNumberOptions(
  transitiveNode: NumericScalarTransitiveNode,
  logger: Logger | undefined,
): void {
  const { numberOptions, source } = transitiveNode;
  const ignoredProperties = [
    ...(numberOptions.exclusiveMaximum === undefined
      ? []
      : ['exclusiveMaximum']),
    ...(numberOptions.exclusiveMinimum === undefined
      ? []
      : ['exclusiveMinimum']),
    ...(numberOptions.maximum === undefined ? [] : ['maximum']),
    ...(numberOptions.minimum === undefined ? [] : ['minimum']),
    ...(numberOptions.multipleOf === undefined ? [] : ['multipleOf']),
  ];

  if (!logger || !ignoredProperties.length) {
    return;
  }

  const stringPath = source.jsonPath.join('.') || 'root schema';
  const errorText = getNodeErrorText(
    source.getOriginalFileContent(),
    source.node,
    source.sourceFileId,
  );

  ignoredProperties.forEach((propertyName) => {
    logger.warn(
      { node: source.node },
      [
        `Property "${propertyName}" at ${stringPath} was ignored.`,
        'TypeScript cannot represent numeric constraints.',
        errorText,
      ].join('\n'),
    );
  });
}
