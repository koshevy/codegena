import _ from 'lodash';
import * as jsonPointer from 'json-pointer';

import { HasResponses, HasContentType } from '@codegena/definitions/aspects';
import {
    Generic as SchemaGeneric,
    Schema,
    SchemaObject
} from '@codegena/definitions/json-schema';
import {
    Oas3MediaContent,
    Oas3Operation,
    Oas3Parameter,
    Oas3ParameterTarget,
    Oas3PathItem,
    Oas3Paths,
    Oas3Response,
    Oas3Specification,
} from '@codegena/definitions/oas3';

import { ConvertorConfig, defaultConfig } from './config';
import { ParsingError, ParsingProblems } from './parsing-problems';
import {
    ApiMetaInfo,
    DataTypeContainer,
    DataTypeDescriptor,
    DescriptorContext
} from './index';

const jsonPathRegex = /([\w:\/\\\.]+)?#(\/?[\w+\/?]+)/;

/**
 * @param pieces
 * @return
 * JSON-Path according to [RFC-6901](https://tools.ietf.org/html/rfc6901)
 * TODO refactor: move to common helper
 */
function makeJsonPath(...pieces: Array<string | number>): string {
    return jsonPointer.compile(pieces);
}

/**
 * Rethrow {@link ParsingError} if original error already handled at inner level
 * @param {ParsingError | any} error
 */
function rethrowParsingError(error: ParsingError | any): void {
    if (error instanceof ParsingError) {
        throw error;
    }
}

interface OperationMeta {
    operationJsonPath: string[];
    apiMeta: ApiMetaInfo;
}

/**
 * Базовый класс загрузчика.
 */
export abstract class BaseConvertor {

    protected _structure: Oas3Specification;
    protected _foreignSchemaFn: (resourcePath: string) => Schema;
    protected _operationsMeta: OperationMeta[];

    constructor(
        protected config: ConvertorConfig = defaultConfig
    ) {}

    public loadOAPI3Structure(structure: Oas3Specification) {
        if (!structure || !_.isObjectLike(structure)) {
            throw new ParsingError([
                `Expected structure to be object but got:`,
                JSON.stringify(structure, null, ' ')
            ].join('\n'));
        }

        this._operationsMeta = [];
        this._structure = structure;
    }

    public setForeignSchemeFn(fn: (jsonPath: string) => Schema): void {
        if (!_.isFunction(fn)) {
            throw new ParsingError('Error in `setForeignSchemeFn`: argument has to be function!');
        }

        this._foreignSchemaFn = (jsonPath) => {
            try {
                return fn(jsonPath);
            } catch (e) {
                throw new ParsingError(
                    'Error when trying to resolve schema!',
                    { jsonPath }
                );
            }
        };
    }

    public getApiMeta(): OperationMeta[] {
        return this._operationsMeta;
    }

