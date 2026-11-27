import type { Logger } from '@codegena/oas3-core/logger';
import type {
  StringScalarTransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import { getNodeErrorText } from '@codegena/oas3-core/transitive-parser';
import {
  factory,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

import {
  createStringBuiltInFormatType,
} from '../../ast-utils';
import { createTypescriptTypeAliasVisitorResult } from '../../misc-utils';
import { regexToTemplate } from '../../regex-to-template';
import type { TypescriptParserVisitorFn } from '../../typescript-parser-visitor-fn';

export const visitorString: TypescriptParserVisitorFn = ({
  logger,
  suggestedName,
  transitiveNode,
}) => {
  if (transitiveNode.type !== 'scalar'
    || transitiveNode.scalarType !== 'string'
  ) {
    return null;
  }

  warnIgnoredStringOptions(transitiveNode, logger);

  return createTypescriptTypeAliasVisitorResult({
    fallbackNameAspect: 'StringType',
    logger,
    suggestedName,
    transitiveNode,
    typeNode: createStringType(transitiveNode),
  });
};

function createStringType(transitiveNode: StringScalarTransitiveNode): TypeNode {
  const formatType = createStringBuiltInFormatType(
    transitiveNode.stringOptions?.format,
  );

  const patternType = transitiveNode.stringOptions?.pattern
    ? regexToTemplate(transitiveNode.stringOptions.pattern)
    : null;

  if (formatType && patternType) {
    return factory.createIntersectionTypeNode([formatType, patternType]);
  }

  if (formatType) {
    return formatType;
  }

  if (patternType) {
    return patternType;
  }

  return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
}

function warnIgnoredStringOptions(
  transitiveNode: StringScalarTransitiveNode,
  logger: Logger | undefined,
): void {
  const { stringOptions, source } = transitiveNode;
  const ignoredProperties = [
    ...(stringOptions?.minLength === undefined ? [] : ['minLength']),
    ...(stringOptions?.maxLength === undefined ? [] : ['maxLength']),
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
        'TypeScript cannot represent string length constraints.',
        errorText,
      ].join('\n'),
    );
  });
}
