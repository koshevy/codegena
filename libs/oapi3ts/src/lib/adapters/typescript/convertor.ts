import _ from 'lodash';
import Ajv from 'ajv';

import {
    defaultConfig,
    BaseConvertor,
    ConvertorConfig,
    DataTypeContainer,
    DataTypeDescriptor,
    DescriptorContext,
    ParsingError,
    Schema,
    SchemaObject
} from '../../core';

// rules that helps determine a type of descriptor
import {
    DescriptorRuleFn,
    DescriptorRuleSchema,
    rules
} from './descriptors';

/**
 * Record in temporary list of schema in process.
 * Those records are creating in order to avoid infinity loop
 * for recursive types.
 */
interface SchemaHold {
    schema: Schema;
    bulk: Partial<DataTypeDescriptor | DataTypeContainer>;
}

/**
 * Class of converter from OAPI3 to TypeScript types.
 */
export class Convertor extends BaseConvertor {

    protected _ajv;
    protected _onHoldSchemas: SchemaHold[] = [];

    /**
     * Рекурсивный рендеринг
     * [контенейра дескрипторов типов]{@link DataTypeContainer}
     * с ренлерингом всех их зависиомостей.
     *
     * @param typeContainer
     * Типы, которые нужно отрендерить.
     * @param renderedCallback
     * Колбэк, который срабатывает при рендеринге типа.
     * @param alreadyRendered
     * Типы, которые уже отрендерены, и их рендерить не нужно
     * @param rootLevel
     * `false`, если это дочерний "процес"
     */
    public static renderRecursive(
        typeContainer: DataTypeContainer,
        renderedCallback: (
            descriptor: DataTypeDescriptor,
            text,
            childrenDependencies: DataTypeDescriptor[]
        ) => void,
        alreadyRendered: DataTypeContainer = []
    ): void {
        const result = [];

        _.each(typeContainer, (descr: DataTypeDescriptor) => {
            const childrenDependencies = [];
            let renderResult;

            // если этот тип еще не рендерился
            if (_.findIndex(
                alreadyRendered,
                v => v.toString() === descr.toString()
            ) !== -1) {
                return;
            } else {
                // помечает, что на следующем этапе не нужно
                // обрабатывать уже обработанные типы
                alreadyRendered.push(descr);
            }

            try {
                renderResult = descr.render(
                    childrenDependencies,
                    true
                );
            } catch(error) {
                const modelName = descr.modelName || descr.suggestedModelName || 'anonymous descriptor';

                throw new ParsingError(
                    `An error occured at rendering of ${modelName}`,
                    {
                        descriptors: [descr],
                        originalError: error,
                        schema: descr.schema
                    }
                )
            }

            // далее, рекурсивно нужно просчитать зависимости
            this.renderRecursive(
                // только те, которые еще не были просчитаны
                _.filter(
                    childrenDependencies,
                    (ov) => _.findIndex(
                        alreadyRendered,
                        iv => ov.toString() === iv.toString()
                    ) === -1
                ),
                renderedCallback,
                alreadyRendered
            );

            // Колбэк вызывается в конце, чтобы типы-зависимости
            // шли впереди использующих их.
            renderedCallback(descr, renderResult, childrenDependencies);
        });
    }

    constructor(
        /**
         * Конфигурация для конвертора.
         */
        protected config: ConvertorConfig = defaultConfig
    ) {
        super(config);
        this._ajv = new Ajv();
    }

