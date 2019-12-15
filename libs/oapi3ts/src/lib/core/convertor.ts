import _ from 'lodash';

import {
    ApiMetaInfo,
    DataTypeContainer,
    DataTypeDescriptor,
    DescriptorContext
} from './index';

import {
    ConvertorConfig,
    defaultConfig
} from './config';

import {
    SchemaGeneric,
    Schema,
    SchemaObject
} from './schema';

import {
    OApiMediaType,
    OApiMediaTypes,
    OApiOperation,
    OApiParameter,
    OApiParameterIn,
    OApiPathItem,
    OApiPathItemMethods,
    OApiPaths,
    OApiRequest,
    OApiResponse,
    OApiResponsesSet,
    OApiStructure
} from './oapi-structure';


type ApiMethod = | 'CONNECT'
                 | 'DELETE'
                 | 'GET'
                 | 'HEAD'
                 | 'OPTIONS'
                 | 'PATCH'
                 | 'POST'
                 | 'PUT'
                 | 'TRACE';

/**
 * Регулярное выражение для JSON Path-путей.
 * todo вынести в конфиг. если конфига нет — учредить
 */
const pathRegex = /([\w:\/\\\.]+)?#(\/?[\w+\/?]+)/;

/**
 * Базовый класс загрузчика.
 */
export abstract class BaseConvertor {

    protected _structure: OApiStructure;
    protected _foreignSchemaFn: (resourcePath: string) => Schema;

    constructor(
        /**
         * Конфигурация для конвертора.
         */
        protected config: ConvertorConfig = defaultConfig
    ) {}

    /**
     * Загрузка структуры OpenAPI3-документа в конвертор.
     * @param structure
     */
    public loadOAPI3Structure(structure: OApiStructure) {
        this._structure = structure;
    }

    /**
     * Метод для установки функции, с помощью которой происходит обращение
     * к сторонней схеме (которая находится в другом файле).
     * @param fn
     */
    public setForeignSchemeFn(fn: (resourcePath: string) => Schema): void {
        this._foreignSchemaFn = fn;
    }

    /**
     * Получение "входных точек" OpenAPI3-структуры:
     *
     * - Модели параметров API-методов
     * - Модели тел запросов API-методов
     * - Модели ответов API-методов
     *
     * С этих входных точек может быть начата "раскрутка" цепочки
     * зависимостей для рендеринга с помощью метода
     * [Convertor.renderRecursive]{@link Convertor.renderRecursive}.
     *
     * @param ApiMetaInfo metaInfo
     * Place where meta-information accumulates during
     * API-info extracting.
     */
    public getOAPI3EntryPoints(
        context = {},
        metaInfo: ApiMetaInfo[] = []
    ): DataTypeContainer {
        const alreadyConverted = [];
        // parameters
        const methodsSchemes = this.getMethodsSchemes(metaInfo);
        const dataTypeContainers: DataTypeContainer[] = _.map(
            methodsSchemes,
            (schema, modelName) => {
                const container = this.convert(
                    schema,
                    context,
                    modelName
                );

                // TODO Crutch. This class should never know about assignedTypes
                // in GenericDescriptor
                if (schema instanceof SchemaGeneric) {
                    _.each(container, (description: DataTypeDescriptor) => {
                        if (description['assignedTypes']) {
                            description['assignedTypes'] = ['TCode', 'TContentType', 'T1', 'T2'];
                        }
                    });
                }

                // Исключение дубликатов.
                // Дубликаты появляются, когда типы данные, которые
                // ссылаются ($ref) без изменения на другие, подменяются
                // моделями из `schema`.
                return _.map(container, (descr: DataTypeDescriptor) => {
                    // исключение элементов, которые имеют общий
                    // originalSchemaPath c элементами, на которые они сослались
                    if (descr.originalSchemaPath) {

                        if (_.findIndex(
                            alreadyConverted,
                            v => v === descr.originalSchemaPath
                        ) !== -1) {
                            return null;
                        }

                        alreadyConverted.push(
                            descr.originalSchemaPath
                        );
                    }

                    return descr;
                });
            }
        );

        return _.compact(_.flattenDepth<DataTypeDescriptor>(
            dataTypeContainers
        ));
    }

    /**
     * Получить дескриптор типа по JSON Path:
     * возвращает уже созданный ранее, или создает
     * новый при первом упоминании.
     *
     * @param path
     * @param context
     */
    public findTypeByPath(
        path: string,
        context: DescriptorContext
    ): DataTypeContainer {

        const alreadyFound = _.find(
            _.values(context),
            (v: DataTypeDescriptor) =>
                v.originalSchemaPath === path
        );

        return alreadyFound
            ? [alreadyFound]
            : this._processSchema(path, context);
    }

