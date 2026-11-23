import type { StringFormat } from '@codegena/oas3-core/json-schema';
import type { OpenApiStringFormat } from '@codegena/oas3-core/oas3';
import {
  factory,
  SyntaxKind,
  type TypeNode,
} from 'typescript';

type StringFormatTypeFactory = () => TypeNode;
type TemplateLiteralTypeSpanProps = [TypeNode, string];

const stringFormatTypeFactories: readonly [
  StringFormat | OpenApiStringFormat,
  StringFormatTypeFactory,
][] = [
  ['binary', createBlobType],
  ['date', createDateType],
  ['date-time', createDateTimeType],
  ['duration', createDurationType],
  ['email', createEmailType],
  ['hostname', createStringType],
  ['idn-email', createEmailType],
  ['idn-hostname', createStringType],
  ['iri', createUriType],
  ['iri-reference', createStringType],
  ['ipv4', createIpv4Type],
  ['ipv6', createIpv6Type],
  ['json-pointer', createJsonPointerType],
  ['regex', createStringType],
  ['relative-json-pointer', createRelativeJsonPointerType],
  ['time', createTimeType],
  ['uri', createUriType],
  ['uri-reference', createStringType],
  ['uri-template', createStringType],
  ['uuid', createUuidType],
];

/**
 * Creates the closest TypeScript-native type for a JSON Schema built-in
 * string format. Unsupported custom formats return `null`.
 */
export function createStringBuiltInFormatType(
  format: string | undefined,
): TypeNode | null {
  if (format === undefined) {
    return null;
  }

  const typeFactory = stringFormatTypeFactories.find(([
    builtInFormat,
  ]) => builtInFormat === format)?.[1];

  return typeFactory?.() ?? null;
}

function createBlobType(): TypeNode {
  return factory.createTypeReferenceNode('Blob');
}

function createDateType(): TypeNode {
  return createTemplateLiteralType('', [
    [createNumberType(), '-'],
    [createNumberType(), '-'],
    [createNumberType(), ''],
  ]);
}

function createDateTimeType(): TypeNode {
  return createTemplateLiteralType('', [
    [createNumberType(), '-'],
    [createNumberType(), '-'],
    [createNumberType(), 'T'],
    [createNumberType(), ':'],
    [createNumberType(), ':'],
    [createNumberType(), ''],
    [createStringType(), ''],
  ]);
}

function createDurationType(): TypeNode {
  return createTemplateLiteralType('P', [[createStringType(), '']]);
}

function createEmailType(): TypeNode {
  return createTemplateLiteralType('', [
    [createStringType(), '@'],
    [createStringType(), ''],
  ]);
}

function createIpv4Type(): TypeNode {
  return createTemplateLiteralType('', [
    [createNumberType(), '.'],
    [createNumberType(), '.'],
    [createNumberType(), '.'],
    [createNumberType(), ''],
  ]);
}

function createIpv6Type(): TypeNode {
  return createTemplateLiteralType('', [
    [createStringType(), ':'],
    [createStringType(), ''],
  ]);
}

function createJsonPointerType(): TypeNode {
  return factory.createUnionTypeNode([
    factory.createLiteralTypeNode(factory.createStringLiteral('')),
    createTemplateLiteralType('/', [[createStringType(), '']]),
  ]);
}

function createRelativeJsonPointerType(): TypeNode {
  return factory.createUnionTypeNode([
    createTemplateLiteralType('', [[createNumberType(), '']]),
    createTemplateLiteralType('', [[createNumberType(), '#']]),
    createTemplateLiteralType('', [
      [createNumberType(), '/'],
      [createStringType(), ''],
    ]),
  ]);
}

function createTimeType(): TypeNode {
  return createTemplateLiteralType('', [
    [createNumberType(), ':'],
    [createNumberType(), ':'],
    [createNumberType(), ''],
    [createStringType(), ''],
  ]);
}

function createUriType(): TypeNode {
  return createTemplateLiteralType('', [
    [createStringType(), ':'],
    [createStringType(), ''],
  ]);
}

function createUuidType(): TypeNode {
  return createTemplateLiteralType('', [
    [createStringType(), '-'],
    [createStringType(), '-'],
    [createStringType(), '-'],
    [createStringType(), '-'],
    [createStringType(), ''],
  ]);
}

function createNumberType(): TypeNode {
  return factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
}

function createStringType(): TypeNode {
  return factory.createKeywordTypeNode(SyntaxKind.StringKeyword);
}

function createTemplateLiteralType(
  headText: string,
  spans: TemplateLiteralTypeSpanProps[],
): TypeNode {
  return factory.createTemplateLiteralType(
    factory.createTemplateHead(headText, headText),
    spans.map(([type, text], index) => (
      factory.createTemplateLiteralTypeSpan(
        type,
        index === spans.length - 1
          ? factory.createTemplateTail(text, text)
          : factory.createTemplateMiddle(text, text),
      )
    )),
  );
}
