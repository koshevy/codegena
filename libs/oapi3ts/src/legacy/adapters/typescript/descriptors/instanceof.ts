import {
    DataTypeDescriptor,
    DataTypeContainer
} from '../../../core/data-type-descriptor';

import { BaseConvertor } from '../../../core';
import { AbstractTypeScriptDescriptor } from './abstract';

export class InstanceofDescriptior extends AbstractTypeScriptDescriptor {

    protected instanceOf: string;
    protected genericOf: DataTypeContainer | DataTypeDescriptor;

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

        this.instanceOf = schema['instanceof'];

        if (schema['x-generic']) {
            this.genericOf = convertor.convert(
                schema['x-generic'],
                context,
                null,
                (modelName || suggestedModelName)
                    ? `${(modelName || suggestedModelName)}FormDataFormat`
                    : null
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

        return `${rootLevel ? `${comment}export type ${this.modelName} ${
            this.genericOf
                ? `<${this.genericOf}>`
                : ''
        } = ` : ''}${ this.instanceOf }`;
    }
}
