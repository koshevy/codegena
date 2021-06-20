/* tslint:disable triple-equals */
import _ from 'lodash';
import { Oas3Server } from '@codegena/definitions/oas3';
import { DataTypeDescriptor } from './data-type-descriptor';

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
    parametersModelName: (baseTypeName) => string;
    headersModelName: (baseTypeName, code, contentType?) => string;
    requestModelName: (baseTypeName, contentType?) => string;
    responseModelName: (baseTypeName, code, contentType?) => string;
    typingsDirectory: string;
    mocksDirectory: string;
    excludeFromComparison: string[];
    defaultServerInfo: Oas3Server[];
}

export const defaultConfig: ConvertorConfig = {
    jsonPathRegex: /([\w:\/\\\.]+)?#(\/?[\w+\/?]+)/,
    implicitTypesRefReplacement: false,
    parametersModelName: (baseTypeName) => `${baseTypeName}Parameters`,
    headersModelName: (baseTypeName, code) =>
        `${baseTypeName}HeadersResponse${code}`,
    requestModelName: (baseTypeName) =>
        `${baseTypeName}Request`,
    responseModelName: (baseTypeName, code, contentTypeKey = null) =>
        `${baseTypeName}${_.capitalize(contentTypeKey)}Response${code}`,
    typingsDirectory: './typings',
    mocksDirectory: './mocks',
    excludeFromComparison: [
        'description',
        'title',
        'example',
        'default',
        'readonly',
    ],
    defaultServerInfo: [
        {
            url: 'http://localhost'
        }
    ]
};
