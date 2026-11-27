import kebabCase from 'lodash/kebabCase';

import {
  createUltimateObjectTypeDeclaration,
} from './create-ultimate-object-type-declaration';
import { createAstToString } from '../../ast-utils';
import { createTypeIdentifierName } from '../../misc-utils';
import { programmingLanguageInfo } from '../../programming-language-info';
import type {
  TypescriptParserVisitorFn,
} from '../../typescript-parser-visitor-fn';

export const visitorStructure: TypescriptParserVisitorFn = ({
  getAnotherByTransitiveNode,
  logger,
  microContext,
  suggestedName,
  transitiveNode,
}) => {
  if (transitiveNode.type !== 'structure') {
    return null;
  }

  const name = createTypeIdentifierName({
    name: transitiveNode.name,
    suggestedName: suggestedName ?? transitiveNode.suggestedName,
    fallbackNameAspect: 'ObjectType',
    logger,
    reserveName: !transitiveNode.isInline,
  });

  const ast = createUltimateObjectTypeDeclaration({
    getAnotherByTransitiveNode,
    logger,
    microContext,
    name,
    transitiveNode,
  });

  const relativeFilePath = `${kebabCase(name)}.ts`;
  const toString = createAstToString(ast, relativeFilePath);

  return {
    ...programmingLanguageInfo,
    ast,
    getAnotherByTransitiveNode,
    relativeFilePath,
    transitiveNode,
    toString,
  };
};
