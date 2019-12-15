import _ from 'lodash';
import { OApiStructure } from '@codegena/oapi3ts';
import { GlobalPartial as Partial } from 'lodash/common/common';
import { sha1 } from 'hash.js';

type PreparedSchema = Partial<OApiStructure & { $id: string; }>;

/**
 * Parse value from CL to JS correct value.
 * For example: `-- separatedFiles false` should be
 * parsed as a `false`, but not `"false"`.
 * @param value
 */
export function parseCliArg(value) {
    value = String(value).trim();
    // some of Indian-style coding :D
    if (value !== undefined) {
        try {
            value = JSON.parse(value);
        } catch (e) {}
    }

    return value;
}

/**
 * Obtaining param such as `--srcFilename /some/path` from argv.
 * @param paramName
 * Param name without dashes, for example: `srcFilename`.
 *
 * @return
 * Returns only value like `/some/path`.
 */
export function getArvgParam(paramName) {
    const index = _.findIndex(
        process.argv || [],
        v => v === `--${paramName}`
    );

    return (index !== -1)
        ? parseCliArg(process.argv[index + 1])
        : undefined;
}

/**
 * Function works as replacer in {@link JSON.stringify}
 *
 * @param key
 * @param value
 */
export function purifyJson(key, value: any) {
    // adding supports of Swagger's `nullable`
    if (_.isObject(value) && value['nullable']) {
        delete value['nullable'];
        const schemaCopy = _.cloneDeep(value);

        return {
            anyOf: [
                {
                    description: 'OAS3 nullable',
                    type: 'null'
                },
                schemaCopy
            ]
        };
    }

    // cut off titles and descriptions
    if (_.includes(['description', 'title'], key)
        && ('string' === typeof value)) {

        return;
    }

    // cut off examples
    if (key === 'example') {
        return;
    }

    if (this.$id && key === '$ref') {
        return `${this.$id}${value}`;
    }

    return value;
}

export function prepareJsonToSave(
    jsonSchema: OApiStructure,
    schemaId: string
): string {
    const jsonSchemaCopy: PreparedSchema = _.clone(jsonSchema);

    // Removes waste parts of Structure
    delete jsonSchemaCopy.externalDocs;
    delete jsonSchemaCopy.info;
    delete jsonSchemaCopy.openapi;
    delete jsonSchemaCopy.paths;
    delete jsonSchemaCopy.security;
    delete jsonSchemaCopy.servers;
    delete jsonSchemaCopy.tags;

    if (jsonSchemaCopy.components) {
        delete jsonSchemaCopy.components.callbacks;
        delete jsonSchemaCopy.components.examples;
        delete jsonSchemaCopy.components.headers;
        delete jsonSchemaCopy.components.parameters;
        delete jsonSchemaCopy.components.requestBodies;
        delete jsonSchemaCopy.components.responses;
        delete jsonSchemaCopy.components.securitySchemes;
    }

    jsonSchemaCopy.$id = schemaId;

    // Removes waste examples, titles and descriptions
    return JSON.stringify(jsonSchemaCopy, purifyJson, '  ');
}

/**
 * Get hash of loaded structure. Used for compare and unique naming.
 */
export function getHash(structure: any): string {
    return sha1().update(JSON.stringify(structure)).digest('hex');
}
