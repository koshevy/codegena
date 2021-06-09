export interface HasCombinedVariants<TSubSchema = unknown> {
    allOf: Partial<TSubSchema>[];
    anyOf: Partial<TSubSchema>[];
    oneOf: Partial<TSubSchema>[];
}
