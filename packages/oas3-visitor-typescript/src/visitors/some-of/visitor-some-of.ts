import type {
  IntersectionTransitiveNode,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';
import { doAdditionOfTransitiveNodes } from '@codegena/oas3-core/transitive-parser';
import kebabCase from 'lodash/kebabCase';
import {
  isTypeNode,
  type Node as TsNode,
} from 'typescript';

import {
  createAllOfInterfaceDeclaration,
} from './create-all-of-interface-declaration';
import { createIntersectionType } from './create-intersection-type';
import { createUnionAst } from './create-union-ast';
import {
  flattenInlineIntersectionParts,
} from './flatten-inline-intersection-parts';
import { getRenderableVariants } from './get-renderable-variants';
import {
  createAstToString,
  createTypeAliasDeclaration,
} from '../../ast-utils';
import {
  createTypeIdentifierName,
} from '../../misc-utils';
import { programmingLanguageInfo } from '../../programming-language-info';
import type {
  TypescriptParserVisitorFn,
  VisitorFnProps,
} from '../../typescript-parser-visitor-fn';

export const visitorSomeOf: TypescriptParserVisitorFn = ({
  getAnotherByTransitiveNode,
  logger,
  microContext,
  options,
  suggestedName,
  transitiveNode,
}) => {
  if (transitiveNode.type !== 'intersection'
    && transitiveNode.type !== 'union'
  ) {
    return null;
  }

  const identifierName = createTypeIdentifierName({
    name: transitiveNode.name,
    suggestedName: suggestedName ?? transitiveNode.suggestedName,
    fallbackNameAspect: 'SomeOfType',
    logger,
    reserveName: !transitiveNode.isInline && transitiveNode.type === 'union',
  });

  const result = transitiveNode.type === 'intersection'
    ? createIntersectionAst({
        getAnotherByTransitiveNode,
        identifierName,
        logger,
        microContext,
        transitiveNode,
      })
    : {
        ast: createUnionAst(
          identifierName,
          logger,
          transitiveNode,
          getAnotherByTransitiveNode,
          options,
        ),
        relativeFilePath: `${kebabCase(identifierName)}.ts`,
      };
  const { ast, relativeFilePath } = result;
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

function createIntersectionAst({
  getAnotherByTransitiveNode,
  identifierName,
  logger,
  microContext,
  transitiveNode,
}: {
  getAnotherByTransitiveNode: VisitorFnProps['getAnotherByTransitiveNode'];
  identifierName: string;
  logger: VisitorFnProps['logger'];
  microContext: VisitorFnProps['microContext'];
  transitiveNode: IntersectionTransitiveNode;
}): { ast: TsNode; relativeFilePath: string } {
  const variants = getRenderableVariants(transitiveNode, logger);
  const directParts = transitiveNode.mixin
    ? [transitiveNode.mixin, ...variants]
    : variants;

  const parts = directParts.flatMap((part) => (
    flattenInlineIntersectionParts(part, logger)
  ));

  const mergedParts = parts.reduce<TransitiveNode[]>((result, part) => {
    if (part.type === 'reference') {
      return [...result, part];
    }

    const matchingIndex = result.findIndex((item) => item.type === part.type);

    if (matchingIndex === -1) {
      return [...result, part];
    }

    const matchingPart = result[matchingIndex];

    if (matchingPart) {
      return result.with(
        matchingIndex,
        doAdditionOfTransitiveNodes(matchingPart, part),
      );
    }

    return result;
  }, []);

  const [singlePart] = mergedParts;

  if (singlePart
    && !transitiveNode.isInline
    && mergedParts.length === 1
  ) {
    const result = getAnotherByTransitiveNode({
      ...singlePart,
      isInline: false,
      name: undefined,
      suggestedName: identifierName,
    });

    if (typeof result !== 'function') {
      if (isTypeNode(result.ast)) {
        const fallbackDeclarationName = createTypeIdentifierName({
          name: identifierName,
          fallbackNameAspect: 'SomeOfType',
          logger,
        });

        return {
          ast: createTypeAliasDeclaration(fallbackDeclarationName, result.ast),
          relativeFilePath: `${kebabCase(fallbackDeclarationName)}.ts`,
        };
      }

      return {
        ast: result.ast,
        relativeFilePath: result.relativeFilePath,
      };
    }
  }

  const declarationName = transitiveNode.isInline
    ? identifierName
    : createTypeIdentifierName({
        name: identifierName,
        fallbackNameAspect: 'SomeOfType',
        logger,
      });

  const compatibleTransitiveNode: IntersectionTransitiveNode = {
    ...transitiveNode,
    referredTransitiveNodes: mergedParts.filter(
      (part) => part !== transitiveNode.mixin,
    ),
  };

  const interfaceDeclaration = createAllOfInterfaceDeclaration({
    getAnotherByTransitiveNode,
    identifierName: declarationName,
    logger,
    microContext,
    transitiveNode: compatibleTransitiveNode,
  });

  if (interfaceDeclaration) {
    return {
      ast: interfaceDeclaration,
      relativeFilePath: `${kebabCase(declarationName)}.ts`,
    };
  }

  const type = createIntersectionType(
    {
      ...compatibleTransitiveNode,
      mixin: null,
      referredTransitiveNodes: mergedParts,
    },
    getAnotherByTransitiveNode,
  );

  return {
    ast: transitiveNode.isInline
      ? type
      : createTypeAliasDeclaration(declarationName, type),
    relativeFilePath: `${kebabCase(declarationName)}.ts`,
  };
}
