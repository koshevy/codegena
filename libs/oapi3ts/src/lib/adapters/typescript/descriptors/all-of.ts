import _ from 'lodash';

import {
    DataTypeDescriptor,
    DataTypeContainer
} from '../../../core/data-type-descriptor';
import { BaseConvertor, Schema, SchemaObject } from '../../../core';
import { AbstractTypeScriptDescriptor } from './abstract';
import { EnumTypeScriptDescriptor } from './enum';
import { GenericDescriptor } from './generic';
import { InstanceofDescriptior } from './instanceof';
import { ObjectTypeScriptDescriptor } from './object';
import { SomeOfTypeScriptDescriptor } from './some-of';

/**
 * Test cases:
 *   - All objects, all of objects are named, this Descriptor is named:
 *   -- New object object that extends those objects
 *   -
 */
export class AllOfTypeScriptDescriptor extends AbstractTypeScriptDescriptor {

    /**
     * Local schema that collect all property rules from nested schemas.
     */
    protected localSchema: SchemaObject;

    /**
     * Refs to non-anonymous types have to be ancestors.
     */
    protected namedObjectDescriptors: ObjectTypeScriptDescriptor[] = [];

    /**
     * Other (non-object types) might be exposed in complete type description.
     */
    protected otherAccessedTypes: DataTypeContainer = [];

    /**
     * New type of object that appears when this `allOf` is named
     * (have `modelName`) and have local object scheme.
     */
    protected brandNewObjectDescriptor: ObjectTypeScriptDescriptor;

    constructor(

        public schema: any,

        /**
         * Родительский конвертор, который используется
         * чтобы создавать вложенные дескрипторы.
         */
        protected convertor: BaseConvertor,

        /**
         * Рабочий контекст
         */
        public readonly context: {[name: string]: DataTypeDescriptor},

        /**
         * Название этой модели (может быть string
         * или null).
         */
        public readonly modelName: string,

        /*
         * Предлагаемое имя для типа данных: может
         * применяться, если тип данных анонимный, но
         * необходимо вынести его за пределы родительской
         * модели по-ситуации (например, в случае с Enum).
         */
        public readonly suggestedModelName: string,

        /**
         * Путь до оригинальной схемы, на основе
         * которой было создано описание этого типа данных.
         */
        public readonly originalSchemaPath: string

    ) {
        super(
            schema,
            convertor,
            context,
            modelName,
            suggestedModelName,
            originalSchemaPath
        );

        if (!schema.allOf) {
            throw new Error(`AllOf descriptor should contains "allOf" rule!`);
        }

        this.initSubitemsData();
    }

    /**
     * `AllOfTypeScriptDescriptor`-friendly data
     * for merging into other (usually parent) `AllOfTypeScriptDescriptor`.
     */
    public getAllOfFriendlyData(): {
        localSchema: SchemaObject;
        namedObjectDescriptors: DataTypeContainer;
        otherAccessedTypes: DataTypeContainer;
    } {
        return {
            localSchema: this.localSchema,
            namedObjectDescriptors: this.namedObjectDescriptors,
            otherAccessedTypes: this.otherAccessedTypes
        };
    }

    protected initSubitemsData(): void {
        const subDescriptors: DataTypeContainer = _(this.schema['allOf'])
            .map(schema => {
                const result = this.convertor.convert(
                    schema,
                    this.context,
                    null,
                    null
                );

                return _.map<DataTypeDescriptor, DataTypeContainer>(result,
                    descriptorInResult =>
                        // `SomeOf` is breaking to subtypes
                        (descriptorInResult instanceof SomeOfTypeScriptDescriptor)
                            ? (descriptorInResult as SomeOfTypeScriptDescriptor).variants
                            : result
                );
            })
            .flattenDeep()
            .value();

        _.each(subDescriptors, (subDescriptor: DataTypeDescriptor) => {
            switch (subDescriptor.constructor.name) {
                case AllOfTypeScriptDescriptor.name:
                    this.mergeOtherAllOf(subDescriptor as AllOfTypeScriptDescriptor);
                    break;
                case EnumTypeScriptDescriptor.name:
                case GenericDescriptor.name:
                case InstanceofDescriptior.name:
                    this.otherAccessedTypes.push(subDescriptor);
                    break;
                case ObjectTypeScriptDescriptor.name:
                    if (subDescriptor.modelName) {
                        // Named objects are descendatns
                        this.namedObjectDescriptors.push(
                            subDescriptor as ObjectTypeScriptDescriptor
                        );
                    } else {
                        // Anonymous objects are part of local schemes
                        this.mergeToLocalScheme(subDescriptor.schema as SchemaObject);
                    }

                    break;
            }
        });

        if (this.localSchema) {
            this.brandNewObjectDescriptor = new ObjectTypeScriptDescriptor(
                this.localSchema,
                this.convertor,
                this.context,
                this.otherAccessedTypes.length
                    ? null
                    : this.modelName,
                this.suggestedModelName,
                null,
                this.namedObjectDescriptors
            );
        }
    }

