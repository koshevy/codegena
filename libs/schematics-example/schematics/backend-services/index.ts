import { from as fromPromise } from 'rxjs';
import { map } from 'rxjs/operators';
import { SourceFile } from 'typescript';
import { join, parse } from 'path';
import { nanoid } from 'nanoid';
import { isObjectLike } from 'lodash';
import {
    apply,
    applyTemplates,
    chain,
    filter,
    mergeWith,
    move,
    url,
    Rule,
    Tree,
} from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core';
import { Facade } from '@codegena/oapi3ts';
import { Operation } from '@codegena/oapi3ts/contract';
import { Schema as JsonSchema } from '@codegena/definitions/json-schema';
import { Oas3Server } from '@codegena/definitions/oas3';
import { SchematicHostSavingStrategy } from '@codegena/schematics-tools';
import { Schema } from './schema'
import { getPreparedOptions } from './utilities/get-prepared-options';

interface ServiceTemplateParams {
    operationId: string;
    libraryName: string;
    method: string;
    parametersModelName: string | null;
    requestBodyModelName: string | null;
    responseModelName: string | null;
    pathTemplate: string;
    queryParameters: string[] | null;
    servers: Oas3Server[];
    parametersSchema: JsonSchema | null;
    requestBodySchema: JsonSchema | null;
    responseSchema: JsonSchema | null;
    templatePath: string;
    serializeSchema: (schema: JsonSchema) => string,
}

export function backendServices(options: Schema): Rule {
    return (tree: Tree) =>
        fromPromise(getPreparedOptions(tree, options)).pipe(map(
            ({oas3Specification, libraryName, path, projectRoot}) => {
                const savingStrategy = new SchematicHostSavingStrategy(
                    tree,
                    path,
                );
                const facade = new Facade(oas3Specification, savingStrategy);
                const { moduleName } = options;

                return chain([
                    createDomainSchemaSecondaryEntrypoint(tree, join(projectRoot, 'domain-schema'), facade, moduleName),
                    createTypings(tree, facade),
                    applyBackendServiceTemplates(tree, path, facade, moduleName, libraryName),
                    applyGeneralTemplates(tree, path, facade, moduleName),
                ]);
            },
        )).toPromise();
}

function createDomainSchemaSecondaryEntrypoint(
    tree: Tree,
    path: string,
    facade: Facade,
    moduleName: string,
): Rule {
    return () => {
        const indexFile = join(path, 'src', 'index.ts');
        const ngPackageFile = join(path, 'ng-package.json');
        const domainSchema = {
            $id: moduleName,
            components: facade.specification.components,
        };
        const ngPackageJson = {
            lib: { entryFile: "src/index.ts" },
        };
        const writeIndexFn = tree.exists(indexFile)
            ? tree.overwrite.bind(tree)
            : tree.create.bind(tree);
        const writeNgPackageFn = tree.exists(ngPackageFile)
            ? tree.overwrite.bind(tree)
            : tree.create.bind(tree);

        writeIndexFn(
            indexFile,
            `export const domainSchema = ${
                JSON.stringify(domainSchema, null, '  ')
            }`,
        );

        writeNgPackageFn(
            join(path, 'ng-package.json'),
            JSON.stringify(ngPackageJson, null, '  '),
        );

        return tree;
    }
}

function createTypings(tree: Tree, facade: Facade): Rule {
    return () => {
        facade.commit();

        return tree;
    }
}

function applyBackendServiceTemplates(
    tree: Tree,
    path: string,
    facade: Facade,
    moduleName: string,
    libraryName: string,
): Rule {
    const templates = facade.operations.map(operation => {
        const templateOptions = getTemplateParameters(
            operation, facade, moduleName, libraryName,
        );
        const filterServiceTemplate = () => filter(templatePath =>
            templatePath.indexOf('backend.service.ts') !== -1,
        );

        return apply(url('./files'), [
            filterServiceTemplate(),
            applyTemplates({...strings, ...templateOptions}),
            move(normalize(join(path, templateOptions.templatePath))),
        ]);
    });

    return chain(
        templates.map(templateSource => mergeWith(templateSource)),
    );
}

function applyGeneralTemplates(
    tree: Tree,
    path: string,
    facade: Facade,
    moduleName: string,
): Rule {
    return chain([
        mergeWith(apply(url('./files'), [
            filter(templatePath =>
                (templatePath.indexOf('index.ts') !== -1)
                || (templatePath.indexOf('module.ts') !== -1)
            ),
            applyTemplates({
                ...strings,
                moduleName,
                operationIds: facade.operations.map(operation =>
                    operation.oas3Operation.operationId,
                ),
                typingFiles: facade.allDependencies.map(
                    dependency => dependency.source.fileName,
                ).sort(),
            }),
            move(normalize(path)),
        ])),
    ]);
}

function getTemplateParameters(
    operation: Operation,
    facade: Facade,
    moduleName: string,
    libraryName: string,
): ServiceTemplateParams {
    let parametersModelName: string | null = null;
    let requestBodyModelName: string | null = null;
    let responseModelName: string | null = null;
    let parametersSchema: JsonSchema | null = null;
    let requestBodySchema: JsonSchema | null = null;
    let responseSchema : JsonSchema | null = null;
    const servers = operation.servers || facade.specification?.servers || [];

    if (operation.parameters) {
        parametersModelName = findRootIdentifier(operation.parameters.source);
        parametersSchema = operation.parameters.schema;
    }

    if (operation.request) {
        requestBodyModelName = findRootIdentifier(operation.request.source);
        requestBodySchema = operation.request.schema;
    }

    if (operation.response) {
        responseModelName = findRootIdentifier(operation.response.source);
        responseSchema = operation.response.schema;
    }

    const adjacentFile = operation.parameters?.source?.fileName
        || operation.request?.source?.fileName
        || operation.response?.source?.fileName;

    const templatePath = parse(adjacentFile).dir;
    const operationId = operation.oas3Operation.operationId;
    // fixme extract to utilites
    const serializeSchema = (schema: JsonSchema, $id = nanoid(), idInRoot = false) => JSON.stringify(
        idInRoot ? { $id, ...schema } : schema,
        (key, value) => {
            if (key === 'title' || key === 'description') {
                return;
            }

            if (key === '$ref') {
                return [moduleName, value].join('');
            }

            if (isKeyContentType(key) && isObjectLike(value)) {
                return {
                    ...value,
                    $id: [$id, key].join('_').replace(/[^\w]/g, '_'),
                }
            }

            return value
        },
        '  '
    );

    return {
        operationId,
        libraryName,
        method: operation.method,
        parametersModelName,
        requestBodyModelName,
        responseModelName,
        pathTemplate: operation.path,
        queryParameters: operation.queryParameters,
        servers,
        parametersSchema,
        requestBodySchema,
        responseSchema,
        templatePath,
        serializeSchema,
    };
}

function findRootIdentifier(source: SourceFile): string | null {
    if (!source.statements) {
        return null;
    }

    return source.statements
        .map(statement => statement['name']?.escapedText)
        .filter(name => !!name)
        [0];
}

function isKeyContentType(key: string): boolean {
    return /\//.test(key);
}
