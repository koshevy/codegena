export type HasCombinedVariants<TPayload = unknown> = | AllOfSchema<TPayload>
                                                      | AnyOfSchema<TPayload>
                                                      | OneOfSchema<TPayload>;

export interface AllOfSchema<TPayload = unknown> {
    allOf: TPayload[];
}
export interface AnyOfSchema<TPayload = unknown> {
    anyOf: TPayload[];
}
export interface OneOfSchema<TPayload = unknown> {
    oneOf: TPayload[];
}
