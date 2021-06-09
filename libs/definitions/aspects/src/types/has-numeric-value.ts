export type HasNumericValue = & HasMaximum
                              & HasMinimum
                              & HasMultiplyOf;

export type HasMaximum = {
    maximum: number;
    exclusiveMaximum: never;
} | {
    maximum: never;
    exclusiveMaximum: number;
}
export type HasMinimum = {
    minimum: number;
    exclusiveMinimum: never;
} | {
    minimum: never;
    exclusiveMinimum: number;
}

export interface HasMultiplyOf {
    multipleOf: number;
}
