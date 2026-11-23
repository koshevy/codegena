import { createSourceFile, ScriptTarget, type Statement } from 'typescript';

import { getTypeScriptDeclarationType } from './get-typescript-declaration-type';

function parseDeclaration(sourceText: string): Statement {
  const sourceFile = createSourceFile(
    'declaration.ts',
    sourceText,
    ScriptTarget.Latest,
  );
  const declaration = sourceFile.statements[0];

  if (!declaration) {
    throw new Error('Expected a declaration in the test source.');
  }

  return declaration;
}

describe('getTypeScriptDeclarationType', () => {
  it.each([
    ['export interface Example { value: string; }', 'Interface'],
    ['export namespace Example { export type Value = string; }', 'Namespace'],
    ['export type Example = string | number;', 'Union'],
    ['export type Example = string[] | number[];', 'Union'],
    ['export type Example = (string | number);', 'Union'],
    ['export type Example = Record<string, unknown> & { id: string };', 'Intersection'],
    ['export type Example = string[];', 'Array'],
    ['export type Example = (string | number)[];', 'Array'],
    ['export type Example = [string, number];', 'Array'],
    ['export type Example = readonly string[];', 'Array'],
    ['export type Example = Array<string>;', 'Array'],
    ['export type Example = ReadonlyArray<string>;', 'Array'],
    ['export type Example = Record<string, unknown>;', 'Record'],
    ['export type Example = Record<string, string | number>;', 'Record'],
    ['export type Example = { id: string };', 'Record'],
    ['export type Example = { [K in keyof Input]: Input[K] };', 'Record'],
    [`export type Example = \`CODE_\${string}\`;`, 'Literal'],
    ['export type Example = \'active\';', 'Literal'],
    ['export type SimplestStringPatternCase = string;', 'Scalar'],
    ['export type Example = null;', 'Scalar'],
    ['export type Example = unknown;', 'Scalar'],
    ['export type NinthLevel = ZeroLevel;', 'Alias'],
    ['export type Example = Promise<string>;', 'Alias'],
  ])('classifies %s as %s', (sourceText, expected) => {
    expect(getTypeScriptDeclarationType(parseDeclaration(sourceText)))
      .toBe(expected);
  });

  it('does not classify other statements', () => {
    expect(getTypeScriptDeclarationType(parseDeclaration('export const example = 1;')))
      .toBeUndefined();
  });
});