    /**
     * Превращение JSON-схемы в описание типа данных.
     * Возвращает контейнер [дескрипторов типов]{@link DataTypeDescriptor},
     * в котором перечисляются типы данных (возможна принадлежность
     * к более чем одному типу данных: `number[] | InterfaceName`).
     *
     * @param schema
     * Схема, для которой будет подобрано соответствущее
     * правило, по которому будет определен дескриптор
     * нового типа данных.
     * @param context
     * Контекст, в котором хранятся ранее просчитаные модели
     * в рамках одной цепочки обработки.
     * @param name
     * Собственное имя типа данных
     * @param suggestedName
     * Предлагаемое имя для типа данных: может
     * применяться, если тип данных анонимный, но
     * необходимо вынести его за пределы родительской
     * модели по-ситуации (например, в случае с Enum).
     * @param originalPathSchema
     * Путь, по которому была взята схема
     * @param ancestors
     * Родительсткие модели
     *
     */
    public convert(
        schema: Schema,
        context: DescriptorContext,
        name?: string,
        suggestedName?: string,
        originalPathSchema?: string,
        ancestors?: DataTypeDescriptor[]
    ): DataTypeContainer {

        // holding schema on in order to avoid infinity loop
        const holdSchema = this._holdSchemaBeforeConvert(schema);
        const modelNameInErrorMsg = name || suggestedName || 'anonymous schema';
        // common payload for ParsingError if it needed
        const payloadPassedToError = {
            oasStructure: this._structure,
            context,
            relatedRef: originalPathSchema,
            schema
        };

        if (holdSchema) {
            return holdSchema.bulk as DataTypeContainer;
        }

        let result;

        if (schema.$ref) {
            // Scenario with $ref in schema:
            //
            // Here convertor has to decide: whether a schema with a $ref
            // equals with parent (pointed in the $ref) and, therefore,
            // should be replaced by parent, or not and should get a new model.

            // There are being excluded properties that does't make a difference on
            // what the type fits this schema (title, nullable и т.д.)
            const valuableOptionsCount = _.values(
                _.omit(schema, defaultConfig.excludeFromComparison),
            ).length;

            if (valuableOptionsCount === 1) {   // no valuable difference with options
                try {
                    result = (name && !this.config.implicitTypesRefReplacement)
                        // not anonymous type suppose to create new data type
                        // based on referred
                        ? this.convert(
                            this.getSchemaByPath(schema.$ref),
                            context,
                            name,
                            suggestedName,
                            originalPathSchema,
                            this.findTypeByPath(schema.$ref, context)
                        )
                        // anonymous type just replacing by referred type
                        : this.findTypeByPath(schema.$ref, context);
                } catch(error) {
                    // Rethrows already handled errors
                    if (error instanceof ParsingError) {
                        throw error;
                    }

                    throw new ParsingError(
                        [
                            `An error occurred at trying to convert ${modelNameInErrorMsg},`,
                            `based on sub referrence to ${schema.$ref}`
                        ].join(' '),
                        {
                            ...payloadPassedToError,
                            originalError: error
                        }
                    );
                }
            } else {
                const refSchema = this.getSchemaByPath(schema.$ref);

                if (!refSchema) {
                    throw new ParsingError(
                        [
                            `Error when ${modelNameInErrorMsg} resolves sub reference:`,
                            `$ref is not found: ${schema.$ref}`
                        ].join('\n'),
                        payloadPassedToError
                    );
                }

                _.merge(refSchema, _.omit(schema, ['$ref']));

                try {
                    result = this.convert(
                        refSchema,
                        context,
                        name,
                        suggestedName,
                        originalPathSchema,
                        this.findTypeByPath(schema.$ref, context)
                    );
                } catch (error) {
                    // Rethrows already handled errors
                    if (error instanceof ParsingError) {
                        throw error;
                    }

                    throw new ParsingError(
                        [
                            `An error occurred at trying to convert ${modelNameInErrorMsg},`,
                            `based on sub referrence to ${schema.$ref}`
                        ].join(' '),
                        {
                            ...payloadPassedToError,
                            originalError: error
                        }
                    );
                }
            }
        } else {    // Base scenario (no $ref in a schema)
            let constructor;

            try {
                constructor = this._findMatchedConstructor(schema);
            } catch (error) {
                throw new ParsingError(
                    `Error at finding matched constructor for ${modelNameInErrorMsg}`,
                    {
                        ...payloadPassedToError,
                        originalError: error
                    }
                );
            }

            try {
                result = constructor
                    ? [new constructor(
                        schema,
                        this,
                        context,
                        name,
                        suggestedName,
                        originalPathSchema,
                        ancestors
                    )]
                    : null;
            } catch (error) {
                throw new ParsingError(
                    `Error at creating descriptor for ${modelNameInErrorMsg} with class ${
                        constructor ? constructor.name : constructor
                    }`,
                    {
                        ...payloadPassedToError,
                        originalError: error,
                    }
                );
            }
        }

        this._holdSchemaOf(schema, result);

        return result;
    }

    /**
     * Поиск конструктора для дескриптора типа данных,
     * условиям которого, удовлетворяет данная схема.
     *
     * @param schema
     */
    protected _findMatchedConstructor(schema: Schema): any {
        const foundConstructor = _.find<any>(
            rules,
            (ruleSchema: DescriptorRuleSchema) => {
                if (_.isFunction(ruleSchema.rule)) {
                    return (ruleSchema.rule as DescriptorRuleFn)(schema);
                } else {
                    if (!ruleSchema._schemaComplied) {
                        ruleSchema._schemaComplied = this._ajv.compile(
                            ruleSchema.rule as SchemaObject
                        );
                    }

                    return ruleSchema._schemaComplied(schema);
                }
            }
        ) as DescriptorRuleSchema;

        return foundConstructor
            ? foundConstructor.classConstructor
            : null;
    }

    protected _holdSchemaBeforeConvert(schema: Schema): SchemaHold | null {
        const alreadyOn = _.find(this._onHoldSchemas, (v: SchemaHold) =>
            v.schema === schema
        );

        if (!alreadyOn) {
            this._onHoldSchemas.push({
                bulk: {},
                schema
            });
        }

        return alreadyOn;
    }

    protected _holdSchemaOf(schema: Schema, descr: DataTypeDescriptor): void {
        const index = _.findIndex(this._onHoldSchemas, (v: SchemaHold) =>
            v.schema === schema
        );

        if (index !== -1) {
            const record = this._onHoldSchemas[index];

            if (descr) {
                _.assign(
                    this._onHoldSchemas[index].bulk,
                    descr
                );
            }

            this._onHoldSchemas.splice(index, 1);
        }
    }
}
