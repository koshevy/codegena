/* eslint-disable max-len */
/**
 * @see https://json-schema.org/understanding-json-schema/reference/conditionals#ifthenelse
 */
export interface HasIf<
  TConditionSchema,
  TThenSchema = unknown,
  TElseSchema = unknown,
> {
  if: TConditionSchema;
  then?: TThenSchema;
  else?: TElseSchema;
}
