export interface HasAllOfVariants<TSubSchema = unknown> {
  allOf: Partial<TSubSchema>[];
}

export interface HasAnyOfVariants<TSubSchema = unknown> {
  anyOf: Partial<TSubSchema>[];
}

export interface HasOneOfVariants<TSubSchema = unknown> {
  oneOf: Partial<TSubSchema>[];
}

export type HasCombinedVariants<TSubSchema = unknown> = (
  & HasAllOfVariants<TSubSchema>
  & HasAnyOfVariants<TSubSchema>
  & HasOneOfVariants<TSubSchema>
);

export type CanHaveCombinedVariants<TSubSchema = unknown> = Partial<
  HasCombinedVariants<TSubSchema>
>;