    /**
     * Рендер типа данных в строку.
     *
     * @param childrenDependencies
     * Immutable-массив, в который складываются все зависимости
     * типов-потомков (если такие есть).
     * @param rootLevel
     * Говорит о том, что это рендер "корневого"
     * уровня — то есть, не в составе другого типа,
     * а самостоятельно.
     *
     */
    public render(
        childrenDependencies: DataTypeDescriptor[],
        rootLevel: boolean = true
    ): string {
        const comment = this.getComments();
        let result;

        if (_.get(this.brandNewObjectDescriptor, 'modelName')) {
            // Case when it's just an interface
            result = this.brandNewObjectDescriptor.render(
                childrenDependencies,
                rootLevel
            );
        } else if (this.modelName && !rootLevel) {
            result = this.modelName;
            childrenDependencies.push(this);
        } else {
            const objectDescriptors = [...this.namedObjectDescriptors];
            let objectsRendered, othersRendered;

            if (this.brandNewObjectDescriptor) {
                objectDescriptors.push(this.brandNewObjectDescriptor);
            }

            if (objectDescriptors.length) {
                objectsRendered = _.map(
                    objectDescriptors,
                    (descriptor: ObjectTypeScriptDescriptor) =>
                        [
                            descriptor.render(childrenDependencies, false),
                            this.getSubItemComment(descriptor)
                        ].join(' ')
                ).join(' & ');
            }

            if (this.otherAccessedTypes.length) {
                othersRendered = _.map(
                    this.otherAccessedTypes,
                    (descriptor: DataTypeDescriptor) =>
                        [
                            descriptor.render(childrenDependencies, false),
                            this.getSubItemComment(descriptor)
                        ].join(' ')
                ).join(' | ');
            }

            result = `${rootLevel ? `${comment}export type ${this.modelName} = ` : ''}${
                _.compact([objectsRendered, othersRendered]).join(' | ')
            }`;
        }

        return rootLevel
            ? this.formatCode(result)
            : result;
    }

    protected mergeToLocalScheme(scheme: SchemaObject) {
        if (!this.localSchema) {
            this.localSchema = {
                description: this.schema.description,
                properties: {},
                required: [],
                title: this.schema.title,
                type: 'object',
            };
        }

        _.merge(
            this.localSchema,
            _.cloneDeep(_.pick(scheme, [
                'properties',
                'required',
                'type',
                'additionalProperties'
            ]))
        );
    }

    protected mergeOtherAllOf(otherAllOf: AllOfTypeScriptDescriptor): void {
        if (otherAllOf.localSchema) {
            this.mergeToLocalScheme(otherAllOf.localSchema);
        }

        if (otherAllOf.namedObjectDescriptors) {
            this.namedObjectDescriptors = _.uniqWith(
                [
                    ...this.namedObjectDescriptors,
                    ...otherAllOf.namedObjectDescriptors
                ],
                _.isEqual
            );
        }

        if (otherAllOf.otherAccessedTypes) {
            this.otherAccessedTypes = _.uniqWith(
                [
                    ...this.otherAccessedTypes,
                    ...otherAllOf.otherAccessedTypes
                ],
                _.isEqual
            );
        }
    }

    protected getSubItemComment(descriptor: DataTypeDescriptor): string {
        return (   (typeof descriptor.schema['description'] === 'string')
            && (descriptor.schema['description'] !== this.schema['description'])
        )
            ? `// ${descriptor.schema['description'].replace(/\s+/, ' ')}\n`
            : '';
    }
}
