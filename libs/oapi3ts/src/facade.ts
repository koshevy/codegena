import {
    createSourceFile,
    SourceFile,
    ScriptTarget,
} from "typescript";
import * as _ from 'lodash';
import { Oas3Specification } from '@codegena/definitions/oas3';
// tslint:disable:no-implicit-dependencies
import {
    Dependency,
    Facade as FacadeContract,
    FileSavingStrategy,
    Operation,
    Parameters,
    Request,
    Response,
} from '@codegena/oapi3ts/contract';
// tslint:enable:no-implicit-dependencies
import { Convertor } from './legacy/adapters/typescript';
import { ParsingError } from './legacy/core';
import {
    DataTypeContainer,
    ApiMetaInfo,
    DataTypeDescriptor,
} from "./legacy/core";
import { extractCommonDependencies } from './utils';

export class Facade implements FacadeContract {

    public get allDependencies(): Dependency[] {
        return this._allDependencies;
    }

    public get commonDependencies(): Dependency[] {
        return this._commonDependencies;
    }

    public get operations(): Operation[] {
        return this._operations;
    }

    private convertor: Convertor = new Convertor();
    private convertorContext = {};
    private entryPoints: DataTypeContainer;
    private _allDependencies: Dependency[];
    private _commonDependencies: Dependency[];
    private _operations: Operation[];

    constructor(
        public readonly specification: Oas3Specification,
        protected readonly fileSavingStrategy: FileSavingStrategy,
    ) {
        this.convertor.loadOAPI3Structure(specification);
        this.entryPoints = this.convertor.getOAPI3EntryPoints(this.convertorContext);
        this._operations = this.getOperations();

        const {
            allDependencies,
            commonDependencies,
        } = extractCommonDependencies(
            ...this._operations.map(operation =>
                operation.allDependencies,
            ),
        );

        this._allDependencies = allDependencies;
        this._commonDependencies = commonDependencies;
    }

    public commit(): void {
        const committingSources = this._allDependencies.forEach(dependency => {
            this.fileSavingStrategy.commit(dependency.source);
        });
    }

    private getOperations(): Operation[] {
        return this.convertor.getApiMeta().map(
            ({apiMeta, operationJsonPath}) => {
                const oas3OperationJsonPath = operationJsonPath;
                const oas3Operation = _.get(this.specification, operationJsonPath);
                const parameters = this.extractDependencies<Parameters>(apiMeta, apiMeta.paramsModelName);
                const request = this.extractDependencies<Request>(apiMeta, apiMeta.requestModelName);
                const response = this.extractDependencies<Response>(apiMeta, apiMeta.responseModelName);

                if (parameters) {
                    parameters.schema = apiMeta.paramsSchema;
                }

                if (request) {
                    request.schema = apiMeta.requestSchema;
                }

                if (response) {
                    response.schema = apiMeta.responseSchema;
                }

                return {
                    oas3OperationJsonPath,
                    oas3Operation,
                    method: apiMeta.method,
                    path: apiMeta.path,
                    servers: apiMeta.servers,
                    parameters,
                    request,
                    response,
                    dependencies: [],
                    ...extractCommonDependencies(
                        [
                            parameters,
                            request,
                            response,
                        ].filter(dep => !!dep),
                        parameters?.dependencies || [],
                        request?.dependencies || [],
                        response?.dependencies || [],
                    ),
                    queryParameters: apiMeta.queryParams || null,
                };
            },
        );
    }

    private extractDependencies<T extends Dependency>(
        operationMeta: ApiMetaInfo,
        modelName: string,
    ): T {
        const neededEntrypoint = this.entryPoints.find(
            entrypoint => entrypoint.modelName === modelName,
        );

        if (!neededEntrypoint) {
            return null;
        }

        const renderedDependencies = this.renderEntrypointWithDeps(
            neededEntrypoint,
            operationMeta.baseTypeName,
        );

        const parametersModelSource = renderedDependencies.pop();

        return {
            source: parametersModelSource.source,
            dependencies: renderedDependencies,
            schema: neededEntrypoint.schema,
        } as T;
    }

    private renderEntrypointWithDeps(
        entrypoint: DataTypeDescriptor,
        operationName: string,
    ): Dependency[] {
        const result: Record<string, Dependency> = {};
        const topLevelModelName = entrypoint.modelName || entrypoint.suggestedModelName;

        Convertor.renderRecursive(
            [entrypoint],
            (descriptor, text, dependencies) => {
                const modelName = descriptor.modelName || descriptor.suggestedModelName;
                let fullpath;

                if (modelName === topLevelModelName) {
                    fullpath = this.fileSavingStrategy.getDependencyFullPath(
                        modelName,
                        operationName,
                    );
                } else {
                    fullpath = this.fileSavingStrategy
                        .getCommonDependencyFullPath(modelName);
                }

                const renderedDependencies = _.uniq(dependencies).map(
                    (dependency: DataTypeDescriptor) => {
                        const dependencyName = dependency.modelName
                            || dependency.suggestedModelName;

                        const dependencyFullPath = this.fileSavingStrategy
                            .getCommonDependencyFullPath(dependencyName);

                        const existedDependency = result[dependencyFullPath];

                        if (!existedDependency) {
                            throw new ParsingError(
                                'Error at dependency graph rendering!',
                                {
                                    descriptors: [descriptor, ...dependencies],
                                    oasStructure: this.specification,
                                    schema: dependency.schema,
                                    relatedRef: dependency.originalSchemaPath,
                                }
                            );
                        }

                        return existedDependency;
                    }
                );

                result[fullpath] = {
                    source: this.createSource(fullpath, text, renderedDependencies),
                    schema: descriptor.schema,
                    dependencies: renderedDependencies,
                };
            }
        );

        return _.values(result);
    }

    private createSource(
        fullpath: string,
        text: string,
        dependencies: Dependency[],
    ): SourceFile {
        const imports = dependencies.map(dependency => {
            const importPath = this.fileSavingStrategy.getRelativePath(
                fullpath,
                dependency.source.fileName,
            ).replace(/\.\w+$/, '');

            const dependencyIdentifiers = this
                .findRootIdentifiers(dependency.source)
                .join(', ');

            return `import { ${dependencyIdentifiers} } from '${importPath}';`;
        });
        const importsBlock = imports.join('\n');
        const textWithImports = importsBlock.length
            ? [importsBlock, text].join('\n\n')
            : text;

        return createSourceFile(fullpath, textWithImports, ScriptTarget.Latest);
    }

    private findRootIdentifiers(source: SourceFile): string[] {
        if (!source.statements) {
            return [];
        }

        return source.statements
            .map(statement => statement['name']?.escapedText)
            .filter(name => !!name);
    }
}
