export type ExpectedValueType = (
  | 'array'
  | 'boolean'
  | 'number'
  | 'object'
  | 'string'
);

export type ExpectingValue<
  TExpectedValueArg extends ExpectedValueType,
> = TExpectedValueArg extends 'array'
  ? unknown[]
  : TExpectedValueArg extends 'boolean'
    ? boolean
    : TExpectedValueArg extends 'number'
      ? number
      : TExpectedValueArg extends 'object'
        ? Record<string, unknown>
        : TExpectedValueArg extends 'string'
          ? string
          : undefined;
