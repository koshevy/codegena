import _ from 'lodash';

// todo оптимизировать файлову структуру и типизацию
import {
    DataTypeDescriptor,
    DataTypeContainer
} from '../../../core/data-type-descriptor';
import { BaseConvertor } from '../../../core';
import { AbstractTypeScriptDescriptor } from './abstract';

export class ArrayTypeScriptDescriptor
    extends AbstractTypeScriptDescriptor
    implements DataTypeDescriptor {

    protected commonItemType: DataTypeContainer;
    protected exactlyListedItems: DataTypeContainer[];

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

        const parentName = (modelName || suggestedModelName);

        if (schema.items && _.isArray(schema.items)) {
            this.exactlyListedItems = _.map(
                schema.items,
                (schemaItem, index) => convertor.convert(
                    schemaItem,
                    context,
                    null,
                    parentName
                        ? `${parentName}Item${index}`
                        : null
                )
            );
        } else if (schema.items) {
            this.commonItemType = convertor.convert(
                schema.items,
                context,
                null,
                parentName
                    ? `${parentName}Items`
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
        const result = `${rootLevel ? `${comment}export type ${this.modelName} = ` : ''}${
            this._renderArrayItemsTypes(childrenDependencies)
        }`;

        return rootLevel
            ? this.formatCode(result)
            : result;
    }

    private _renderArrayItemsTypes(childrenDependencies: DataTypeDescriptor[]): string {
        if (this.exactlyListedItems) {
            return `[\n${_.map(
                this.exactlyListedItems,
                (itemDescrs: DataTypeDescriptor[]) => {
                    return _.map(
                        itemDescrs,
                        (descr: DataTypeDescriptor) => descr.render(
                            childrenDependencies,
                            false
                        ) + (descr.schema['description']
                            ? `, // ${descr.schema['description']}`
                            : ',')
                    );
                }
            ).join('\n')}\n]`;
        } else if (this.commonItemType) {
            return _.map(
                this.commonItemType,
                (descr: DataTypeDescriptor) =>
                    `Array<${
                        descr.render(childrenDependencies, false)
                    }>`
            ).join(' | ');
        } else {
            return 'any[]';
        }
    }
}
