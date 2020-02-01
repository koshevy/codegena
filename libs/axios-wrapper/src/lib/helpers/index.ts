import Ajv from 'ajv';
import * as _ from 'lodash';
import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosStatic
} from 'axios';

// *** own variables

const axiosInstances = new WeakMap();

// *** export classes

export class NoNecessaryPathParam extends Error {}

// *** export functions

export async function validate(): Promise<boolean | null> {
    return null;
}

/**
 * Mapping parameters to path and return path and
 * redundant parameters that have to be used in query/headers.
 *
 * @param {string} pathTemplate
 * @param {{[p: string]: any}} parameters
 * @return {string}
 * @throws NoNecessaryPathParam
 */
export function createUrl(
    pathTemplate: string,
    parameters: {[key:string]: any} = {}
): {
    path: string,
    /**
     * Parameters should be used in a query/headers
     */
    unusedParameters: {[key:string]: any}
} {
    const usedParams: string[] = [];
    const path = pathTemplate.replace(
        /\{([\w\-]+)\}/g,
        (substr, paramName) => {
            usedParams.push(paramName);
            if (parameters[paramName] === undefined) {
                throw new NoNecessaryPathParam(
                    `Url "${pathTemplate}" should use parameter "${paramName}. But got: "${
                        JSON.stringify(parameters)
                    }"`
                );
            }

            return parameters[paramName];
        }
    );

    return {
        path,
        unusedParameters: _.omit(parameters, usedParams)
    };
}

export function getAxiosInstance(config: AxiosRequestConfig): AxiosInstance {
    let instance;

    if (!axiosInstances.has(config)) {
        instance = axios.create(config);
        axiosInstances.set(config, instance);
    } else {
        instance = axiosInstances.get(config);
    }

    return instance;
}
