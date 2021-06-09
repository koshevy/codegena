import _ from 'lodash';

import {
    Generic as SchemaGeneric,
    Schema,
} from '@codegena/definitions/json-schema';
import {
    BaseConvertor,
    DataTypeDescriptor,
} from '../../../core';
import { AbstractTypeScriptDescriptor } from './abstract';

type RangValue = Array<string | number>;
type RangeValueMatrix = RangValue[];

export class GenericDescriptor
    extends AbstractTypeScriptDescriptor
    implements DataTypeDescriptor {

    public assignedTypes = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    public children: {[key: string]: DataTypeDescriptor[]};

    constructor(

        public schema: SchemaGeneric,

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

        this.children = _.mapValues(
            schema.children,
            (child: SchemaGeneric | Schema, key: string) => convertor.convert(
                child,
                context,
                null,
                this._getChildSuggestedName(key)
            )
        );
    }

    public render(
        childrenDependencies: DataTypeDescriptor[],
        rootLevel: boolean = true
    ): string {
        const comment = this.getComments();
        const rangeOfValues = this.getDeepRangeOfValuesMatrix();
        const rangeOfValuesTypes = _.map(
            rangeOfValues,
            (valuesOnLevel, level) => {
                const valueRange = _.map(
                    valuesOnLevel,
                    value => JSON.stringify(
                        Number(value) || value
                    )
                ).join(' | ');

                return `${
                    this.assignedTypes[level]
                } extends ${valueRange} = ${valueRange}`;
            }
        ).join(', ');

        const result = `${rootLevel ? `${comment}export type ${
            this.modelName
        }<${rangeOfValuesTypes}> = ` : ''}${
            this.subRender(childrenDependencies, this.assignedTypes)
        };`;

        return rootLevel
            ? this.formatCode(result)
            : result;
    }

    public subRender(
        childrenDependencies: DataTypeDescriptor[],
        assignedTypeAliases: Array<number | string>
    ): string {
        const [assignedToKey] = assignedTypeAliases;
        let result = '';

        _.mapValues(this.children, (
            childGroup: Array<GenericDescriptor | AbstractTypeScriptDescriptor>,
            associatedValue
        ) => {
            const [child] = childGroup;

            result += `${assignedToKey} extends ${
                JSON.stringify(Number(associatedValue) || associatedValue)
            }`;

            if (child instanceof GenericDescriptor) {
                result += ' ? ';
                result += child.subRender(childrenDependencies, assignedTypeAliases.slice(1));
            } else {
                result += ' ? ';

                result += _.map(childGroup, (simpleChild: AbstractTypeScriptDescriptor) => {
                    return simpleChild.getComments() + '\n' + simpleChild.render(
                        childrenDependencies,
                        false
                    );
                }).join('\n | ');
            }

            result += ' : ';
        });

        result += 'any';

        return result;
    }

    public toString(): string {
        return `${this.modelName || 'Anonymous Generic Type'}${
            this.originalSchemaPath
                ? `(${this.originalSchemaPath})`
                : ''
            }`;
    }

    protected _getChildSuggestedName(key: string): string {
        const postfix = _.upperFirst(key.replace(/[^\w]+/g, '_'));

        return `${this.modelName}`;
    }

    protected getDeepRangeOfValuesMatrix(): RangeValueMatrix {
        const result: RangeValueMatrix = [];

        function collectMatrixLevel(
            descriptior: GenericDescriptor,
            level: number,
            matrix: RangeValueMatrix
        ) {
            if (!matrix[level]) {
                matrix.push([]);
            }

            _.each(descriptior.children, (column: GenericDescriptor[], keyInColumn) => {
                matrix[level].push(keyInColumn);
                _.each(column, (descriptionInColumn: GenericDescriptor | any) => {
                    if (descriptionInColumn instanceof GenericDescriptor) {
                        collectMatrixLevel(descriptionInColumn, level + 1, matrix);
                    }
                });
            });
        }

        collectMatrixLevel(this, 0, result);

        return _.map(result, (valuesOnLevel) => _.uniq(valuesOnLevel));
    }
}
