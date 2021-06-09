/* tslint:disable triple-equals */
import _ from 'lodash';
import { Oas3Server } from '@codegena/definitions/oas3';
import { DataTypeDescriptor } from './data-type-descriptor';

/**
 * Интерфейс конфигурации для ковертора.
 */
export interface ConvertorConfig {

    /**
     * Regex which is using for extract JSON Path parts.
     */
    jsonPathRegex: RegExp;

    /**
     * Mode when models that refer to any models via `$ref`
     * replacing implicitly even firsts have names.
     *
     * For example, in this case:
     * ```yml
     * schema:
     *   schema:
     *      FistModel:
     *          $ref: SecondModel
     *      SecondModel:
     *          type: object
     *          properties:
     *              exampleProperty:
     *                  type: string
     * ```
     *
     * `FirstModel` will be replaced by `SecondModel` in every
     * place when `implicitTypesRefReplacement=true` but otherwise
     * `SecondModel` will be rendered as interface such extends `FistModel`.
     *
     */
    implicitTypesRefReplacement: boolean;

    /**
     * Function that create Parameters Model name.
     * Headers Model is a implicit model that based on
     * Open API description of request body for API method.
     *
     * @param baseTypeName
     * @param code
     * @param contentType
     * fixme contentType is not using now
     */
    parametersModelName: (baseTypeName) => string;

    /**
     * Function that create Headers Model name.
     * Headers Model is a implicit model that based on
     * Open API description of headers for method.
     *
     * @param baseTypeName
     * @param code
     * @param contentType
     * fixme contentType is not using now
     */
    headersModelName: (baseTypeName, code, contentType?) => string;

    /**
     * Function that create Request Model name.
     * Headers Model is a implicit model that based on
     * Open API description of request body for API method.
     *
     * @param baseTypeName
     * @param code
     * @param contentType
     * fixme contentType is not using now
     */
    requestModelName: (baseTypeName, contentType?) => string;

    /**
     * Function that create Response Model name.
     * Headers Model is a implicit model that based on
     * Open API description of parameters for API method.
     *
     * @param baseTypeName
     * @param contentType
     * @param code
     * fixme contentType is not using now
     */
    responseModelName: (baseTypeName, code, contentType?) => string;

    /**
     * Name of directory with extracted models and types.
     */
    typingsDirectory: string;

    /**
     * Name of directory with extracted mocks
     */
    mocksDirectory: string;

    /**
     * Properties that should be excluded from
     * comparison of two schema ({@link DataTypeDescriptor})
     */
    excludeFromComparison: string[];

    /**
     * Default server info, when server info is not set in root document
     * and in operation object.
     */
    defaultServerInfo: Oas3Server[];
}

/**
 * Настройки конфига по-умолчанию.
 */
export const defaultConfig: ConvertorConfig = {

    /**
     * Regex which is using for extract JSON Path parts.
     */
    jsonPathRegex: /([\w:\/\\\.]+)?#(\/?[\w+\/?]+)/,

    /**
     * Mode when models that refer to any models via `$ref`
     * are replacing implicitly even if firsts have names.
     *
     * For example, in this case:
     * ```yml
     * schema:
     *   schema:
     *      FistModel:
     *          $ref: SecondModel
     *      SecondModel:
     *          type: object
     *          properties:
     *              exampleProperty:
     *                  type: string
     * ```
     *
     * `FirstModel` will be replaced by `SecondModel` in every
     * place when `implicitTypesRefReplacement=true` but otherwise
     * `SecondModel` will be rendered as interface such extends `FistModel`.
     *
     */
    implicitTypesRefReplacement: false,

    /**
     * Function that create Parameters Model name.
     * Headers Model is a implicit model that based on
     * Open API description of request body for API method.
     *
     * @param baseTypeName
     * @param code
     * @param contentType
     * fixme contentType не используется
     */
    parametersModelName: (baseTypeName) => `${baseTypeName}Parameters`,

    /**
     * Function that create Headers Model name.
     * Headers Model is a implicit model that based on
     * Open API description of headers for method.
     *
     * @param baseTypeName
     * @param code
     * @param contentType
     * fixme contentType is not using now
     */
    headersModelName: (baseTypeName, code, contentType = null) =>
        `${baseTypeName}HeadersResponse${code}`,

    /**
     * Function that create Request Model name.
     * Headers Model is a implicit model that based on
     * Open API description of request body for API method.
     *
     * @param baseTypeName
     * @param code
     * @param contentType
     * fixme contentType is not using now
     */
    requestModelName: (baseTypeName, contentType = null) =>
        `${baseTypeName}Request`,

    /**
     * Function that create Response Model name.
     * Headers Model is a implicit model that based on
     * Open API description of parameters for API method.
     *
     * @param baseTypeName
     * @param contentType
     * @param code
     * fixme contentType is not using now
     */
    responseModelName: (baseTypeName, code, contentTypeKey = null) =>
        `${baseTypeName}${_.capitalize(contentTypeKey)}Response${code}`,

    /**
     * Name of directory with extracted models and types.
     */
    typingsDirectory: './typings',

    /**
     * Name of directory with extracted mocks
     */
    mocksDirectory: './mocks',

    /**
     * Properties that should be excluded from
     * comparison of two schema ({@link DataTypeDescriptor})
     */
    excludeFromComparison: [
        'description',
        'title',
        'example',
        'default',
        'readonly',
        'nullable'
    ],

    /**
     * Default server info, when server info is not set in root document
     * and in operation object.
     */
    defaultServerInfo: [
        {
            url: 'http://localhost'
        }
    ]
};
