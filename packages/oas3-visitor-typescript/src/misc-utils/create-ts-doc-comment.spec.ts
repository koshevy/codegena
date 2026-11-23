import type { TransitiveNode } from '@codegena/oas3-core/transitive-node';
import { extractTransitiveNodesFromSchema } from '@codegena/oas3-core/transitive-parser';

import { createTsDocComment } from './create-ts-doc-comment';

function createNode(comment?: string, path: string[] = []): TransitiveNode {
  const [node] = extractTransitiveNodesFromSchema({
    jsoncTextData: '{"type":"string"}',
    srcFileId: 'customer.json',
  });

  if (!node) {
    throw new Error('Expected a transitive node');
  }

  node.annotations = { comment };
  node.source.jsonPath = ['definitions', 'Customer', ...path];
  node.isInline = true;

  return node;
}

function doc(text: string): string {
  return ['*', ...text.split('\n').map((line) => line ? ` * ${line}` : ' *'), ' ']
    .join('\n');
}

describe('createTsDocComment', () => {
  it('documents the original OpenAPI operation identity', () => {
    const node: TransitiveNode = {
      ...createNode(),
      annotations: {
        title: 'Get a customer',
        description: 'Returns the requested customer.',
      },
      method: 'get',
      operationId: 'customers/get-by-name',
      originalTags: ['users', 'actions'],
      path: '/customers/{name}',
      type: 'entrypointRecord',
    };

    expect(createTsDocComment(node)).toBe(doc([
      '## Get a customer',
      '',
      'Returns the requested customer.',
      '',
      '#### Original info',
      '',
      '- Path: `/customers/{name}`',
      '- Method: `GET`',
      '- Operation ID: `customers/get-by-name`',
      '- Tags: `users`, `actions`',
    ].join('\n')));
  });

  it('omits the operation ID when the source has none', () => {
    const node: TransitiveNode = {
      ...createNode(),
      method: 'post',
      path: '/customers',
      type: 'entrypointRecord',
    };

    expect(createTsDocComment(node)).toBe(doc([
      '#### Original info',
      '',
      '- Path: `/customers`',
      '- Method: `POST`',
    ].join('\n')));
  });

  it.each([
    [undefined, undefined, null],
    ['  ', ' ', null],
    ['Customer details', undefined, 'Customer details'],
    [undefined, 'Internal note', '@privateRemarks\n\nInternal note'],
    ['Customer details', 'Internal note',
      'Customer details\n\n@privateRemarks\n\nInternal note'],
    ['Customer details', 'First\r\n\r\n  - Second',
      'Customer details\n\n@privateRemarks\n\nFirst\n\n  - Second'],
  ])('formats description %j and comment %j', (description, comment, expected) => {
    const node = createNode(comment);

    node.annotations = { description, comment };

    expect(createTsDocComment(node)).toBe(expected === null ? null : doc(expected));
  });

  it.each([true, false])('collects inline comments with description: %j', (described) => {
    const root = createNode('Own note');
    const nested = createNode('First line\n\n   - New customer', ['allOf', '0', 'if']);
    const referred = createNode('Verified customer', ['allOf', '0', 'then']);
    const mixin = createNode('Common data', ['allOf', '0']);
    const external = createNode('Must not appear', ['external']);

    nested.annotations = {
      comment: nested.annotations?.comment,
      title: '  New customers  ',
    };
    referred.annotations = {
      comment: referred.annotations?.comment,
      title: 'Verified customers',
    };
    mixin.annotations = { comment: mixin.annotations?.comment, title: '  ' };
    external.isInline = false;
    external.nestedTransitiveNodes = [createNode('Hidden descendant')];
    root.annotations = {
      ...root.annotations,
      title: 'Customer',
      description: described ? 'Customer details' : undefined,
    };
    root.nestedTransitiveNodes = [nested, external];
    nested.referredTransitiveNodes = [referred];
    referred.nestedTransitiveNodes = [root];

    const combined: TransitiveNode = {
      ...root,
      type: 'intersection',
      referredTransitiveNodes: [referred, nested],
      mixin,
    };

    referred.nestedTransitiveNodes = [combined];

    const comments = [
      'Own note',
      '',
      '###### New customers',
      'First line',
      '',
      '   - New customer',
      '',
      '###### Verified customers',
      'Verified customer',
      '',
      '###### allOf.0',
      'Common data',
    ];

    const text = [
      '## Customer',
      ...(described ? ['Customer details'] : []),
      ['@privateRemarks', comments.join('\n')].join('\n\n'),
    ].join('\n\n');

    const result = createTsDocComment(combined);

    expect(result).toBe(doc(text));
    expect(createTsDocComment(combined)).toBe(result);
  });

  it('collects inline reference targets with separate comments at one path', () => {
    const target = createNode('Target */ note');

    target.name = undefined;
    target.suggestedName = undefined;

    const reference: TransitiveNode = {
      ...createNode('Reference note'),
      type: 'reference',
      ref: target,
      mixin: null,
      referredTransitiveNodes: [target],
    };

    expect(createTsDocComment(reference)).toBe(doc(
      '@privateRemarks\n\nReference note\n\nTarget *\\/ note',
    ));
  });

  it('does not copy documentation from a named reference target', () => {
    const target = createNode();

    target.name = 'NamedCustomer';
    target.annotations = {
      comment: 'Private note for the named type.',
      description: 'Documentation for the named type.',
    };

    const reference: TransitiveNode = {
      ...createNode(),
      type: 'reference',
      ref: target,
      mixin: null,
      referredTransitiveNodes: [target],
    };

    expect(createTsDocComment(reference)).toBeNull();

    reference.annotations = { description: 'Documentation for this property.' };

    expect(createTsDocComment(reference)).toBe(doc(
      'Documentation for this property.',
    ));
  });
});
