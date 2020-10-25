import _ from 'lodash';
import { SchemaObject } from '@codegena/definitions/json-schema';
import {
    DataTypeDescriptor,
    DataTypeContainer
} from '../../../core/data-type-descriptor';
import { BaseConvertor } from '../../../core';
import { defaultConfig } from '../../../core/config';
import { AbstractTypeScriptDescriptor } from './abstract';

// todo support default values!
export interface PropertyDescriptor {
    required: boolean;
    readOnly: boolean;
    typeContainer: DataTypeContainer;
    comment: string;
    defaultValue: undefined;
    exampleValue: undefined;
}

export class ObjectTypeScriptDescriptor
    extends AbstractTypeScriptDescriptor
    implements DataTypeDescriptor {

    /**
     * Свойства, относящиеся к этому объекту
     * (интерфейсы и классы).
     */
    public propertiesSets: [{
        [name: string]: PropertyDescriptor
    }] = [ {} ];

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
        public readonly originalSchemaPath: string,

        /**
         * Родительские модели.
         */
        public readonly ancestors?: ObjectTypeScriptDescriptor[]

    ) {
        super(
            schema,
            convertor,
            context,
            modelName,
            suggestedModelName,
            originalSchemaPath,
            ancestors
        );

        // autofill properties from `required` not presented in `properties`
        // with default options
        _.each(schema.required || [], propertyName => {
            if (!schema.properties[propertyName]) {
                schema.properties[propertyName] = {
                    description: "Auto filled property from `required`"
                }
            }
        });

        if (schema.properties) {
            _.each(schema.properties, (propSchema, propName) => {

                const suggestedName = (modelName || suggestedModelName || '')
                    + _.camelCase(propName).replace(
                        /^./, propName[0].toUpperCase()
                    );

                if (propSchema && propSchema.nullable && propSchema.type) {
                    propSchema = {
                        oneOf: [
                            { type: 'null'},
                            _.omit(propSchema, 'nullable')
                        ]
                    } as any; // todo describe oneOf for base schema
                }

                const typeContainer = convertor.convert(
                    propSchema,
                    context,
                    null,
                    suggestedName
                );

                let comment;
                const isReadyDescriptor = !_.isEmpty(typeContainer) && !_.isEmpty(typeContainer[0]);

                if (propSchema.title || propSchema.description) {
                    comment = this.makeComment(propSchema.title, propSchema.description);
                } else {
                    comment = isReadyDescriptor
                        ? typeContainer[0].getComments()
                        : ''
                }

                const propDescr = {
                    required: _.findIndex(
                        schema.required || [],
                        v => v === propName
                    ) !== -1,
                    readOnly: propSchema.readOnly || propSchema['readonly'],
                    typeContainer,
                    comment,
                    defaultValue: propSchema.default,
                    exampleValue: isReadyDescriptor
                        ? this._findExampleInTypeContainer(typeContainer)
                        : undefined
                };

                this.propertiesSets[0][propName] = propDescr;
            });
        }

        // обработка свойств предков
        if (this.ancestors) {
            _.each(this.ancestors, ancestor => {
                const ancestorProperties = _.mapValues(
                    ancestor['propertiesSets'][0] || {},
                    // applying local `required` for inherited props
                    (property, propertyName) => {
                        return _.includes(this.schema.required || [], propertyName)
                            ? {...property, required: true}
                            : property
                    }
                );

                _.assign(this.propertiesSets[0], ancestorProperties);
            });
        } else if (
            // если по итогам, свойств нет, указывается
            // универсальное описание
            schema.additionalProperties ||
            ( !_.keys(this.propertiesSets[0] || {}).length
              && (schema.additionalProperties !== false))
        ) {
            const addProp = schema.additionalProperties;
            const typeContainer = ('object' === typeof addProp)
                ? convertor.convert(
                    // these properties does not affect a schema
                    _.omit(
                        addProp,
                        defaultConfig.excludeFromComparison
                    ) as SchemaObject,

                    context,
                    null,
                    `${modelName}Properties`
                )
                : convertor.convert(
                    {} as any,
                    {} as any
                );

            this.propertiesSets[0]['[key: string]'] = {
                comment: typeContainer[0]
                    ? typeContainer[0].getComments()
                    : '',
                defaultValue: undefined,
                exampleValue: undefined,
                readOnly: ('object' === typeof addProp)
                    ? addProp.readOnly || false
                    : false,
                required: true,
                // если нет свойств, получает тип Any
                typeContainer
            };
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

        if (rootLevel && !this.modelName) {
            throw new Error(
                'Root object models should have model name!'
            );
        } else if (!rootLevel && this.modelName) {
            childrenDependencies.push(this);

            // если это не rootLevel, и есть имя,
            // то просто выводится имя
            return this.modelName;
        }

        const comment = this.getComments();
        const prefix = (rootLevel)
            ? (this.propertiesSets.length > 1
                ? `${comment}export type ${this.modelName} = `
                : `${comment}export interface ${this.modelName}${
                    this._renderExtends(childrenDependencies)
                }`)
            : '';

        // рекурсивно просчитывает вложенные свойства
        const properties = _.map(
            this.propertiesSets,
            (propertySet) => `{ ${_.values(_.map(
                propertySet,
                (descr: PropertyDescriptor, name) => {
                    const propName = name.match(/\-/) ? `'${name}'` : name;

                    return `\n${descr.comment}${
                        descr.readOnly ? 'readonly ' : ''
                    }${propName}${!descr.required ? '?' : ''}: ${
                        _.map(
                            descr.typeContainer,
                            type => type.render(childrenDependencies, false)
                        ).join('; ')
                    }`;
                }
            )).join('; ')} }`
        ).join(' | ');

        if (rootLevel) {
            return this.formatCode(
                [prefix, properties].join('')
            );
        } else {
            return [prefix, properties].join('');
        }
    }

    public getExampleValue(): {[key: string]: any} {
        return this.schema.example || _.mapValues(
            this.propertiesSets[0],
            (v: PropertyDescriptor) => v.exampleValue || v.defaultValue
        );
    }

    /**
     * Превращение "ancestors" в строку.
     */
    private _renderExtends(dependencies: DataTypeDescriptor[]): string {
        let filteredAncestors = [];

        if (this.ancestors && this.ancestors.length) {
            filteredAncestors = _.filter(
                this.ancestors,
                ancestor => ancestor.modelName ? true : false
            );
        }

        dependencies.push.apply(
            dependencies,
            filteredAncestors
        );

        return filteredAncestors.length
            ? ` extends ${_.map(filteredAncestors, v => v.modelName).join(', ')} `
            : '';
    }

    private _findExampleInTypeContainer(
        typeContainer: DataTypeContainer
    ): any {
        for (const descr of typeContainer) {
            if (descr instanceof ObjectTypeScriptDescriptor) {
                return descr.getExampleValue();
            } else {
                const schema = descr.schema as SchemaObject;
                const exV = schema.example || schema.default;
                if (exV) {
                    return exV;
                }
            }
        }

        return;
    }
}
