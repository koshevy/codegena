export type HasNumericValue = & HasMaximum
                              & HasMinimum
                              & HasMultiplyOf;

export type HasMaximum = { maximum: number; } | { exclusiveMaximum: number; }
export type HasMinimum = { minimum: number; } | { exclusiveMinimum: number; }

export interface HasMultiplyOf {
    multipleOf: number;
}
