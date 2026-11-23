import type {
  AbstractTransitiveNodeAnnotations,
  TransitiveNode,
} from '@codegena/oas3-core/transitive-node';

export function createTsDocComment(
  transitiveNode: TransitiveNode,
): string | null {
  const annotations = getInheritedAnnotations(transitiveNode, new Set());
  const comments = collectComments(transitiveNode);
  const sections: string[] = [];
  const titleTrimmed = annotations.title?.trim();
  const descriptionTrimmed = annotations.description?.trim();

  if (titleTrimmed) {
    sections.push(`## ${titleTrimmed}`);
  }

  if (descriptionTrimmed) {
    sections.push(descriptionTrimmed);
  }

  if (transitiveNode.type === 'entrypointRecord') {
    const originalTags = transitiveNode.originalTags
      ?.map((tag) => `\`${tag}\``)
      .join(', ');

    const operationDetails = [
      '#### Original info',
      '',
      `- Path: \`${transitiveNode.path}\``,
      `- Method: \`${transitiveNode.method.toUpperCase()}\``,
      ...(transitiveNode.operationId
        ? [`- Operation ID: \`${transitiveNode.operationId}\``]
        : []),
      ...(originalTags ? [`- Tags: ${originalTags}`] : []),
    ];

    sections.push(operationDetails.join('\n'));
  }

  if (annotations.deprecated) {
    sections.push('@deprecated');
  }

  if (comments.length) {
    const commentText = comments.map(({ node, text }) => {
      if (comments.length === 1) {
        return text;
      }

      const rootPath = transitiveNode.source.jsonPath;
      const path = node.source.jsonPath;
      let sharedLength = 0;

      while (sharedLength < rootPath.length
        && rootPath[sharedLength] === path[sharedLength]
      ) {
        sharedLength++;
      }

      const relativePath = [
        ...rootPath.slice(sharedLength).map(() => '..'),
        ...path.slice(sharedLength),
      ].join('.') || '.';

      const heading = node.annotations?.title?.trim() || relativePath;

      return relativePath === '.' ? text : `###### ${heading}\n${text}`;
    }).join('\n\n');

    sections.push(['@privateRemarks', commentText.replaceAll('\r\n', '\n')].join('\n\n'));
  }

  if (Array.isArray(annotations.examples)) {
    for (const example of annotations.examples) {
      const serialized = JSON.stringify(example, null, 2);

      if (serialized !== undefined) {
        sections.push(['@example', '```json', serialized, '```'].join('\n'));
      }
    }
  }

  if (!sections.length) {
    return null;
  }

  const lines = sections.join('\n\n').replaceAll('*/', String.raw`*\/`).split('\n');

  return [
    '*',
    ...lines.map((line) => line ? ` * ${line}` : ' *'),
    ' ',
  ].join('\n');
}

function getInheritedAnnotations(
  transitiveNode: TransitiveNode,
  visited: Set<TransitiveNode>,
): AbstractTransitiveNodeAnnotations {
  if (visited.has(transitiveNode)) {
    return {};
  }

  visited.add(transitiveNode);

  const annotations: AbstractTransitiveNodeAnnotations = {
    ...transitiveNode.annotations,
  };

  const referredNodes = [
    ...transitiveNode.referredTransitiveNodes ?? [],
    ...(transitiveNode.type === 'reference' ? [transitiveNode.ref] : []),
  ];

  for (const referredNode of referredNodes) {
    if (referredNode.name || referredNode.suggestedName) {
      continue;
    }

    const inherited = getInheritedAnnotations(referredNode, visited);

    annotations.deprecated ??= inherited.deprecated;
    annotations.title ??= inherited.title;
    annotations.description ??= inherited.description;
    annotations.examples ??= inherited.examples;
  }

  return annotations;
}

function collectComments(root: TransitiveNode): {
  node: TransitiveNode;
  text: string;
}[] {
  const comments: { node: TransitiveNode; text: string }[] = [];
  const visited = new Set<TransitiveNode>();
  const visit = (node: TransitiveNode): void => {
    if (visited.has(node)) {
      return;
    }

    visited.add(node);

    const commentTrimmed = node.annotations?.comment?.trim();

    if (commentTrimmed) {
      comments.push({ node, text: commentTrimmed });
    }

    const children = [
      ...node.nestedTransitiveNodes ?? [],
      ...node.referredTransitiveNodes ?? [],
      ...(node.type === 'reference' ? [node.ref] : []),
      ...('mixin' in node && node.mixin ? [node.mixin] : []),
    ];

    for (const child of children) {
      const isNamedReferenceTarget = node.type === 'reference'
        && child === node.ref
        && Boolean(child.name || child.suggestedName);

      const shouldCollectComment = child.isInline
        && !child.associatedPropertyName
        && !isNamedReferenceTarget;

      if (shouldCollectComment) {
        visit(child);
      }
    }
  };

  visit(root);

  return comments;
}
