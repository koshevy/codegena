import _ from 'lodash';
import Ajv from 'ajv';

import {
    BaseConvertor,
    ConvertorConfig,
    DataTypeContainer,
    DataTypeDescriptor,
    DescriptorContext,
    Schema,
    defaultConfig, SchemaObject
} from '../../core';

// rules that helps determine a type of descriptor
import {
    DescriptorRule,
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
    bulk: object;
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

            /**
             * Рендеринг очередного типа из очереди
             */
            const renderResult = descr.render(
                childrenDependencies,
                true
            );

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
        if (holdSchema) {
            return holdSchema.bulk as any;
        }

        let result;

        // получение по $ref
        if (schema.$ref) {

            // Here convertor has to decide: whether a schema with a $ref
            // equals with parent (pointed in the $ref) and, therefore,
            // should be replaced by parent, or not and should get a new model.

            // исключаются элементы, которые не оказывают
            // влияния на определение типа (title, nullable и т.д.)
            const valuableOptionsCount = _.values(
                _.omit(schema, defaultConfig.excludeFromComparison),
            ).length;

            if (valuableOptionsCount === 1) {
                result = (name && !this.config.implicitTypesRefReplacement)
                    // если неанонимный, то создает новый на основе предка
                    ? this.convert(
                        this.getSchemaByPath(schema.$ref),
                        context,
                        name,
                        suggestedName,
                        originalPathSchema,
                        this.findTypeByPath(schema.$ref, context)
                    )
                    // если это анонимный тип, он просто ссылается
                    // на другой существующий
                    : this.findTypeByPath(schema.$ref, context);
            } else {
                const refSchema = this.getSchemaByPath(schema.$ref);

                if (!refSchema) {
                    throw new Error(`$ref is not found: ${schema.$ref}`);
                }

                result = this.convert(
                    _.merge(refSchema, _.omit(schema, ['$ref'])),
                    context,
                    name,
                    suggestedName,
                    originalPathSchema,
                    this.findTypeByPath(schema.$ref, context)
                );
            }
        } else {
            // основной сценарий

            const constructor = this._findMatchedConstructor(schema);

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
