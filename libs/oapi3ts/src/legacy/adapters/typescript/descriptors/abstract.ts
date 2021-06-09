import _ from 'lodash';
import { Options } from 'prettier';
import prettier from 'prettier/standalone';
import prettierParserMD from 'prettier/parser-markdown';
import prettierParserTS from 'prettier/parser-typescript';

const commonPrettierOptions: Options = {
    plugins: [prettierParserMD, prettierParserTS],
    proseWrap: 'always',
    singleQuote: true
};

// todo оптимизировать файлову структуру и типизацию
import {
    DataTypeDescriptor,
    DataTypeContainer
} from '../../../core/data-type-descriptor';
import { BaseConvertor } from '../../../core';

interface PropertyDescriptor {
    required: boolean;
    typeContainer: DataTypeContainer;
}

export abstract class AbstractTypeScriptDescriptor implements DataTypeDescriptor {

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
         * Родительсткие модели.
         */
        public readonly ancestors?: DataTypeDescriptor[]

    ) { }

    /**
     * todo todo https://github.com/koshevy/codegena/issues/33
     */
    public getComments(): string {
        return this.makeComment(
            this.schema.title,
            this.schema.description
        );
    }

    public toString(): string {
        return `${this.modelName || 'Anonymous Type'}${
            this.originalSchemaPath
                ? `(${this.originalSchemaPath})`
                : ''
        }`;
    }

    /**
     * Rendering of children {@link DataTypeDescriptor} into string.
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
    public abstract render(
        childrenDependencies: DataTypeDescriptor[],
        rootLevel: boolean
    ): string ;

    /**
     * Formatting code. Supports TypeScript and Markdown essences.
     * todo https://github.com/koshevy/codegena/issues/33
     *
     * @param code
     * @param codeType
     */
    protected formatCode(
        code: string,
        codeType: 'typescript' | 'markdown' = 'typescript'
    ): string {
        const prettierOptions = {
            parser: codeType,
            ...commonPrettierOptions
        };

        return prettier.format(code, prettierOptions);
    }

    /**
     * todo todo https://github.com/koshevy/codegena/issues/33
     */
    protected makeComment(title: string, description: string): string {
        const markdownText = this.formatCode(
            [
                title ? `## ${title}` : '',
                (description || '').trim()
            ].join('\n'),
            'markdown'
        );

        const commentLines = _.compact(markdownText.split('\n'));
        let comment = '';

        if (commentLines.length) {
            comment = `/**\n${_.map(
                commentLines,
                v => ` * ${v}`
            ).join('\n')}\n */\n`;
        }

        return comment;
    }
}
