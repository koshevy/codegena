import {
    findKey,
    isEmpty,
    isEqual,
    template,
    transform,
    trim,
} from 'lodash';
import { Oas3Server, Oas3ServerVariable } from '@codegena/definitions/oas3';

const interpolate = /{([\s\S]+?)}/g;

export function createUrl({
    pathTemplate, pathParams, servers, serverParams, environment,
}:{
    pathTemplate: string,
    pathParams?: Record<string, string>,
    servers: Oas3Server[],
    serverParams?: Record<string, string>,
    environment?: string,
}): string {
    const uriTemplate = template(pathTemplate, {interpolate});
    const baseUrl = getAppropriateServerPath(
        servers,
        serverParams || {},
        environment,
    );
    const uri = uriTemplate(pathParams || {});

    return new URL(trim(uri, '/'), baseUrl).href;
}

function getAppropriateServerPath(
    servers: Oas3Server[],
    passedParams: Record<string, string>,
    environment?: string,
): string {
    if (!servers?.length) {
        throw new Error('No servers found!');
    }

    const narrowingServers = environment
        ? servers.filter(server => server.environment === environment)
        : servers;

    const appropriateServer = narrowingServers.find(server => {
        const serverVariables = server?.variables || {};
        const requiredParamKeys = Object.keys(serverVariables);
        const defaultParams = getDefaultVarsValues(serverVariables);
        const summaryParams = {...defaultParams, ...passedParams};
        const paramKeys = Object.keys(summaryParams);

        if (!isEqual(paramKeys, requiredParamKeys)) {
            return false;
        }

        const hasInappropriateEnum = findKey(
            serverVariables,
            (variable, key) => {
                if (typeof summaryParams[key] !== 'string') {
                    return true;
                }

                if (!variable.enum) {
                    return false;
                }

                const value = summaryParams[key];

                if (variable.default === value) {
                    return false;
                }

                return !variable?.enum.includes(value);
            },
        );

        return !hasInappropriateEnum;
    });

    if (!appropriateServer) {
        throw new Error(
            'No one server from `servers` is appropriate to passed params!',
        );
    }

    const { url, variables } = appropriateServer;

    if (isEmpty(variables)) {
        return url;
    }

    const urlTemplate = template(url, {interpolate});

    return urlTemplate({
        ...getDefaultVarsValues(variables),
        ...passedParams,
    });
}

function getDefaultVarsValues(
    variables?: Record<string, Oas3ServerVariable>,
): Record<string, string> {
    if (!variables) {
        return {};
    }

    return transform(variables, (acc, v, k) => {
        if (v.default) {
            acc[k] = v.default;
        }

        return acc;
    }, {});
}
