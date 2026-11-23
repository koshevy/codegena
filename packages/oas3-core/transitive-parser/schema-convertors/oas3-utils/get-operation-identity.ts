import { pascalCaseOpenApiName } from './pascal-case-openapi-name';

/**
 * Uses every operation-id part for its declaration name and breadcrumbs.
 * Source tags remain a separate part of the operation identity.
 */
export function getOperationIdentity(
  operationId: string | undefined,
  method: string,
  path: string,
  tags: string[] = [],
): { breadcrumbs: string[]; name: string; tags: string[] } {
  const hasUppercaseOrAdjacentDigits = (
    /[A-Z]|[A-Za-z][0-9]|[0-9][A-Za-z]/.test(operationId ?? '')
  );

  const separator = hasUppercaseOrAdjacentDigits
    ? /[^A-Za-z0-9]+/
    : /[^A-Za-z0-9_-]+/;

  const operationIdParts = operationId
    ?.split(separator)
    .filter(Boolean) ?? [];
  const operationName = operationIdParts.join(' ');
  const fallbackName = `${method} ${path.replaceAll(/[{}]/g, '')}`;

  return {
    breadcrumbs: operationIdParts,
    name: pascalCaseOpenApiName(operationName || fallbackName),
    tags,
  };
}