    /**
     * Getting of "entry-points" from structure in {@link _structure} early
     * loaded by {@link loadOAPI3Structure}.
     *
     * Entrypoints are:
     *
     * - Parameters
     * - Requests
     * - Responses
     *
     * ### Why it needed?
     *
     * Entrypoints is needed to use [Convertor.renderRecursive]{@link Convertor.renderRecursive}.
     * It's like a pulling on thread where entrypoints are outstanding trheads.
     *
     * @param ApiMetaInfo metaInfo
     * Mutable object where meta-information accumulates during
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
                    // Excluding of elements having common `originalSchemaPath`
                    // and simultaneously already related with.
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

        const dataTypeContainer = _.flattenDepth<DataTypeDescriptor>(
            dataTypeContainers
        );

        return _.compact(dataTypeContainer);
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

    /**
     * @deprecated will be renamed to `getSchemaByRef`
     * @param ref
     * @param pathWhereReferred
     * @return
     */
    public getSchemaByPath(ref: string, pathWhereReferred?: string[]): Schema {
        const pathMatches = ref.match(jsonPathRegex);

        if (pathMatches) {
            const filePath = pathMatches[1];
            const schemaPath = pathMatches[2];
            const src = filePath
                ? this._getForeignSchema(filePath)
                : this._structure;

            const result = _.get(
                src,
                _.trim(schemaPath, '#/\\').replace(/[\\\/]/g, '.'),
                undefined
            );

            if (result === undefined) {
                ParsingProblems.parsingWarning(
                    `Cant resolve ${ref}!`,
                    {
                        oasStructure: this._structure,
                        relatedRef: ref,
                        jsonPath: pathWhereReferred
                            ? makeJsonPath(...pathWhereReferred)
                            : undefined
                    }
                );
            }

            return result;

        } else {
            throw new ParsingError(
                `JSON Path error: ${ref} is not valid JSON path!`,
                {
                    oasStructure: this._structure,
                    relatedRef: ref,
                    jsonPath: pathWhereReferred
                        ? makeJsonPath(...pathWhereReferred)
                        : undefined
                }
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
        const struct: Oas3Specification = this._structure;

        if (!struct) {
            throw new ParsingError([
                'There is no structure loaded!',
                'Please, call method `loadOAPI3Structure` before!'
            ].join(' '));
        }

        const result: {[className: string]: Schema} = {};
        const paths: Oas3Paths = struct.paths;

        if (!paths) {
            throw new ParsingError(
                'No paths presented in OAS structure!',
                { oasStructure: struct }
            );
        }

        for (const path in paths) {
            // skip proto's properties
            if (!paths.hasOwnProperty(path)) {
                continue;
            }

            const jsonPathToPath = ['paths', path];

            if (!path) {
                ParsingProblems.parsingWarning(
                    'Path key cant be empty. Skipped.',
                    {
                        oasStructure: struct,
                        jsonPath: makeJsonPath(...jsonPathToPath)
                    }
                );

                continue;
            }

            const pathItem: Oas3PathItem = struct.paths[path];

            if (!_.isObjectLike(pathItem)) {
                ParsingProblems.parsingWarning(
                    'Item of "paths" should be object like. Skipped.',
                    {
                        oasStructure: struct,
                        jsonPath: makeJsonPath(...jsonPathToPath)
                    }
                );

                continue;
            }

            const methods = [
                'delete',
                'get',
                'head',
                'options',
                'patch',
                'post',
                'put',
                'trace',
            ];

            for (const methodName of methods) {
                // skip proto's properties
                if (!pathItem.hasOwnProperty(methodName)) {
                    continue;
                }

                const apiOperation: Oas3Operation = pathItem[methodName];
                const jsonPathToOperation = [...jsonPathToPath, methodName];

                if (!_.isObjectLike(apiOperation)) {
                    ParsingProblems.parsingWarning(
                        'Operation should be object like. Skipped.',
                        {
                            oasStructure: struct,
                            jsonPath: makeJsonPath(...jsonPathToOperation)
                        }
                    );

                    continue;
                }

                const baseTypeName = this._getOperationBaseName(
                    apiOperation,
                    methodName,
                    path,
                    jsonPathToOperation
                );

                const servers = this._getOperationsServers(
                    apiOperation,
                    jsonPathToOperation
                );

                const metaInfoItem: ApiMetaInfo = {
                    apiSchemaFile: 'domain-api-schema',
                    baseTypeName,
                    headersSchema: null,
                    headersModelName: null,
                    method: methodName.toUpperCase() as any,
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
                    servers,
                    // default noname
                    typingsDependencies: [],
                    typingsDirectory: 'typings',
                };

                let jsonSubPathToOperation: string[];

                try{
                    jsonSubPathToOperation = [...jsonPathToOperation, 'parameters'];
                    // pick Parameters schema
                    _.assign(result,
                        this._pickApiMethodParameters(
                            metaInfoItem,
                            apiOperation.parameters,
                            jsonSubPathToOperation
                        )
                    );
                } catch(error) {
                    rethrowParsingError(error);

                    throw new ParsingError(
                        'An error occurred at method parameters fetching',
                        {
                            oasStructure: struct,
                            jsonPath: makeJsonPath(...jsonSubPathToOperation),
                            originalError: error
                        }
                    );
                }

                try {
                    jsonSubPathToOperation = [...jsonPathToOperation, 'responses'];
                    // pick Responses schema
                    _.assign(result,
                        this._pickApiMethodResponses(
                            metaInfoItem,
                            apiOperation.responses || {} as any,
                            jsonSubPathToOperation
                        )
                    );
                } catch(error) {
                    rethrowParsingError(error);

                    throw new ParsingError(
                        'An error occurred at method responses fetching',
                        {
                            oasStructure: struct,
                            jsonPath: makeJsonPath(...jsonSubPathToOperation),
                            originalError: error
                        }
                    );
                }

                try {
                    jsonSubPathToOperation = [...jsonPathToOperation, 'requestBody'];
                    // pick Request Body schema
                    _.assign(result,
                        this._pickApiMethodRequest(
                            apiOperation,
                            metaInfoItem,
                            [...jsonSubPathToOperation]
                        )
                    );
                } catch(error) {
                    rethrowParsingError(error);

                    throw new ParsingError(
                        'An error occurred at method request body fetching',
                        {
                            oasStructure: struct,
                            jsonPath: makeJsonPath(...jsonSubPathToOperation),
                            originalError: error
                        }
                    );
                }

                metaInfo.push(metaInfoItem);
                this._operationsMeta.push({
                    operationJsonPath: jsonPathToOperation,
                    apiMeta: metaInfoItem,
                });
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
        parameters: Oas3Parameter[],
        jsonPathToOperation: string[]
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
        _.each(parameters || [], (parameter: Oas3Parameter, index) => {
            if (parameter.$ref) {
                parameter = _.merge(
                    _.omit<Oas3Parameter>(parameter, ['$ref']),
                    this.getSchemaByPath(
                        parameter.$ref,
                        [...jsonPathToOperation, String(index)]
                    )
                ) as Oas3Parameter;
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

                if (parameter.in === Oas3ParameterTarget.Query) {
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
        responses: HasResponses<Oas3Response>,
        jsonPathToOperation: string[]
    ): {[key: string]: Schema} {

        const result = {};

        _.each(responses, (
            response: Oas3Response,
            code: string | number
        ) => {

            // todo do tests when $ref to schema.responses
            if (response.$ref) {
                response = _.merge(
                    _.omit<Oas3Response>(response, ['$ref']),
                    this.getSchemaByPath(
                        response.$ref,
                        [...jsonPathToOperation, String(code)]
                    )
                ) as Oas3Response;
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
                mediaContent: Oas3MediaContent,
                contentTypeKey: string
            ) => {
                // todo do fallback if no `schema property`
                const schema = _.get(mediaContent, 'schema')
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
                _.mapValues(metaInfoItem.responseSchema, subSchema =>
                    new SchemaGeneric(subSchema),
                ),
            );
        }

        return result;
    }

    protected _pickApiMethodRequest(
        apiOperation: Oas3Operation,
        metaInfoItem: ApiMetaInfo,
        jsonPathToOperation: string[]
    ): {
        [modelName: string]: SchemaGeneric
    } | null {

        const { requestBody } = apiOperation;
        let responses: HasContentType<Schema> | null;

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
                .mapValues((mediaContent: Oas3MediaContent, mediaTypeName) => {
                    const mapResult = mediaContent.schema ? {...mediaContent.schema} : null;
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

    protected _getForeignSchema(ref: string): Schema {
        if (this._foreignSchemaFn) {
            return this._foreignSchemaFn(ref);
        } else {
            throw new ParsingError(
                [
                    'Function for getting foreign scheme not set.',
                    `Use setForeignSchemeFn(). Path: ${ref}.`
                ].join('\n'),
                {
                    oasStructure: this._structure,
                    relatedRef: ref
                }
            );
        }
    }

    private _getOperationBaseName(
        apiOperation: Oas3Operation,
        methodName: string,
        path: string,
        jsonPathToOperation: string[]
    ): string {
        if (!apiOperation.operationId || !_.isString(apiOperation.operationId)) {
            const baseNameFallback = _.upperFirst(_.camelCase(
                jsonPathToOperation.join('-').replace(/[^\-\w]/g, '')
            ));

            ParsingProblems.parsingWarning(
                [
                    `Wrong operation id "${apiOperation.operationId}".`,
                    `Fallback basename is: "${baseNameFallback}".`
                ].join('\n'),
                {
                    oasStructure: this._structure,
                    jsonPath: makeJsonPath(...jsonPathToOperation, 'operationId')
                }
            );

            return baseNameFallback;
        }

        const operationId = _.camelCase(
            apiOperation.operationId.trim().replace(/[^\w+]/g, '_')
        );

        return _.upperFirst(operationId) || [
            _.capitalize(methodName),
            _.upperFirst(_.camelCase(path))
        ].join('');
    }

    private _getOperationsServers(
        apiOperation: Oas3Operation,
        jsonPathToOperation: string[]
    ): string[] {
        let servers = apiOperation.servers || this._structure.servers;

        if (servers !== undefined && !_.isArray(servers)) {
            ParsingProblems.parsingWarning('Servers should be array. Skipped.', {
                oasStructure: this._structure,
                jsonPath: makeJsonPath(...jsonPathToOperation, 'servers')
            });

            servers = [];
        }

        if (!servers || servers.length < 1) {
            servers = defaultConfig.defaultServerInfo;
        }

        return _.map(servers, (server, index) => {
            if (!server.url || !_.isString(server.url)) {
                throw new ParsingError('Server object should have url (string)', {
                    oasStructure: this._structure,
                    jsonPath: makeJsonPath(...jsonPathToOperation, 'servers', index, 'url')
                })
            }

            return server.url
        });
    }
}
