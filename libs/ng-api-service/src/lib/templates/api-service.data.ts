export interface ApiServiceTemplateData {
    /**
     * Filename of external JSON Schema that should be used
     * as a library of JSON Schema definitions, without extension.
     *
     * Should be prepared as JSON-string
     */
    apiSchemaFile: string;

    /**
     * Filename of an external JSON Schema that should be used
     * as a library of JSON Schema definitions.
     *
     * Should be a technical name in a string without quotes.
     */
    baseTypeName: string;

    /**
     * HTTP-Method. Should be prepared as JSON-string,
     * i.e. set with single-quotes.
     */
    method: '\'GET\'' | '\'POST\'' | '\'PUT\'' | '\'PATCH\'' | '\'DELETE\'' | '\'OPTIONS\'';

    /**
     * Name of a TypeScript-interface, that describes a format of params.
     * Should be a technical name in a string without quotes.
     */
    paramsModelName: string;

    /**
     * JSON Schema for validation of params. Should be
     * prepared as JSON-string
     */
    paramsSchema: string;

    /**
     * Path (URI) to API method or path template with params
     * in curly braces.
     *
     * Should be prepared as JSON-string, i.e. set with single-quotes.
     */
    path: string;

    /**
     * Params have to be placed in query string.
     * Should be a technical name in a string without quotes.
     */
    queryParams: string[];

    /**
     * Name of a TypeScript-interface, that describes a format of response.
     * Should be a technical name in a string without quotes.
     */
    responseModelName: string;

    /**
     * JSON Schema for validation of response. Should be
     * prepared as JSON-string
     */
    responseSchema: string;

    /**
     * Name of a TypeScript-interface, that describes a format of request.
     * Should be a technical name in a string without quotes.
     */
    requestModelName: string;

    /**
     * JSON Schema for validation of request. Should be
     * prepared as JSON-string
     */
    requestSchema: string;

    /**
     * Params have to be placed in query string.
     * Should be an array of JSON-prepared strings.
     */
    servers;

    /**
     * Typing models used in class have to be imported
     * from {@link typingsDirectory}.
     */
    typingsDependencies: string[];

    /**
     * Directory with typing models
     */
    typingsDirectory: string;
}
