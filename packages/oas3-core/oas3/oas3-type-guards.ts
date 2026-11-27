import { isHasRef } from '../json-schema';
import type { MediaContent } from './aspects';
import type { HeaderParameter } from './header-parameter';
import type { Info } from './info';
import type { Oas3Specification } from './oas3-specification';
import type { Operation } from './operation';
import { isOperationMethod } from './operation-method';
import type { Parameter } from './parameter';
import { parameterTargets } from './parameter-target';
import type { PathItem } from './path-item';
import type { ReferenceObject } from './reference-object';
import type { Request } from './request';
import type { Response } from './response';
import type { Responses } from './responses';

type InfoWithOptionalTitle = Omit<Info, 'title'> & Partial<Pick<Info, 'title'>>;

type Oas3DocumentForConversion = {
  info: InfoWithOptionalTitle;
  openapi: Oas3Specification['openapi'];
  paths?: Record<string, unknown>;
};

export function isOas3Version(
  value: unknown,
): value is Oas3Specification['openapi'] {
  return typeof value === 'string'
    && /^3\.[012]\.\d+$/.test(value);
}

function isInfoWithOptionalTitle(
  value: unknown,
): value is InfoWithOptionalTitle {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && 'version' in value
    && typeof value.version === 'string'
    && (!('title' in value)
      || typeof value.title === 'string');
}

export function isInfo(value: unknown): value is Info {
  return isInfoWithOptionalTitle(value)
    && typeof value.title === 'string';
}

/**
 * Allows conversion of an OpenAPI document whose title is absent.
 */
export function isOas3DocumentForConversion(
  value: unknown,
): value is Oas3DocumentForConversion {
  if (typeof value !== 'object'
    || !value
    || Array.isArray(value)
    || !('openapi' in value)
    || !isOas3Version(value.openapi)
    || !('info' in value)
    || !isInfoWithOptionalTitle(value.info)
  ) {
    return false;
  }

  const hasPathsObject = 'paths' in value
    && typeof value.paths === 'object'
    && value.paths !== null
    && !Array.isArray(value.paths);

  if (value.openapi.startsWith('3.0.')) {
    return hasPathsObject;
  }

  const hasWebhooksObject = 'webhooks' in value
    && typeof value.webhooks === 'object'
    && value.webhooks !== null
    && !Array.isArray(value.webhooks);

  const hasComponentsObject = 'components' in value
    && typeof value.components === 'object'
    && value.components !== null
    && !Array.isArray(value.components);

  return hasPathsObject || hasWebhooksObject || hasComponentsObject;
}

/**
 * Recognizes an OpenAPI 3.x entry document by its required root fields.
 */
export function isOas3Specification(value: unknown): value is Oas3Specification {
  return isOas3DocumentForConversion(value)
    && isInfo(value.info);
}

export function isReferenceObject(value: unknown): value is ReferenceObject {
  return isHasRef(value) && !Array.isArray(value);
}

/**
 * Checks the required parameter identity and path-requiredness.
 */
export function isParameter(value: unknown): value is Parameter {
  if (typeof value !== 'object'
    || !value
    || Array.isArray(value)
    || isHasRef(value)
    || !('name' in value)
    || typeof value.name !== 'string'
    || !('in' in value)
    || typeof value.in !== 'string'
    || ('required' in value
      && value.required !== undefined
      && typeof value.required !== 'boolean')
  ) {
    return false;
  }

  const supportedTargets: ReadonlyArray<string> = parameterTargets;
  const hasSupportedTarget = supportedTargets.includes(value.in);

  if (!hasSupportedTarget) {
    return false;
  }

  return value.in !== 'path'
    || ('required' in value && value.required === true);
}

/**
 * Header objects use their containing map key as the header name.
 */
export function isHeaderParameter(value: unknown): value is HeaderParameter {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && !isReferenceObject(value)
    && (!('schema' in value)
      || value.schema === undefined
      || typeof value.schema === 'boolean'
      || (typeof value.schema === 'object'
        && value.schema !== null
        && !Array.isArray(value.schema)));
}

export function isMediaContent(value: unknown): value is MediaContent {
  if (typeof value !== 'object'
    || !value
    || Array.isArray(value)
  ) {
    return false;
  }

  return !('schema' in value)
    || value.schema === undefined
    || typeof value.schema === 'boolean'
    || (typeof value.schema === 'object'
      && value.schema !== null
      && !Array.isArray(value.schema));
}

/**
 * Recognizes a map of OpenAPI media types and their media objects.
 */
export function isMediaContentMap(
  value: unknown,
): value is Record<string, MediaContent> {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && Object.values(value).every(isMediaContent);
}

/**
 * A request body requires a map of media types.
 */
export function isRequest(value: unknown): value is Request {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && 'content' in value
    && typeof value.content === 'object'
    && value.content !== null
    && !Array.isArray(value.content)
    && Object.values(value.content).every(isMediaContent)
    && (!('required' in value)
      || value.required === undefined
      || typeof value.required === 'boolean');
}

/**
 * A response requires a description; payloads and headers are optional.
 */
export function isResponse(value: unknown): value is Response {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && 'description' in value
    && typeof value.description === 'string'
    && (!('content' in value)
      || value.content === undefined
      || (typeof value.content === 'object'
        && value.content !== null
        && !Array.isArray(value.content)
        && Object.values(value.content).every(isMediaContent)));
}

/**
 * Recognizes a response map without restricting extensible HTTP status keys.
 */
export function isResponses(value: unknown): value is Responses {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && Object.values(value).every((response) => (
      isResponse(response) || isReferenceObject(response)
    ));
}

/**
 * Recognizes an operation by its required responses and optional parameters.
 */
export function isOperation(value: unknown): value is Operation {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && 'responses' in value
    && isResponses(value.responses)
    && (!('parameters' in value)
      || (Array.isArray(value.parameters)
        && value.parameters.every((parameter) => (
          isParameter(parameter) || isReferenceObject(parameter)
        ))));
}

/**
 * Recognizes a path item with at least one valid HTTP operation.
 */
export function isPathItem(value: unknown): value is PathItem {
  if (typeof value !== 'object'
    || !value
    || Array.isArray(value)
  ) {
    return false;
  }

  const hasFixedOperation = Object.entries(value).some(([key, operation]) => (
    isOperationMethod(key)
    && isOperation(operation)
  ));

  const hasAdditionalOperation = 'additionalOperations' in value
    && typeof value.additionalOperations === 'object'
    && value.additionalOperations !== null
    && !Array.isArray(value.additionalOperations)
    && Object.values(value.additionalOperations).some((operation) => (
      isOperation(operation)
    ));

  return hasFixedOperation || hasAdditionalOperation;
}