    public getSchemaByPath(path: string): Schema {
        const pathMatches = path.match(pathRegex);

        if (pathMatches) {
            const filePath = pathMatches[1];
            const schemaPath = pathMatches[2];
            const src = filePath
                ? this._getForeignSchema(filePath)
                : this._structure;

            const result = _.get(
                src,
                _.trim(schemaPath, '#/\\').replace(/[\\\/]/g, '.')
            );

            return result;

        } else {
            throw new Error(
                `JSON Path error: ${path} is not valid JSON path!`
            );
        }
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
     * @param originalSchemaPath
     * Путь, по которому была взята схема
     * @param ancestors
     * Родительсткие модели
     *
     */
    public abstract convert(
        schema: Schema | SchemaGeneric,
        context: DescriptorContext,
        name?: string,
        suggestedName?: string,
        originalSchemaPath?: string,
        ancestors?: DataTypeDescriptor[]
    ): DataTypeContainer;

    /**
     * Извлечени схем из параметров, ответов и тел запросов для API.
     * @param metaInfo
     * Place for storing meta-info of API-method.
     */
    public getMethodsSchemes(
        metaInfo: ApiMetaInfo[]
    ): {[className: string]: Schema} {
        const struct: OApiStructure = this._structure;
        const result: {[className: string]: Schema} = {};
        const paths: OApiPaths = struct.paths || {};

        for (const path in paths) {

            if (!paths.hasOwnProperty(path)) {
                continue;
            }

            const pathItem: OApiPathItem = struct.paths[path] || {};

            for (const methodName in OApiPathItemMethods) {

                if (!pathItem.hasOwnProperty(methodName)) {
                    continue;
                }

                const apiOperation: OApiOperation = pathItem[methodName];
                const baseTypeName = this._getOperationBaseName(
                    apiOperation,
                    methodName as OApiPathItemMethods,
                    path
                );

                const metaInfoItem: ApiMetaInfo = {
                    apiSchemaFile: 'domain-api-schema',
                    baseTypeName,
                    headersSchema: null,
                    headersModelName: null,
                    method: methodName.toUpperCase() as ApiMethod,
                    mockData: {},
                    paramsModelName: null,
                    paramsSchema: null,
                    path,
                    queryParams: [],
                    requestIsRequired: false,
                    requestModelName: null,
                    requestSchema: null,
                    responseModelName: null,
                    responseSchema: null,
                    servers: this._getOperationsServers(apiOperation),
                    // default noname
                    typingsDependencies: [],
                    typingsDirectory: 'typings',
                };

                // pick Parameters schema
                _.assign(result,
                    this._pickApiMethodParameters(
                        metaInfoItem,
                        apiOperation.parameters
                    )
                );

                // pick Responses schema
                _.assign(result,
                    this._pickApiMethodResponses(
                        metaInfoItem,
                        apiOperation.responses || {} as any
                    )
                );

                // pick Request Body schema
                _.assign(result,
                    this._pickApiMethodRequest(
                        apiOperation,
                        metaInfoItem
                    )
                );

                metaInfo.push(metaInfoItem);
            }
        }

        return result;
    }

    /**
     * Get parameters from the `parameters` section
     * in method into {@link ApiMetaInfo}-object
     */
    protected _pickApiMethodParameters(
        metaInfoItem: ApiMetaInfo,
        parameters: OApiParameter[]
    ): {[key: string]: Schema} {

        const result: {[key: string]: Schema} = {};

        const paramsModelName = this.config.parametersModelName(
            metaInfoItem.baseTypeName
        );

        const paramsSchema: SchemaObject = {
            properties: {},
            required: [],
            type: 'object'
        };

        // process parameters
        _.each(parameters || [], (parameter: OApiParameter, index) => {
            if (parameter.$ref) {
                parameter = _.merge(
                    _.omit<OApiParameter>(parameter, ['$ref']),
                    this.getSchemaByPath(parameter.$ref)
                ) as OApiParameter;
            }

            if (parameter.schema) {
                paramsSchema.properties[parameter.name] = parameter.schema;

                if (parameter.description) {
                    parameter.schema.description = parameter.description;
                }

                if (parameter.readOnly) {
                    paramsSchema.properties[parameter.name].readOnly = true;
                }

                if (parameter.required) {
                    paramsSchema.required.push(parameter.name);
                }

                if (Number(index) === 0) {
                    // metaInfoItem.typingsDependencies.push(paramsModelName);
                    metaInfoItem.paramsModelName = paramsModelName;
                    metaInfoItem.paramsSchema = paramsSchema;
                }

                if (parameter.in === OApiParameterIn.Query) {
                    metaInfoItem.queryParams.push(parameter.name);
                }

                if (!paramsSchema.description) {
                    paramsSchema.description =
                        `Model of parameters for API \`${metaInfoItem.path}\``;
                }

                result[paramsModelName] = paramsSchema;
            }
        });

        if (result[paramsModelName]) {
            metaInfoItem.typingsDependencies.push(paramsModelName);
        }

        return result;
    }

    protected _pickApiMethodResponses(
        metaInfoItem: ApiMetaInfo,
        responses: OApiResponsesSet
    ): {[key: string]: Schema} {

        const result = {};

        _.each(responses, (
            response: OApiResponse,
            code: string | number
        ) => {

            // FIXME do tests when $ref to schema.responses
            if (response.$ref) {
                response = _.merge(
                    _.omit<OApiResponse>(response, ['$ref']),
                    this.getSchemaByPath(response.$ref)
                ) as OApiResponse;
            }

            const mediaTypes = response.content
                    || response.schema  // Case for OAS2
                    || {};              // Fallback

            // if content set, but empty
            if (_.keys(mediaTypes).length === 0) {
                mediaTypes['application/json'] = null;
            }

            // todo пока обрабатываются только контент и заголовки
            _.each(mediaTypes || {}, (
                mediaType: OApiMediaType,
                contentTypeKey: string
            ) => {
                // FIXME do fallback if no `schema property`
                const schema = _.get(mediaType, 'schema')
                    || {
                        description: 'Empty response',
                        type: 'null',
                    };   // by default

                if (!metaInfoItem.responseSchema) {
                    metaInfoItem.responseSchema = {};
                }

                // add description if it's set
                if (response.description) {
                    schema.description = response.description;
                }

                _.set(
                    metaInfoItem.responseSchema,
                    [code, contentTypeKey],
                    schema
                );
            });

            if (response.headers) {
                // TODO has to be tested
                const modelName = this.config.headersModelName(
                    metaInfoItem.baseTypeName,
                    code
                );

                result[modelName] = {
                    properties: response.headers,
                    type: 'object'
                };
            }
        });

        if (metaInfoItem.responseSchema) {
            const modelName = this.config.responseModelName(
                metaInfoItem.baseTypeName,
                '',
                ''
            );

            metaInfoItem.responseModelName = modelName;
            metaInfoItem.typingsDependencies.push(modelName);

            result[modelName] = new SchemaGeneric(
                _.mapValues(metaInfoItem.responseSchema, (subSchema, code) =>
                    new SchemaGeneric(subSchema)
                )
            );
        }

        return result;
    }

    protected _pickApiMethodRequest(
        apiOperation: OApiOperation,
        metaInfoItem: ApiMetaInfo
    ): {
        [modelName: string]: SchemaGeneric
    } | null {

        const { requestBody } = apiOperation;
        let responses: { [mediaType in keyof OApiMediaTypes]?: any } | null;

        if (!requestBody) {
            return null;
        } else {
            metaInfoItem.requestIsRequired = !!requestBody.required;

            if (!requestBody.content) {
                return null;
            }

            const modelName = this.config.requestModelName(
                metaInfoItem.baseTypeName
            );

            responses = _(requestBody.content)
                .mapValues((mediaType: OApiMediaType, mediaTypeName) => {
                    const mapResult = mediaType.schema ? {...mediaType.schema} : null;
                    if (apiOperation.requestBody.description && !mapResult.description) {
                        mapResult.description = apiOperation.requestBody.description;
                    }

                    return mapResult;
                })
                .value();

            metaInfoItem.requestModelName = modelName;
            metaInfoItem.requestSchema = responses;
            metaInfoItem.typingsDependencies.push(modelName);

            return _.zipObject([modelName], [new SchemaGeneric(responses)]);
        }
    }

    /**
     * Получение нового дескриптора на основе JSON Path
     * из текущей структуры.
     *
     * @param path
     * @param context
     */
    protected _processSchema(
        path: string,
        context: DescriptorContext
    ): DataTypeContainer {

        const schema = this.getSchemaByPath(path);
        const modelName = (_.trim(path, '/\\').match(/(\w+)$/) || [])[1];

        if (!schema) {
            throw new Error(
                `Error: can't find schema with path: ${path}!`
            );
        }

        const results = this.convert(
            schema,
            context,
            modelName,
            null,
            path
        );

        _.each(results, (result: DataTypeDescriptor) => {
            context[result.originalSchemaPath || result.modelName] = result;
        });

        return results;
    }

    /**
     * Получение сторонней схемы.
     * @param resourcePath
     * URL или путь до файла, содержащего стороннюю схему.
     */
    protected _getForeignSchema(resourcePath: string): Schema {
        if (this._foreignSchemaFn) {
            return this._foreignSchemaFn(resourcePath);
        } else {
            throw new Error(`
                Function for getting foreign scheme not set.
                Use setForeignSchemeFn(). Path: ${resourcePath}.
            `);
        }
    }

    private _getOperationBaseName(
        apiOperation: OApiOperation,
        methodName: OApiPathItemMethods,
        path: string
    ): string {
        const operationId = _.camelCase(
            apiOperation.operationId.trim().replace(/[^\w+]/g, '_')
        );

        return _.upperFirst(operationId) || [
            _.capitalize(methodName),
            _.upperFirst(_.camelCase(path))
        ].join('');
    }

    private _getOperationsServers(apiOperation: OApiOperation): string[] {
        let servers = apiOperation.servers || this._structure.servers;
        if (!servers || servers.length < 1) {
            servers = defaultConfig.defaultServerInfo;
        }

        return _.map(servers, server => server.url);
    }
}
