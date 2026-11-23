import uniq from 'lodash/uniq';
import { parse } from 'regexp-tree';
import type { Expression } from 'regexp-tree/ast';

export const stringTypeTemplateSymbol = Symbol('String');

/**
 * Has to literal type like `'some-string-value'`
 */
export type IntermediateRegexParsingResultLiteral = string;
/**
 * Has to be converted to a union type like `'abc' | 'def'`
 */
export type IntermediateRegexParsingResultUnion = (
  string | typeof stringTypeTemplateSymbol
)[];
/**
 * Has to be converted to `string` or `${string}`
 */
export type IntermediateRegexParsingResultString = typeof stringTypeTemplateSymbol;
/**
 * RegExp items reduced to a simple format
 */
export type IntermediateRegexParsingResult = (
  | IntermediateRegexParsingResultLiteral
  | IntermediateRegexParsingResultUnion
  | IntermediateRegexParsingResultString
);

function compressIntermediateValues(
  srcValue: IntermediateRegexParsingResult[],
): IntermediateRegexParsingResult[] {
  let previousValue: IntermediateRegexParsingResult | undefined;
  const result: IntermediateRegexParsingResult[] = [];

  srcValue.forEach((currentValue) => {
    if (!previousValue) {
      previousValue = currentValue;

      return;
    }

    if (typeof currentValue !== typeof previousValue
      || Array.isArray(currentValue) // unions never get compressed
    ) {
      result.push(previousValue);
      previousValue = currentValue;

      return;
    }

    if (currentValue !== stringTypeTemplateSymbol) {
      previousValue = String(previousValue) + currentValue;
    }
  });

  if (previousValue) {
    result.push(previousValue);
  }

  return result;
}

function simplifyUnion(
  srcValue: IntermediateRegexParsingResultUnion,
): IntermediateRegexParsingResult {
  if (srcValue.includes(stringTypeTemplateSymbol)) {
    return stringTypeTemplateSymbol;
  }

  return uniq(srcValue);
}

function regexToIntermediateResultInternal(
  expression: Expression,
  maxDepth: number,
  depth = 0,
): IntermediateRegexParsingResult[] {
  if (depth >= maxDepth) {
    return [stringTypeTemplateSymbol];
  }

  const extractExpressions = (
    subExpressions: Expression[],
  ): IntermediateRegexParsingResult[] => (
    subExpressions
      .flatMap((subExpression) => {
        if (depth + 1 >= maxDepth) {
          return [stringTypeTemplateSymbol];
        }

        return regexToIntermediateResultInternal(
          subExpression,
          maxDepth,
          depth + 1,
        );
      })
  );

  if (expression.type === 'Alternative') {
    return extractExpressions(expression.expressions);
  }

  // Assertions got to be ignored
  if (expression.type === 'Assertion') {
    return [];
  }

  if (expression.type === 'Char') {
    return [expression.value];
  }

  if (expression.type === 'Group') {
    return expression.expression
      ? [...regexToIntermediateResultInternal(
          expression.expression,
          maxDepth,
          depth + 1,
        )]
      : [];
  }

  if (expression.type === 'Disjunction') {
    const leftExpressions = expression.left
      ? regexToIntermediateResultInternal(expression.left, maxDepth, depth + 1)
      : [];

    const rightExpressions = expression.right
      ? regexToIntermediateResultInternal(expression.right, maxDepth, depth + 1)
      : [];

    const union: IntermediateRegexParsingResultUnion = [
      ...compressIntermediateValues(leftExpressions).flat(),
      ...compressIntermediateValues(rightExpressions).flat(),
    ] as IntermediateRegexParsingResultUnion;

    return [
      simplifyUnion(union),
    ];
  }

  if (expression.type === 'Repetition') {
    return expression.quantifier.kind === '?'
      ? [simplifyUnion([
          ...compressIntermediateValues(
            regexToIntermediateResultInternal(
              expression.expression,
              maxDepth,
              depth + 1,
            )),
          '',
        ].flat())]
      : [stringTypeTemplateSymbol];
  }

  return [stringTypeTemplateSymbol];
}

function hasStartingAssertion(expression: Expression): boolean {
  if (expression.type !== 'Alternative') {
    return false;
  }

  const [firstExpression] = expression.expressions;

  return firstExpression.type === 'Assertion'
    && firstExpression.kind === '^';
}

function hasEndingAssertion(expression: Expression): boolean {
  if (expression.type !== 'Alternative') {
    return false;
  }

  const lastExpression = expression.expressions.at(-1);

  return lastExpression?.type === 'Assertion'
    && lastExpression.kind === '$';
}

/**
 * Parses regexp to {@link IntermediateRegexParsingResult} allowing
 * to analyze and convert to TypeScript easier
 */
export function regexToIntermediateResult(
  regexp: RegExp,
  maxDepth = 1024,
): IntermediateRegexParsingResult[] {
  const expression = parse(regexp);

  if (!expression.body) {
    return [stringTypeTemplateSymbol];
  }

  const rawResult = regexToIntermediateResultInternal(
    expression.body,
    maxDepth,
  );

  if (!hasStartingAssertion(expression.body)) {
    rawResult.unshift(stringTypeTemplateSymbol);
  }

  if (!hasEndingAssertion(expression.body)) {
    rawResult.push(stringTypeTemplateSymbol);
  }

  return compressIntermediateValues(rawResult);
}

export function isIntermediateResultLiteral(
  value: unknown,
): value is IntermediateRegexParsingResultLiteral {
  return typeof value === 'string';
}

export function isIntermediateResultUnion(
  value: unknown,
): value is IntermediateRegexParsingResultUnion {
  return Array.isArray(value);
}

export function isIntermediateResultString(
  value: unknown,
): value is IntermediateRegexParsingResultString {
  return value === stringTypeTemplateSymbol;
}
