import Ajv from 'ajv';
import * as _ from 'lodash';

export class NoNecessaryPathParam extends Error {}

export async function validate(): Promise<boolean | null> {
    return null;
}

/**
 *
 * @param {string} urlTemplate
 * @param {{[p: string]: any}} parameters
 * @return {string}
 * @throws NoNecessaryPathParam
 */
export function createUrl(
    urlTemplate: string,
    parameters: {[key:string]: any} = {}
): {
    url: string,
    unusedParameters: {[key:string]: any}
} {
    const usedParams: string[] = [];
    const url = urlTemplate.replace(
        /\{([\w\-]+)\}/g,
        (substr, paramName) => {
            usedParams.push(paramName);
            if (parameters[paramName] === undefined) {
                throw new NoNecessaryPathParam(
                    `Url "${urlTemplate}" should use parameter "${paramName}. But got: "${
                        JSON.stringify(parameters)
                    }"`
                );
            }

            return parameters[paramName];
        }
    );

    return {
        url,
        unusedParameters: _.omit(parameters, usedParams)
    };
}
