import _ from 'lodash';

// todo оптимизировать файлову структуру и типизацию
import { DataTypeDescriptor } from '../../../core/data-type-descriptor';
import { BaseConvertor } from '../../../core';
import { AbstractTypeScriptDescriptor } from './abstract';

export class EnumTypeScriptDescriptor
    extends AbstractTypeScriptDescriptor
    implements DataTypeDescriptor {

    protected static _usedNames = {};

    protected propertiesSets: [{
        [name: string]: PropertyDescriptor
    }] = [ {} ];

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
        protected convertor: BaseConvertor,
        public readonly context: {[name: string]: DataTypeDescriptor},
        public readonly modelName: string,
        public readonly suggestedModelName: string,
        public readonly originalSchemaPath: string

    ) {
        super(
            schema,
            convertor,
            context,
            modelName || EnumTypeScriptDescriptor.getNewEnumName(suggestedModelName),
            suggestedModelName,
            originalSchemaPath
        );
    }

    public render(
        childrenDependencies: DataTypeDescriptor[],
        rootLevel: boolean = true
    ): string {
        const { modelName } = this;

        if (!modelName) {
            return this.renderInlineTypeVariant();
        }

        if (!rootLevel && modelName) {
            childrenDependencies.push(this);

            return modelName;
        }

        // root level
        switch (this.schema.type) {
            case 'string':
                return this.renderRootStringEnum();

            default:
                return this.renderInlineTypeVariant(true);
        }
    }

    private renderInlineTypeVariant(rootLevel: boolean = false): string {
        const inline = _.map(
            this.schema.enum,
            enumItem => JSON.stringify(enumItem)
        )
            .join(' | ');

        return rootLevel
            ? `${this.getComments()} export type ${this.modelName} = ${inline}`
            : inline;
    }

    private renderRootStringEnum(): string {
        const humaniedVariableNames = _(this.schema.enum)
            .map(_.camelCase)
            .map(enumItem => /^[a-z]/.test(enumItem) ? enumItem : `_${enumItem}`)
            .map(_.upperFirst)
            .uniq()
            .value();

        if (humaniedVariableNames.length === this.schema.enum.length) {
            return `export enum ${this.modelName} {${
                _.map(humaniedVariableNames, (varName, index) =>
                    `${varName} = ${JSON.stringify(this.schema.enum[index])}`
                )
            }}`;
        } else {
            return this.renderInlineTypeVariant(true)
        }
    }
}
