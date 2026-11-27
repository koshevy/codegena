import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';

export function pascalCaseTypeName(name: string): string {
  return upperFirst(camelCase(name));
}
