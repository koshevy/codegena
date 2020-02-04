import * as _ from 'lodash';
import axios, {
    AxiosInstance,
    AxiosRequestConfig
} from 'axios';

import { defaultAxiosConfig } from '../configs'

// *** export classes and interfaces

export class MissedNecessaryPathParamError extends Error {}
export class NoBaseUrlRedefineMatchesError extends Error {}

/**
 * Subset of {@link AxiosRequestConfig} with only properties that cant rewrite
 * auto-properties have to be sent with auto-generated "wrappers".
 */
export type AxiosSafeRequestConfig = {
    [P in  | 'adapter'
           | 'auth'
           | 'cancelToken'
           | 'headers'
           | 'httpAgent'
           | 'httpsAgent'
           | 'maxContentLength'
           | 'maxRedirects'
           | 'onDownloadProgress'
           | 'onUploadProgress'
           | 'paramsSerializer'
           | 'proxy'
           | 'socketPath'
           | 'timeout'
           | 'timeoutErrorMessage'
           | 'transformRequest'
           | 'transformResponse'
           | 'withCredentials'
           | 'xsrfCookieName'
           | 'xsrfHeaderName'
    ]?: AxiosRequestConfig[P];
};

// *** own variables

const axiosInstances = new WeakMap();

// *** export functions

/**
 * Mapping parameters to path and return path and
 * redundant parameters that have to be used in query/headers.
 *
 * @param pathTemplate
 * @param parameters
 * @return
 * Relative path (URI) to method and object with unused parameters
 *
 * @throws MissedNecessaryPathParamError
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
                throw new MissedNecessaryPathParamError(
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

/**
 * Do caching of axios instance by config instance.
 * fixme make tests with default config
 *
 * @param config
 * @return
 */
export function getAxiosInstance(config: AxiosRequestConfig = defaultAxiosConfig): AxiosInstance {
    let instance;

    if (!axiosInstances.has(config)) {
        instance = axios.create(config);
        axiosInstances.set(config, instance);
    } else {
        instance = axiosInstances.get(config);
    }

    return instance;
}

/**
 * Rewrite (reassign) default config and update default axios instance.
 * After calling of this function, default axios instance will be renewed,
 * and all interceptors wil be broken.
 *
 * fixme make tests
 * @param config
 */
export function assignDefaultConfig(config: AxiosRequestConfig): void {
    _.assign(defaultAxiosConfig, config);
    axiosInstances.set(config, axios.create(defaultAxiosConfig));
}

/**
 * @param serverUrls
 * @param redefineBaseUrl
 * @return
 * Actual base url or `null` otherwise
 */
export function getBaseUrl(
    serverUrls: string[],
    redefineBaseUrl?: string | { [srcBaseUrl: string]: string }
): string | null {
    if ('string' === typeof redefineBaseUrl) {
        console.warn([
            `Had used a force redefining of base url by literally string value ${redefineBaseUrl}!\n`,
            `It's not a safe practice because you have no control of mapping server urls`,
            `to your custom urls.`,
            `Please, use mapping instead of string coercing!`
        ].join(' '));

        return redefineBaseUrl;
    }

    if (redefineBaseUrl && 'object' === typeof redefineBaseUrl) {
        // matches of server urls to redefines
        const intersectedUrls = _(redefineBaseUrl)
            .keys().intersection(serverUrls || []).value();

        if (!intersectedUrls || !intersectedUrls.length) {
            console.warn([
                'There are no matches of `redefineBaseUrl` to servers urls!',
                'Please, set `environment.redefineBaseUrl` to `null`, if you want',
                'to use default Axios baseURL option!'
            ].join(' '));

            throw new NoBaseUrlRedefineMatchesError();
        }

        // Get first of matched
        return redefineBaseUrl[intersectedUrls[0]];
    }

    return (serverUrls || []).length ? serverUrls[0] : null;
}

export function getGlobalEnvironment(): CodegenaAxiosWrapperEnvironment {
    return ('undefined' === typeof environment)
        ? {}
        : environment;
}
