export interface HasProperties<TProperty, TPropertyNames extends string> {
    additionalProperties: boolean | TProperty;
    dependencies: Partial<Record<TPropertyNames, TPropertyNames>>;
    minProperties: number;
    maxProperties: number;
    properties: Record<TPropertyNames, TProperty>,
    propertyNames: {
        pattern: string;
    };
    required: TPropertyNames[];
}
