import _ from 'lodash';
import { CliConfig } from './cli-config';

import {
    getHash,
    prepareJsonToSave,
    purifyJson
} from './helpers';
import {
    ApiMetaInfo,
    Convertor,
    DataTypeDescriptor,
    OApiStructure
} from '@codegena/oapi3ts';

import {
    ApiServiceTemplateData,
    createApiServiceWithTemplate
} from '@codegena/ng-api-service/src/lib/templates';

/**
 * Abstract convertor application.
 * Could have an implementation for CLI or for Browser.
 */
export abstract class AbstractApplication {

    // *** Properties

    protected abstract get destPathAbs(): string;

    protected cliConfig: CliConfig;
    protected convertor: Convertor;
    protected renderedTypings: {[fileName: string]: string};

    // *** Methods

    constructor() {
        this.cliConfig = this.getCliConfig();
        this.convertor = new Convertor(this.cliConfig);
        this.renderedTypings = {};

        if (!this.cliConfig.srcPath) {
            throw new Error('--srcPath is not set!');
        }
    }

    /**
     * Start point of application
     */
    public createTypings(): void {
        this.convertor.loadOAPI3Structure(this.getOApiStructure());

        const context = {};
        const entryPoints = this.convertor.getOAPI3EntryPoints(context);
        const alreadyRendered = [];

        Convertor.renderRecursive(
            entryPoints,
            (
                descriptor: DataTypeDescriptor,
                text,
                depencies: DataTypeDescriptor[]
            ) => {
                const fileName = this.getFilenameOf(descriptor);
                const fileContents = [
                    ...this.cliConfig.separatedFiles
                        ? [this.getImports(depencies).join('\n')]
                        : [],
                    text
                ].join('\n\n').trim();

                this.renderedTypings[fileName] = fileContents;

                if (this.cliConfig.separatedFiles) {
                    this.saveFile(
                        fileName,
                        this.cliConfig.typingsDirectory,
                        `/* tslint:disable */\n${fileContents}`
                    );
                }
            },
            alreadyRendered
        );

        // Indexing file or common typings file
        if (this.cliConfig.separatedFiles) {
            this.saveFile(
                'index',
                this.cliConfig.typingsDirectory,
                _(this.renderedTypings)
                    .keys()
                    .sort()
                    .map(fileName => `export * from './${fileName}';`)
                    .join('\n')
            );
        } else {
            this.saveFile(
                'index',
                this.cliConfig.typingsDirectory,
                `/* tslint:disable */\n${
                    _.values(this.renderedTypings).join('\n')
                }`
            );
        }
    }

    /**
     * @experimental
     * Create service for specified engine
     * @param engine
     * Destination engine. At moment supports only Angular.
     */
    public createServices(engine: 'angular') {
        const context = {}, metaInfoList: ApiMetaInfo[] = [];
        const structure = this.getOApiStructure();
        const schemaId = `schema.${getHash(this.getOApiStructure()).slice(4, 26).toLowerCase()}`;
        const replacer = purifyJson.bind({ $id: schemaId });
        const fileIndex: string[] = [];

        this.convertor.loadOAPI3Structure(structure);
        this.convertor.getOAPI3EntryPoints(context, metaInfoList);

        const templatesData = _.map<ApiMetaInfo, ApiServiceTemplateData>(
            metaInfoList,
            (metaInfo: ApiMetaInfo) => {
                return {
                    apiSchemaFile: JSON.stringify(`./${schemaId}`),
                    baseTypeName: metaInfo.baseTypeName,
                    method: JSON.stringify(metaInfo.method),
                    paramsModelName: metaInfo.paramsModelName || 'null',
                    paramsSchema: JSON.stringify(metaInfo.paramsSchema, replacer),
                    path: JSON.stringify(metaInfo.path),
                    queryParams: JSON.stringify(metaInfo.queryParams),
                    requestModelName: metaInfo.requestModelName || 'null',
                    requestSchema: JSON.stringify(metaInfo.requestSchema, replacer),
                    responseModelName: metaInfo.responseModelName || 'null',
                    responseSchema: JSON.stringify(metaInfo.responseSchema, replacer),
                    servers: JSON.stringify(metaInfo.servers),
                    typingsDependencies: metaInfo.typingsDependencies,
                    typingsDirectory: this.cliConfig.typingsFromServices
                } as any as ApiServiceTemplateData;
            }
        );

        // Save rendered templates
        _.each(
            templatesData,
            (templateData: ApiServiceTemplateData) => {
                const fileName = `${_.kebabCase(templateData.baseTypeName)}.api.service`;

                fileIndex.push(fileName);

                this.saveFile(
                    fileName,
                    this.cliConfig.servicesDirectory,
                    createApiServiceWithTemplate(templateData)
                );
            }
        );

        // index for all services
        this.saveFile(
            'index',
            this.cliConfig.servicesDirectory,
            `/* tslint:disable */\n${
                _.map(fileIndex, (fileName) =>
                    `export * from './${fileName}';`
                ).join('\n')
                }\n\nexport { schema } from './${schemaId}';`
        );

        this.saveSchemaLib(structure, schemaId);
    }

    /**
     * Get config merged with data from CLI
     */
    protected abstract getCliConfig(): CliConfig;

    /**
     * Obtain the Open API data from a file or other source
     */
    protected abstract getOApiStructure(): OApiStructure;

    /**
     * Put converted file to filesystem or other any output
     * @param fileName
     * Base part of file name without directory and extension
     * @param subdir
     * Subdirectory in base directory
     * @param fileContents
     */
    protected abstract saveFile(
        fileName: string,
        subdir: string,
        fileContents: string
    ): void;

    /**
     * Save OpenApi components and definitions as library of JSON Schema models
     *
     * @param jsonSchema
     */
    protected saveSchemaLib(
        jsonSchema: OApiStructure,
        schemaId = 'domainSchema'
    ): void {
        this.saveFile(
            schemaId,
            this.cliConfig.servicesDirectory,
            `/* tslint:disable */\nexport const schema = ${
                prepareJsonToSave(jsonSchema, schemaId)
                };\n`
        );
    }

    // Private

    private getFilenameOf(descriptor: DataTypeDescriptor): string {
        return `${_.kebabCase(descriptor.modelName)}`;
    }

    private getImports(descriptors: DataTypeDescriptor[]): string[] {
        return _(descriptors)
            .uniq()
            .sort()
            // todo here was <DataTypeDescriptor, string> but TS caused error
            .map<any>(
                (descriptor: DataTypeDescriptor) =>
                    `import { ${descriptor.modelName} } from './${this.getFilenameOf(descriptor)}';`
            )
            .value();
    }
}
