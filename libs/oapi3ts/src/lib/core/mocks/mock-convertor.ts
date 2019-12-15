import { BaseConvertor } from '../convertor';
import { SchemaGeneric, Schema } from '../schema';

import {
    DataTypeContainer,
    DataTypeDescriptor,
    DescriptorContext
} from '../index';

/**
 * Mock convertor for tests
 */
export class MockConvertor extends BaseConvertor {

    public convert(
        schema: Schema | SchemaGeneric,
        context: DescriptorContext,
        name?: string,
        suggestedName?: string,
        originalSchemaPath?: string,
        ancestors?: DataTypeDescriptor[]
    ): DataTypeContainer {

        return [{
            ancestors: [],
            getComments: () => null,
            modelName: name,
            originalSchemaPath,
            render: (childrenDependencies: DataTypeDescriptor[], rootLevel: boolean) => null,
            schema: (schema as any),
            suggestedModelName: suggestedName,
        }];
    }
}
