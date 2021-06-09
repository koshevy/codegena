// todo оптимизировать файлову структуру и типизацию
import { BaseConvertor } from '../../../core';
import { DataTypeDescriptor } from '../../../core/data-type-descriptor';
import { AbstractTypeScriptDescriptor } from './abstract';

export class BooleanTypeScriptDescriptor
    extends AbstractTypeScriptDescriptor
    implements DataTypeDescriptor {

    constructor(

        public schema: any,

        /**
         * Родительский конвертор, который используется
         * чтобы создавать вложенные дескрипторы.
         */
        convertor: BaseConvertor,

        /**
         * Рабочий контекст
         */
        public context: {[name: string]: DataTypeDescriptor},

        /**
         * Название этой модели (может быть string
         * или null).
         */
        public modelName: string,

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
        public originalSchemaPath: string

    ) {
        super(
            schema,
            convertor,
            context,
            modelName,
            suggestedModelName,
            originalSchemaPath
        );
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

        return `${rootLevel ? `${comment}export type ${this.modelName} = ` : ''}boolean`;
    }
}
