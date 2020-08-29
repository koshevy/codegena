import {
    ContainsItems,
    HasCombinedVariants,
    HasConstValue,
    HasBufferData,
    HasDefault,
    HasDescription,
    HasEnumeration,
    HasExample,
    HasItems,
    HasNumericValue,
    HasProperties,
    HasRef,
    HasStringValue,
} from '@codegena/definitions/aspects';
import { SchemaType } from './schema-type';

export type Schema = | SchemaUnknown
                     | SchemaConcrete;

export type SchemaConcrete = | SchemaArray
                             | SchemaBoolean
                             | SchemaInteger
                             | SchemaNull
                             | SchemaNumber
                             | SchemaObject
                             | SchemaString;

export type SchemaUnknown<TPayload = unknown> = & Partial<SchemaCommonAspected<TPayload>>
                                                & Partial<SchemaTyped>
                                                & Partial<SchemaCombined>
                                                & Record<string, any>;

export type SchemaCombinedPayload = & SchemaCommonAspected
                                    & SchemaTyped
                                    & HasCombinedVariants<SchemaCommonAspected & SchemaTyped>;
export type SchemaCombined = HasCombinedVariants<SchemaCombinedPayload>;

export interface SchemaCommonAspected<TPayload = unknown>
    extends HasConstValue<SchemaUnknown<TPayload>>,
            HasDefault<TPayload>,
            HasDescription,
            HasEnumeration<SchemaUnknown>,
            HasExample<TPayload>,
            HasRef {}

export interface SchemaTyped {
    type: SchemaType | string;
}

export type SchemaArray = & SchemaUnknown<any[]>
                          & Partial<HasItems>
                          & Partial<ContainsItems<SchemaUnknown>>
                          & { type: 'array'; };

export type SchemaBoolean = & SchemaUnknown<boolean>
                            & { type: 'boolean'; };

export type SchemaInteger = & SchemaUnknown<number>
                            & Partial<HasNumericValue>
                            & { type: 'integer'; };

export type SchemaNull = & SchemaUnknown<number>
                         & { type: 'null'; };

export type SchemaNumber = & SchemaUnknown<number>
                           & Partial<HasNumericValue>
                           & { type: 'number'; };

export type SchemaObject = & SchemaUnknown<object>
                           & Partial<HasProperties<SchemaUnknown>>
                           & { type: 'object'; };

export type SchemaString = & SchemaUnknown<string>
                           & Partial<HasStringValue>
                           & Partial<HasBufferData>
                           & { type: 'string'; };
