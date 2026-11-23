import {
  findNodeAtLocation,
  findNodeAtOffset,
  type Node,
} from 'jsonc-parser';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';

function findAnchor(root: Node, name: string): Node | undefined {
  if (
    root.type === 'object'
    && findNodeAtLocation(root, ['$anchor'])?.value === name
  ) {
    return root;
  }

  return root.children?.reduce<Node | undefined>(
    (found, child) => found ?? findAnchor(child, name),
    undefined,
  );
}

function resolveJsonPointer(root: Node, pointer: string): Node | undefined {
  const tokens = pointer.slice(1).split('/');

  if (tokens.some((token) => /~(?![01])/.test(token))) {
    return undefined;
  }

  return tokens
    .map((token) => token.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce<Node | undefined>((node, token) => {
      if (!node) {
        return node;
      }

      const segment = node.type === 'array' && /^(0|[1-9]\d*)$/.test(token)
        ? Number(token)
        : token;

      return findNodeAtLocation(node, [segment]);
    }, root);
}

function resolveLocalReference(root: Node, reference: string): Node | undefined {
  if (!reference.startsWith('#')) {
    return undefined;
  }

  let fragment: string;

  try {
    fragment = decodeURIComponent(reference.slice(1));
  }
  catch {
    return undefined;
  }

  if (!fragment) {
    return root;
  }

  return fragment.startsWith('/')
    ? resolveJsonPointer(root, fragment)
    : findAnchor(root, fragment);
}

function nodeRange(model: monaco.editor.ITextModel, node: Node): monaco.Range {
  const start = model.getPositionAt(node.offset);
  const selectionLength = node.type === 'object' || node.type === 'array'
    ? 1
    : node.length;
  const end = model.getPositionAt(node.offset + selectionLength);

  return monaco.Range.fromPositions(start, end);
}

export function getJsonRefDefinition(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
  root: Node | undefined,
): monaco.languages.LocationLink[] | undefined {
  if (!root) {
    return undefined;
  }

  const source = findNodeAtOffset(root, model.getOffsetAt(position));
  const property = source?.parent;

  if (
    source?.type !== 'string'
    || typeof source.value !== 'string'
    || property?.type !== 'property'
    || property.children?.[0]?.value !== '$ref'
    || property.children[1] !== source
  ) {
    return undefined;
  }

  const target = resolveLocalReference(root, source.value);

  if (!target) {
    return undefined;
  }

  const targetKey = target.parent?.type === 'property'
    ? target.parent.children?.[0]
    : undefined;
  const targetRange = nodeRange(model, targetKey ?? target);

  return [{
    originSelectionRange: nodeRange(model, source),
    range: targetRange,
    targetSelectionRange: targetRange,
    uri: model.uri,
  }];
}
