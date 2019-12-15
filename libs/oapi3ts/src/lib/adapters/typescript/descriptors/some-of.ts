import _ from 'lodash';
import {
    DataTypeDescriptor,
    DataTypeContainer
} from '../../../core/data-type-descriptor';
import { BaseConvertor, Schema } from '../../../core';
import { AbstractTypeScriptDescriptor } from './abstract';

enum SomeOfType {
    OneOf = 'oneOf',
    AnyOf = 'anyOf'
}

export class SomeOfTypeScriptDescriptor
    extends AbstractTypeScriptDescriptor
    implements DataTypeDescriptor {

    /**
     * Описания вариантов, которые являются частью типа.
     * При рендеринге будут исключены те типы, которые
     * рендерятся в одинаковый результат.
     */
    public variants: DataTypeContainer;

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

        if (!schema[SomeOfType.AnyOf] && !schema[SomeOfType.OneOf]) {
            throw new Error([
                'Error: descriptor, recognized as "SomeOf"',
                'should have "oneOf" or "allOf" properties.'
            ].join(' '));
        }

        const conditionType = !!schema.oneOf
            ? SomeOfType.OneOf
            : SomeOfType.AnyOf;

        const subSchemas = schema[conditionType];

        this.variants = _(subSchemas)
            .map((variant) =>
                convertor.convert(
                    variant,
                    context,
                    null,
                    null
                ))
            .flattenDeep()
            .value();
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

        const result = `${rootLevel ? `${comment}export type ${this.modelName} = ` : ''}${
            this.variants
                ? _.uniq(_.map(
                    this.variants,
                    (descr: DataTypeDescriptor) => [
                        descr.render(childrenDependencies, false),
                        (   (typeof descr.schema['description'] === 'string')
                            && (descr.schema['description'] !== this.schema['description'])
                        )
                            ? `// ${descr.schema['description'].replace(/\s+/, ' ')}\n`
                            : ''
                    ].join(' ') + '\n'
                )).join(' | ')
                : 'any'
        }`;

        return rootLevel
            ? this.formatCode(result)
            : result;
    }
}
