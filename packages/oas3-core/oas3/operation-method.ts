export const operationMethods = [
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'query',
  'trace',
] as const;

export type OperationMethod = (typeof operationMethods)[number];

export function isOperationMethod(value: unknown): value is OperationMethod {
  const supportedMethods: ReadonlyArray<string> = operationMethods;

  return typeof value === 'string'
    && supportedMethods.includes(value);
}
