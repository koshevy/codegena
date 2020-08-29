export interface HasProperties<TProperty> {
    additionalProperties: boolean | TProperty;
    dependencies: Record<string, string>;
    minProperties: number;
    maxProperties: number;
    properties: Record<string, TProperty>,
    propertyNames: {
        pattern: string;
    };
    required: string[];
}
