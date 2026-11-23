export type HasMaximum = (
  | { maximum: number; exclusiveMaximum: never }
  | { exclusiveMaximum: number; maximum: never }
);

export type HasMinimum = (
  | { minimum: number; exclusiveMinimum: never }
  | { exclusiveMinimum: number; minimum: never }
);

export interface HasMultiplyOf {
  multipleOf: number;
}

export type HasNumericValue = (
  & HasMaximum
  & HasMinimum
  & HasMultiplyOf
);

export type CanHaveNumericValue = Partial<HasNumericValue>;
