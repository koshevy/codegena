import _ from 'lodash';

// todo оптимизировать файлову структуру и типизацию
import { DataTypeDescriptor } from '../../../core/data-type-descriptor';
import { BaseConvertor } from '../../../core';
import { AbstractTypeScriptDescriptor } from './abstract';

export class EnumTypeScriptDescriptor
    extends AbstractTypeScriptDescriptor
    implements DataTypeDescriptor {

    /**
     * Учет автосозданных имён типов.
     */
    protected static _usedNames = {};

    /**
     * Свойства, относящиеся к этому объекту
     * (интерфейсы и классы).
     */
    protected propertiesSets: [{
        [name: string]: PropertyDescriptor
    }] = [ {} ];

    /**
     * Создение нового имени для `enum`, т.к. `enum` не может
     * быть анонимным.
     */
    public static getNewEnumName(suggestedModelName: string): string {
        const name = suggestedModelName
            ? `${suggestedModelName}Enum`
            : `Enum`;

        if (!this._usedNames[name]) {
            this._usedNames[name] = 1;
        } else {
            this._usedNames[name]++;
        }

        return `${name}${
            (this._usedNames[name] > 1)
                ? `_${this._usedNames[name] - 2}`
                : ''
        }`;
    }

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
            modelName || (modelName = EnumTypeScriptDescriptor.getNewEnumName(suggestedModelName)),
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

        const type = this.schema.type;

        // especially case: string variants
        if ( !rootLevel &&
             (
                 (type === 'string') ||
                 (type === 'number') ||
                 (_.isArray(type) && _.includes(['string', 'number'], type[0]))
             )
        ) {

            return _.map(this.schema.enum, (v) => JSON.stringify(v))
                .join(' | ');
        }

        // other cases

        if (!rootLevel && this.modelName) {
            childrenDependencies.push(this);
        }

        const comment = this.getComments();

        return rootLevel ? `${comment}export enum ${this.modelName} {${
                _.map(this.schema.enum, v => {
                    return `${this._enumItemName(v)} = ${JSON.stringify(v)}`;
                }).join(', ')
            }}` : this.modelName;
    }

    private _enumItemName(name: string): string {
        name = name.replace(/\-$/, 'Minus');
        name = name.replace(/\+$/, 'Plus');
        name = _.camelCase(name.replace(/[^\w]+/g, ''));
        name = name.replace(
            /^./,
            name[0].match(/^\d+$/)
                ? `_${name[0]}`
                : name[0].toUpperCase()
        );

        return name;
    }
}
