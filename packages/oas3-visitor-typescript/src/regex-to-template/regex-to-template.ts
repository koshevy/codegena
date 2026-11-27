import {
  factory,
  SyntaxKind,
  type TemplateLiteralTypeSpan,
  type TypeNode as TsTypeNode,
} from 'typescript';

import {
  regexToIntermediateResult,
  isIntermediateResultLiteral,
  isIntermediateResultString,
  isIntermediateResultUnion,
  stringTypeTemplateSymbol,
} from './regex-to-intermediate';

function createFallbackNode(): TsTypeNode {
  return factory.createKeywordTypeNode(
    SyntaxKind.StringKeyword,
  );
}

function wrapTypeToTemplateLiteralTypeSpan(
  type: TsTypeNode,
  text: string,
  isLastElement: boolean,
): TemplateLiteralTypeSpan {
  return factory.createTemplateLiteralTypeSpan(
    type,
    isLastElement
      ? factory.createTemplateTail(text, text)
      : factory.createTemplateMiddle(text, text),
  );
}

/**
 * Converts RegExp to
 * the {@link import('typescript').TemplateLiteralType literal template type}
 * or to a fallback type
 */
export function regexToTemplate(regex: RegExp): TsTypeNode {
  const intermediateResult = regexToIntermediateResult(regex);

  if (!intermediateResult.length || (
    intermediateResult.length === 1
    && intermediateResult.at(0) === stringTypeTemplateSymbol
  )) {
    return createFallbackNode();
  }

  const literalTypeSpans: TemplateLiteralTypeSpan[] = [];
  let headText = '';

  for (let index = 0; index < intermediateResult.length; index++) {
    const currentValue = intermediateResult[index];
    const nextValue = intermediateResult.at(index + 1);

    let currentTypeNode: TsTypeNode | undefined;

    if (isIntermediateResultUnion(currentValue)) {
      currentTypeNode = factory.createUnionTypeNode(
        currentValue.map((literal) => (
          literal === stringTypeTemplateSymbol
            ? factory.createKeywordTypeNode(SyntaxKind.StringKeyword)
            : factory.createLiteralTypeNode(factory.createStringLiteral(literal))
        )),
      );
    }
    else if (isIntermediateResultString(currentValue)) {
      currentTypeNode = factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
    }
    else if (index === 0) {
      headText = currentValue;

      continue;
    }

    if (!currentTypeNode) {
      throw new Error('Unknown error!');
    }

    let typeSpanText = '';

    if (nextValue && isIntermediateResultLiteral(nextValue)) {
      typeSpanText = nextValue;
      // step over literal value used as template span text part
      index++;
    }

    const isLastElement = index >= (intermediateResult.length - 1);

    literalTypeSpans.push(
      wrapTypeToTemplateLiteralTypeSpan(
        currentTypeNode,
        typeSpanText,
        isLastElement,
      ),
    );
  }

  // case when need to use only literal type as it is:
  // 'literal-value' instead of `${'literal-value'}`
  if (!literalTypeSpans.length) {
    return factory.createLiteralTypeNode(
      factory.createStringLiteral(headText),
    );
  }

  // case when literal template wrapper is redundant:
  // to use 'first' | 'second' instead of `${'first' | 'second'}`
  if (!headText
    && literalTypeSpans.length === 1
    && !literalTypeSpans[0].literal.text
  ) {
    return literalTypeSpans[0].type;
  }

  return factory.createTemplateLiteralType(
    factory.createTemplateHead(headText, headText),
    literalTypeSpans,
  );
}
