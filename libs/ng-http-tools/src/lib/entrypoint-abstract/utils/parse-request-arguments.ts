import { HttpMethod } from "../http-method";

export function parseRequestArguments<
    TParameters extends object,
    TRequestBody,
    TResponse
>(method: HttpMethod, ...args): {
    parameters?: TParameters,
    requestBody?: TRequestBody,
    response?: TResponse,
} {
    if (method === 'GET') {
        return { parameters: args[0] }
    }

    if (args.length > 1) {
        return {
            parameters: args[0],
            requestBody: args[1]
        }
    }

    return { requestBody: args[0] }
}
