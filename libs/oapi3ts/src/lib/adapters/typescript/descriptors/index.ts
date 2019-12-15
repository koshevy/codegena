import { SchemaObject, SchemaGeneric } from '../../../core';

import { AbstractTypeScriptDescriptor } from './abstract';
import { AnyTypeScriptDescriptor } from './any';
import { ArrayTypeScriptDescriptor } from './array';
import { BooleanTypeScriptDescriptor } from './boolean';
import { EnumTypeScriptDescriptor } from './enum';
import { GenericDescriptor } from './generic';
import { InstanceofDescriptior } from './instanceof';
import { NullTypeScriptDescriptor } from './null';
import { NumberTypeScriptDescriptor } from './number';
import { ObjectTypeScriptDescriptor } from './object';
import { SomeOfTypeScriptDescriptor } from './some-of';
import { AllOfTypeScriptDescriptor } from './all-of';
import { StringTypeScriptDescriptor } from './string';

export interface DescriptorRuleSchema {
    _schemaComplied?: any;
    rule?: DescriptorRule | {
        allOf?: DescriptorRuleSchema[];
        anyOf?: DescriptorRuleSchema[];
        oneOf?: DescriptorRuleSchema[];
    };
    classConstructor: typeof AbstractTypeScriptDescriptor;
}

export type DescriptorRuleFn = (schema: SchemaObject) => boolean;
export type DescriptorRule = SchemaObject | DescriptorRuleFn | any;

/**
 * Правила для определения: какой тип данных будет использоваться.
 *
 * - rule — это описание условий для JSON Schema-объекта в формате JSON Schema
 * - classConstructor — конструктор для класса, наследующего интерфейс `DataTypeDescriptor`
 *
 */
export const rules: DescriptorRuleSchema[] = [
    {
        classConstructor: GenericDescriptor,
        rule: (schema: SchemaObject | SchemaGeneric) => schema instanceof SchemaGeneric
    },
    {
        classConstructor: SomeOfTypeScriptDescriptor,
        rule: {
            additionalProperties: true,
            properties: {
                oneOf: {
                    items: {
                        type: 'object'
                    },
                    type: 'array'
                }
            },
            required: ['oneOf'],
            type: 'object'
        }
    },
    {
        classConstructor: SomeOfTypeScriptDescriptor,
        rule: {
            additionalProperties: true,
            properties: {
                anyOf: {
                    items: {
                        type: 'object'
                    },
                    type: 'array'
                }
            },
            required: ['anyOf'],
            type: 'object',
        }
    },
    {
        classConstructor: AllOfTypeScriptDescriptor,
        rule: {
            additionalProperties: true,
            properties: {
                allOf: {
                    items: {
                        type: 'object'
                    },
                    type: 'array'
                }
            },
            required: ['allOf'],
            type: 'object',
        },
    },
    {
        classConstructor: EnumTypeScriptDescriptor,
        rule: {
            additionalProperties: true,
            properties: {
                enum: {
                    items: {
                        anyOf: [
                            {type: 'string'},
                            {type: 'number'}
                        ]
                    },
                    type: 'array'
                }
            },
            required: ['enum'],
            type: 'object'
        }
    },
    {
        classConstructor: NumberTypeScriptDescriptor,
        rule: {
            additionalProperties: true,
            properties: {
                type: {
                    pattern: '(integer|number)',
                    type: 'string'
                }
            },
            required: ['type'],
            type: 'object',
        }
    },
    {
        classConstructor: StringTypeScriptDescriptor,
        rule: {
            additionalProperties: true,
            properties: {
                type: {
                    pattern: 'string',
                    type: 'string'
                }
            },
            required: ['type'],
            type: 'object',
        },
    },
    {
        classConstructor: ObjectTypeScriptDescriptor,
        rule: {
            allOf: [
                {
                    additionalProperties: true,
                    properties: {
                        additionalProperties: {
                            type: ['boolean', 'object']
                        },
                        properties: {
                            type: 'object'
                        },
                        required: {
                            type: 'array'
                        },
                        type: {
                            pattern: 'object',
                            type: 'string'
                        }
                    },
                    type: 'object',
                },
                {
                    anyOf: [
                        {
                            required: ['additionalProperties'],
                        },
                        {
                            required: ['properties'],
                        },
                        {
                            required: ['required'],
                        },
                        {
                            required: ['type'],
                        }
                    ]
                }
            ]
        },
    },
    {
        classConstructor: ArrayTypeScriptDescriptor,
        rule: {
            additionalProperties: true,
            properties: {
                type: {
                    pattern: 'array',
                    type: 'string'
                }
            },
            required: ['type'],
            type: 'object',
        },
    },
    {
        classConstructor: BooleanTypeScriptDescriptor,
        rule: {
            additionalProperties: true,
            properties: {
                type: {
                    pattern: 'boolean',
                    type: 'string'
                }
            },
            required: ['type'],
            type: 'object',
        },
    },
    {
        classConstructor: NullTypeScriptDescriptor,
        rule: {
            additionalProperties: true,
            properties: {
                type: {
                    pattern: 'null',
                    type: 'string'
                }
            },
            required: ['type'],
            type: 'object',
        },
    },
    {
        classConstructor: InstanceofDescriptior,
        rule: {
            additionalProperties: true,
            properties: {
                'instanceof': {
                    type: 'string'
                }
            },
            required: ['instanceof'],
            type: 'object'
        },
    },
    // тип по-умолчанию
    {
        classConstructor: AnyTypeScriptDescriptor,
        rule: {
            additionalProperties: true,
            type: 'object'
        },
    }
];
