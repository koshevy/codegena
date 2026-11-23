import type { Oas3Schema } from './oas3-schema';
import {
  isInfo,
  isHeaderParameter,
  isMediaContent,
  isMediaContentMap,
  isOas3DocumentForConversion,
  isOas3Specification,
  isOas3Version,
  isOperation,
  isParameter,
  isPathItem,
  isReferenceObject,
  isRequest,
  isResponse,
  isResponses,
} from './oas3-type-guards';

describe('OpenAPI 3 type guards', () => {
  it('recognizes supported OpenAPI versions and required Info fields', () => {
    expect(isOas3Version('3.0.3')).toBe(true);
    expect(isOas3Version('3.2.0')).toBe(true);
    expect(isOas3Version('2.0.0')).toBe(false);
    expect(isInfo({ title: 'Example API', version: '1.0.0' })).toBe(true);
    expect(isInfo({ title: 'Example API', version: 1 })).toBe(false);
    expect(isInfo({ version: '1.0.0' })).toBe(false);
  });

  it('keeps OpenAPI schema annotations and formats in the OAS model', () => {
    const schema: Oas3Schema<string> = {
      type: 'string',
      format: 'binary',
      nullable: true,
      example: 'image bytes',
      discriminator: { propertyName: 'kind' },
      xml: { name: 'image', wrapped: false },
    };

    expect(schema.type).toBe('string');
    expect(schema.format).toBe('binary');
    expect(schema.nullable).toBe(true);
    expect(schema.example).toBe('image bytes');
    expect(schema.discriminator?.propertyName).toBe('kind');
    expect(schema.xml).toEqual({ name: 'image', wrapped: false });
  });

  describe('isOas3Specification', () => {
    const info = { title: 'Example API', version: '1.0.0' };

    it('accepts a minimal OpenAPI 3.0 document', () => {
      expect(isOas3Specification({ openapi: '3.0.3', info, paths: {} }))
        .toBe(true);
    });

    it('accepts OpenAPI 3.1 and 3.2 documents with webhooks or components', () => {
      expect(isOas3Specification({ openapi: '3.1.1', info, webhooks: {} }))
        .toBe(true);
      expect(isOas3Specification({ openapi: '3.2.0', info, components: {} }))
        .toBe(true);
    });

    it('rejects missing required fields and unsupported versions', () => {
      expect(isOas3Specification({ openapi: '3.0.3', info })).toBe(false);
      expect(isOas3Specification({ openapi: '3.1.1', info })).toBe(false);
      expect(isOas3Specification({ openapi: '2.0.0', info, paths: {} }))
        .toBe(false);
      expect(isOas3Specification({ openapi: '3.0.3', paths: {} }))
        .toBe(false);
    });

    it('allows a missing title only for conversion fallback', () => {
      const document = {
        openapi: '3.0.3',
        info: { version: '1.0.0' },
        paths: {},
      };

      expect(isOas3DocumentForConversion(document)).toBe(true);
      expect(isOas3Specification(document)).toBe(false);
      expect(isOas3DocumentForConversion({
        ...document,
        info: { title: 42, version: '1.0.0' },
      })).toBe(false);
    });
  });

  it('distinguishes a reference from a concrete parameter', () => {
    const reference = { $ref: '#/components/parameters/Page' };

    expect(isReferenceObject(reference)).toBe(true);
    expect(isReferenceObject({ $ref: 42 })).toBe(false);
    expect(isParameter(reference)).toBe(false);
    expect(isParameter({ ...reference, name: 'page', in: 'query' }))
      .toBe(false);
    expect(isParameter({ name: 'page', in: 'query' })).toBe(true);
    expect(isParameter({ name: 'page', in: 'body' })).toBe(false);
    expect(isParameter({ name: 'id', in: 'path', required: true }))
      .toBe(true);
    expect(isParameter({ name: 'id', in: 'path' })).toBe(false);
    expect(isParameter({ name: 'id', in: 'path', required: false }))
      .toBe(false);
    expect(isHeaderParameter({ schema: { type: 'string' } })).toBe(true);
    expect(isHeaderParameter({ $ref: '#/components/headers/Limit' }))
      .toBe(false);
  });

  it('checks request and response media content', () => {
    const content = { 'application/json': { schema: { type: 'object' } } };

    expect(isMediaContent({ schema: true })).toBe(true);
    expect(isMediaContent({ schema: [] })).toBe(false);
    expect(isRequest({ content })).toBe(true);
    expect(isRequest({ content: { 'application/json': null } })).toBe(false);
    expect(isResponse({ description: 'OK', content })).toBe(true);
    expect(isResponse({ content })).toBe(false);
  });

  it('recognizes operations and their nested response maps', () => {
    const responses = {
      200: { description: 'OK' },
      default: { $ref: '#/components/responses/Unexpected' },
    };

    expect(isMediaContentMap({ 'application/json': {} })).toBe(true);
    expect(isMediaContentMap({ 'application/json': null })).toBe(false);
    expect(isResponses(responses)).toBe(true);
    expect(isResponses({ 200: { content: {} } })).toBe(false);
    expect(isOperation({ operationId: 'listItems', responses })).toBe(true);
    expect(isOperation({ responses, parameters: [{ name: 'id', in: 'path' }] }))
      .toBe(false);
    expect(isOperation({ operationId: 'listItems' })).toBe(false);
    expect(isPathItem({ get: { responses } })).toBe(true);
    expect(isPathItem({ query: { responses } })).toBe(true);
    expect(isPathItem({ additionalOperations: { LINK: { responses } } }))
      .toBe(true);
    expect(isPathItem({ additionalOperations: { LINK: { responses: null } } }))
      .toBe(false);
    expect(isPathItem({ get: { responses: null } })).toBe(false);
  });
});
