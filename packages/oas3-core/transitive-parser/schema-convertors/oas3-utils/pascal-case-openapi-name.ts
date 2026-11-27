import { pascalCaseTypeName } from '../../../transitive-utils';

/**
 * Keeps OpenAPI-derived declaration names valid when a title or ID starts
 * with a digit or another non-identifier character.
 */
export function pascalCaseOpenApiName(value: string): string {
  const name = pascalCaseTypeName(value);

  return /^[A-Za-z_$]/.test(name) ? name : `Api${name}`;
}
