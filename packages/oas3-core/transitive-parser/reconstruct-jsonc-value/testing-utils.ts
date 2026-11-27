import { type Node, parseTree } from 'jsonc-parser';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type {
  ReconstructedArrayJsoncValue,
} from './reconstructed-jsonc-value';

const fixturesDir = join(__dirname, '__fixtures__');

const parseTreeOptions = {
  allowEmptyContent: true,
  allowTrailingComma: true,
  disallowComments: false,
};

export function loadFixtureFile(name: string): string {
  return readFileSync(join(fixturesDir, name), 'utf8');
}

export function loadJsonc(fileName: string): [string, Node] {
  const jsonContent = loadFixtureFile(fileName);
  const jsonc = parseTree(jsonContent, [], parseTreeOptions);

  if (!jsonc) {
    throw new Error('Unable to parse tree!');
  }

  return [jsonContent, jsonc];
}

export function getArrayValueFromNodeChildren(
  { node }: Pick<ReconstructedArrayJsoncValue, 'node'>,
): unknown[] {
  const result = node
    .children
    ?.map((childNode) => (
      childNode.children
        ? getArrayValueFromNodeChildren({ node: childNode })
        : childNode.value
    ));

  return result ?? [];
}

export function getArrayValueFromItems(
  { items }: Pick<ReconstructedArrayJsoncValue, 'items'>,
): unknown[] {
  return items
    .map(({ value }) => value);
}
