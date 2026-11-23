/* eslint-disable max-len -- Exact generated TypeScript output is compared verbatim. */
/* eslint-disable no-template-curly-in-string */
import {
  createSourceFile,
  factory,
  isTypeAliasDeclaration,
  ScriptTarget,
  type TypeNode,
} from 'typescript';

import { compressTypeNodes } from './compress-type-nodes';
import { printTypeDeclaration } from './print-declaration-statement';

function parseType(type: string): TypeNode {
  const sourceFile = createSourceFile(
    'business-types.ts',
    `type BusinessType = ${type};`,
    ScriptTarget.Latest,
  );
  const [statement] = sourceFile.statements;

  if (!isTypeAliasDeclaration(statement)) {
    throw new Error(`Unable to parse type fixture: ${type}`);
  }

  return statement.type;
}

async function printType(typeNode: TypeNode): Promise<string> {
  const printed = await printTypeDeclaration('Value', typeNode);

  return printed
    .replace(/^type Value = /, '')
    .replace(/;$/, '');
}

async function printCompressed(typeNodes: TypeNode[]): Promise<string> {
  const compressed = compressTypeNodes(typeNodes);
  const result = compressed.length === 1
    ? compressed[0]
    : factory.createUnionTypeNode(compressed);

  return printTypeDeclaration('Compressed', result);
}

describe('compressTypeNodes', () => {
  it('should merge records with the same template key', async () => {
    const result = compressTypeNodes([
      parseType('Record<`feature-${string}`, EnabledFeature>'),
      parseType('Record<`feature-${string}`, DisabledFeature>'),
    ]);

    expect(await printTypeDeclaration('FeatureRegistry', result[0])).toBe(
      [
        'type FeatureRegistry = Record<`feature-${string}`,',
        'EnabledFeature | DisabledFeature>;',
      ].join(' '),
    );
  });

  it('should merge records with the same value type', async () => {
    const result = compressTypeNodes([
      parseType('Record<`customer-${string}`, ContactDetails>'),
      parseType('Record<`supplier-${string}`, ContactDetails>'),
    ]);

    expect(await printTypeDeclaration('ContactRegistry', result[0])).toBe(
      `type ContactRegistry = Record<\`customer-\${string}\` | \`supplier-\${string}\`, ContactDetails>;`,
    );
  });

  it('should transitively merge compatible records and remove duplicates', async () => {
    const result = compressTypeNodes([
      parseType('Record<Region, OnlinePrice>'),
      parseType('Record<Region, RetailPrice>'),
      parseType('Record<Region, OnlinePrice>'),
    ]);

    expect(await printTypeDeclaration('RegionalPrices', result[0])).toBe(
      'type RegionalPrices = Record<Region, OnlinePrice | RetailPrice>;',
    );
  });

  it('should preserve records when both key and value types differ', async () => {
    expect(await printCompressed([
      parseType('Record<CustomerId, Customer>'),
      parseType('Record<OrderId, Order>'),
    ])).toBe(
      'type Compressed = Record<CustomerId, Customer> | Record<OrderId, Order>;',
    );
  });

  it('should flatten nested unions and remove first-level duplicates', async () => {
    const result = compressTypeNodes([
      parseType('DraftOrder | ActiveOrder'),
      parseType('DraftOrder | ArchivedOrder'),
      parseType('ActiveOrder'),
    ]);

    expect(await Promise.all(result.map((item) => printType(item)))).toEqual([
      'DraftOrder',
      'ActiveOrder',
      'ArchivedOrder',
    ]);
  });

  it('should merge array nodes into an array of unique element types', async () => {
    const result = compressTypeNodes([
      parseType('Customer[]'),
      parseType('Supplier[]'),
      parseType('Customer[]'),
    ]);

    expect(await printTypeDeclaration('DirectoryEntries', result[0])).toBe(
      'type DirectoryEntries = (Customer | Supplier)[];',
    );
  });

  it('should keep the larger object when another object is its strict subset', async () => {
    const result = compressTypeNodes([
      parseType('{ id: CustomerId; }'),
      parseType('{ id: CustomerId; email: string; active?: boolean; }'),
    ]);

    expect(await printTypeDeclaration('Customer', result[0])).toBe(
      `type Customer = {
    id: CustomerId;
    email: string;
    active?: boolean;
};`,
    );
  });

  it('should detect object subsets regardless of input order', async () => {
    const result = compressTypeNodes([
      parseType('{ sku: string; stock: number; }'),
      parseType('{ sku: string; }'),
    ]);

    expect(await printTypeDeclaration('InventoryItem', result[0])).toBe(
      `type InventoryItem = {
    sku: string;
    stock: number;
};`,
    );
  });

  it('should preserve objects with conflicting property types', async () => {
    const result = compressTypeNodes([
      parseType('{ status: "paid"; }'),
      parseType('{ status: "cancelled"; reason: string; }'),
    ]);

    expect(result).toHaveLength(2);
  });

  it('should preserve optional and readonly differences during subset checks', async () => {
    const result = compressTypeNodes([
      parseType('{ readonly id: string; }'),
      parseType('{ id?: string; email: string; }'),
    ]);

    expect(result).toHaveLength(2);
  });

  it('should deduplicate other structurally equal types with areTypesSimplyEqual', async () => {
    const result = compressTypeNodes([
      parseType('Promise<Customer>'),
      parseType('Promise<Customer>'),
      parseType('Promise<Order>'),
      parseType('string'),
      parseType('string'),
    ]);

    expect(await Promise.all(result.map((item) => printType(item)))).toEqual([
      'Promise<Customer>',
      'Promise<Order>',
      'string',
    ]);
  });

  it('should return an empty array for empty input', async () => {
    expect(compressTypeNodes([])).toEqual([]);
  });
});
