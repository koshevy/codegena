import { async, TestBed, ComponentFixture } from '@angular/core/testing';

import { MockConvertor } from './mocks/mock-convertor';
import { defaultConfig } from './config';
import { ApiMetaInfo } from './api-meta-info';
import {
    ParsingError,
    ParsingProblems,
    ParsingProblemMeta
} from './parsing-problems';

import _ from 'lodash';

import { DataTypeDescriptor } from './';

describe('BaseConvertor entry points extracting', () => {
    let convertor: MockConvertor;

    beforeEach(async(() => {
        convertor = new MockConvertor(defaultConfig);
    }));

    it([
        'should extract meta info for',
        'GET with inline query parameters, inline successful response, no body request'
    ].join(' '), () => {
        const oasStructure = require('./mocks/oas3/01-case-simplest-get.json');
        const sceeningApiMeta: ApiMetaInfo = require(
            './mocks/screening/01-case-simplest-get.json'
        );

        const context = {};
        const metainfo: ApiMetaInfo[] = [];

        let commonDescriptors;

        convertor.loadOAPI3Structure(oasStructure);
        commonDescriptors = convertor.getOAPI3EntryPoints(context, metainfo);

        expect(metainfo.length).toBe(1);

        const [methodMeta] = metainfo;
        const baseTypeName = _.upperFirst(_.get(oasStructure, 'paths./.get.operationId'));

        // Check points before complete screening
        expect(methodMeta.servers).toEqual(['http://localhost']);
        expect(methodMeta.baseTypeName).toBe(baseTypeName);
        expect(methodMeta.path).toBe('/');
        expect(methodMeta.method).toBe('GET');
        expect(methodMeta.paramsModelName).toBe(`${baseTypeName}Parameters`);
        expect(methodMeta.responseModelName).toBe(`${baseTypeName}Response`);
        expect(methodMeta.requestModelName).toBe(null);
        expect(methodMeta.paramsSchema).toBeTruthy();
        expect(methodMeta.responseSchema).toBeTruthy();
        expect(methodMeta.responseSchema[200]['application/json']).toBeTruthy();
        expect(methodMeta.requestSchema).toBe(null);
        expect(methodMeta.requestIsRequired).toBeFalsy();
        expect(methodMeta.queryParams).toEqual([
            'importantProperty',
            "nullableProperty",
            'optionalProperty'
        ]);
        // Important! typingsDependencies should be empty
        expect(methodMeta.typingsDependencies).toEqual([
            `${baseTypeName}Parameters`,
            `${baseTypeName}Response`
        ]);
        // Check response title rewrites common schema title
        expect(
            _.get(methodMeta.responseSchema, '200.application/json.description')
        ).toBe('Successful result');

        expect(commonDescriptors.length).toEqual(2);
        expect(_.map(commonDescriptors, (descr: DataTypeDescriptor) => descr.modelName))
            .toEqual([`${baseTypeName}Parameters`, `${baseTypeName}Response`]);
        expect(context).toEqual({});

        // Full API meta screening.
        // Please, make sure screening is not contrary to single checks above!
        // expect(methodMeta).toEqual(sceeningApiMeta);
    });

    it([
        'should extract meta info for',
        'POST with no parameters, inline successful response, inline body request'
    ].join(' '), () => {
        const oasStructure = require('./mocks/oas3/02-case-simplest-post.json');
        const sceeningApiMeta: ApiMetaInfo = require(
            './mocks/screening/02-case-simplest-post.json'
        );

        const context = {};
        const metainfo: ApiMetaInfo[] = [];

        let commonDescriptors;

        convertor.loadOAPI3Structure(oasStructure);
        commonDescriptors = convertor.getOAPI3EntryPoints(context, metainfo);

        expect(metainfo.length).toBe(1);

        const [methodMeta] = metainfo;
        const baseTypeName = _.upperFirst(_.get(oasStructure, 'paths./.post.operationId'));

        // Check points before complete screening
        expect(methodMeta.servers).toEqual(['http://localhost']);
        expect(methodMeta.baseTypeName).toBe(baseTypeName);
        expect(methodMeta.path).toBe('/');
        expect(methodMeta.method).toBe('POST');
        expect(methodMeta.paramsModelName).toBe(null);
        expect(methodMeta.responseModelName).toBe(`${baseTypeName}Response`);
        expect(methodMeta.requestModelName).toBe(`${baseTypeName}Request`);
        expect(methodMeta.paramsSchema).toBe(null);
        expect(methodMeta.responseSchema).toBeTruthy();
        expect(methodMeta.responseSchema[200]['application/json']).toBeTruthy();
        expect(methodMeta.requestSchema).toBeTruthy();
        expect(methodMeta.requestSchema['application/json'].description).toBe(
            'Optional request body'
        );
        expect(methodMeta.requestIsRequired).toBeFalsy();
        expect(methodMeta.queryParams).toEqual([]);
        // Important! typingsDependencies should be empty
        expect(methodMeta.typingsDependencies).toEqual([
            `${baseTypeName}Response`,
            `${baseTypeName}Request`
        ]);
        // Check response title rewrites common schema title
        expect(
            _.get(methodMeta.responseSchema, '200.application/json.description')
        ).toBe('Successful result');

        expect(commonDescriptors.length).toEqual(2);
        expect(_.map(commonDescriptors, (descr: DataTypeDescriptor) => descr.modelName))
            .toEqual([`${baseTypeName}Response`, `${baseTypeName}Request`]);
        expect(context).toEqual({});

        // Full API meta screening.
        // Please, make sure screening is not contrary to single checks above!
        // expect(methodMeta).toEqual(sceeningApiMeta);
    });

    it([
        'should extract meta info for',
        'PUT with inline path parameters, required inline successful response, inline body request'
    ].join(' '), () => {
        const oasStructure = require('./mocks/oas3/03-case-simplest-put.json');
        const sceeningApiMeta: ApiMetaInfo = require(
            './mocks/screening/03-case-simplest-put.json'
        );

        const context = {};
        const metainfo: ApiMetaInfo[] = [];

        let commonDescriptors;

        convertor.loadOAPI3Structure(oasStructure);
        commonDescriptors = convertor.getOAPI3EntryPoints(context, metainfo);

        expect(metainfo.length).toBe(1);

        const [methodMeta] = metainfo;
        const baseTypeName = _.upperFirst(_.get(oasStructure, 'paths./{id}.put.operationId'));

        // Check points before complete screening
        expect(methodMeta.servers).toEqual(['http://localhost']);
        expect(methodMeta.baseTypeName).toBe(baseTypeName);
        expect(methodMeta.path).toBe('/{id}');
        expect(methodMeta.method).toBe('PUT');
        expect(methodMeta.responseModelName).toBe(`${baseTypeName}Response`);
        expect(methodMeta.requestModelName).toBe(`${baseTypeName}Request`);
        expect(methodMeta.paramsModelName).toBe(`${baseTypeName}Parameters`);
        expect(methodMeta.responseSchema).toBeTruthy();
        expect(methodMeta.responseSchema[200]['application/json']).toBeTruthy();
        expect(methodMeta.requestSchema['application/json']).toBeTruthy();
        expect(methodMeta.paramsSchema).toBeTruthy();
        expect(methodMeta.requestSchema['application/json'].description).toBe(
            'Required request body'
        );
        expect(methodMeta.requestIsRequired).toBeTruthy();
        expect(methodMeta.queryParams).toEqual(['optionalProperty']);
        // Important! typingsDependencies should be empty
        expect(methodMeta.typingsDependencies).toEqual([
            `${baseTypeName}Parameters`,
            `${baseTypeName}Response`,
            `${baseTypeName}Request`
        ]);
        // Check response title rewrites common schema title
        expect(
            _.get(methodMeta.responseSchema, '200.application/json.description')
        ).toBe('Successful result');

        expect(commonDescriptors.length).toEqual(3);
        expect(_.map(commonDescriptors, (descr: DataTypeDescriptor) => descr.modelName))
            .toEqual([
                `${baseTypeName}Parameters`,
                `${baseTypeName}Response`,
                `${baseTypeName}Request`
            ]);
        expect(context).toEqual({});

        // Full API meta screening.
        // Please, make sure screening is not contrary to single checks above!
        // expect(methodMeta).toEqual(sceeningApiMeta);
    });

    it([
        'should extract meta info for',
        'PATCH with parameters, inline successful responses (201, 202),',
        'inline default error response, required body request'
    ].join(' '), () => {
        const oasStructure = require('./mocks/oas3/04-case-simplest-patch.json');
        const sceeningApiMeta: ApiMetaInfo = require(
            './mocks/screening/04-case-simplest-patch.json'
        );

        const context = {};
        const metainfo: ApiMetaInfo[] = [];

        let commonDescriptors;

        convertor.loadOAPI3Structure(oasStructure);
        commonDescriptors = convertor.getOAPI3EntryPoints(context, metainfo);

        expect(metainfo.length).toBe(1);

        const [methodMeta] = metainfo;
        const baseTypeName = _.upperFirst(_.get(oasStructure, 'paths./{id}.patch.operationId'));

        // Check points before complete screening
        expect(methodMeta.servers).toEqual(['http://localhost']);
        expect(methodMeta.baseTypeName).toBe(baseTypeName);
        expect(methodMeta.path).toBe('/{id}');
        expect(methodMeta.method).toBe('PATCH');
        expect(methodMeta.responseModelName).toBe(`${baseTypeName}Response`);
        expect(methodMeta.requestModelName).toBe(`${baseTypeName}Request`);
        expect(methodMeta.paramsModelName).toBe(`${baseTypeName}Parameters`);
        expect(methodMeta.responseSchema).toBeTruthy();
        expect(methodMeta.responseSchema[200]['application/json']).toBeTruthy();
        expect(methodMeta.responseSchema[200]['application/json'].description).toBe(
            'Has wrote'
        );
        expect(methodMeta.responseSchema[202]['application/json']).toBeTruthy();
        expect(methodMeta.responseSchema[202]['application/json'].description).toBe(
            'No changes'
        );
        expect(methodMeta.responseSchema['default']['application/json']).toBeTruthy();
        expect(methodMeta.responseSchema['default']['application/json'].description).toBe(
            'Error answer'
        );
        expect(methodMeta.requestSchema['application/json']).toBeTruthy();
        expect(methodMeta.paramsSchema).toBeTruthy();
        expect(methodMeta.requestSchema['application/json'].description).toBe(
            'Required request body'
        );

        expect(commonDescriptors.length).toEqual(3);
        expect(_.map(commonDescriptors, (descr: DataTypeDescriptor) => descr.modelName))
            .toEqual([
                `${baseTypeName}Parameters`,
                `${baseTypeName}Response`,
                `${baseTypeName}Request`
            ]);
        expect(context).toEqual({});

        // Full API meta screening.
        // Please, make sure screening is not contrary to single checks above!
        // expect(methodMeta).toEqual(sceeningApiMeta);
    });

    // Simplest cases:

    // Combine simplest cases:
    // TODO together belows:
    // 05. Ref from schemes: GET, POST, PUT, PATCH,
    //     inline parameters, $ref schema in parameters,
    //     inline request, $ref schema in request,
    //     inline response, $ref schema in response,
    // TODO Advanced case: $ref to requests, $ref to responses, $ref to parameters
    // TODO Advanced case: different content types
    // TODO Advanced case: file upload
    // TODO Advanced case: file download
    // TODO Advanced case: examples
});

describe('Parsing problems notifications', () => {
    const simplestOasStructure = require('./mocks/oas3/01-case-simplest-get.json');
    let convertor: MockConvertor;
    let warnings: Array<{
        message: string;
        meta: ParsingProblemMeta
    }>;

    beforeEach(async(() => {
        convertor = new MockConvertor(defaultConfig);
        warnings = [];
        ParsingProblems.onWarnings = (message, meta) => {
            warnings.push({message, meta});
        };
    }));

    it('should throw ParsingError when structure is not object', () => {
        expect(() => {
            convertor.loadOAPI3Structure('' as any);
        }).toThrowError(/Expected structure to be object/);
    });

    it('should throw ParsingError when setForeignSchemeFn is not function', () => {
        expect(() => {
            convertor.setForeignSchemeFn(null as any);
        }).toThrowError(/Error in `setForeignSchemeFn`/);
    });

    it(
        'should throw ParsingError when `getMethodsSchemes` called before `loadOAPI3Structure`',
        () => {
            expect(() => {
                convertor.getMethodsSchemes([]);
            }).toThrowError(/There is no structure loaded/);
        }
    );

    it(
        'should throw ParsingError when oas-structure has no paths',
        () => {
            expect(() => {
                const oasStructureWithoutPaths = {
                    ...simplestOasStructure,
                    paths: undefined
                };

                convertor.loadOAPI3Structure(oasStructureWithoutPaths);
                convertor.getMethodsSchemes([]);
            }).toThrowError(/No paths presented in OAS structure/);
        }
    );

    it('should warn when key is empty', () => {
        const oasStructureWithEmptyPathName = _.cloneDeep(simplestOasStructure);

        oasStructureWithEmptyPathName.paths[''] = {
            ...oasStructureWithEmptyPathName.paths['/']
        };

        convertor.loadOAPI3Structure(oasStructureWithEmptyPathName);
        convertor.getMethodsSchemes([]);

        expect(_.get(warnings, '[0].meta.jsonPath')).toBe('/path/');
    });

    it('should warn when path item is not object', () => {
        const oasStructureWithIncorrectPathItem = _.cloneDeep(simplestOasStructure);

        oasStructureWithIncorrectPathItem.paths['/'] = null;
        convertor.loadOAPI3Structure(oasStructureWithIncorrectPathItem);
        convertor.getMethodsSchemes([]);

        expect(_.get(warnings, '[0].meta.jsonPath')).toBe('/path/~1');
    });

    it('should warn when operation is not object', () => {
        const oasStructureWithIncorrectOperation = _.cloneDeep(simplestOasStructure);

        oasStructureWithIncorrectOperation.paths['/'].get = null;
        convertor.loadOAPI3Structure(oasStructureWithIncorrectOperation);
        convertor.getMethodsSchemes([]);

        expect(_.get(warnings, '[0].meta.jsonPath')).toBe('/path/~1/get');
    });

    it('should warn when `operationId` is wrong', () => {
        const oasStructureWithIncorrectOperation = _.cloneDeep(simplestOasStructure);

        oasStructureWithIncorrectOperation.paths['/'].get.operationId = null;
        convertor.loadOAPI3Structure(oasStructureWithIncorrectOperation);
        convertor.getMethodsSchemes([]);

        expect(_.get(warnings, '[0].meta.jsonPath')).toBe('/path/~1/get/operationId');
    });

    it('should warn when $ref is unresolved', () => {
        const oasStructure = _.cloneDeep(simplestOasStructure);

        oasStructure.paths['/'].get.parameters = [
            { $ref: '#/NonExisting/Ref/Path' }
        ];

        convertor.loadOAPI3Structure(oasStructure);
        convertor.getMethodsSchemes([]);

        expect(_.get(warnings, '[0].meta.jsonPath')).toBe('/path/~1/get/parameters/0');
    });

    it('should warn or throw error when operation servers was set wrong', () => {
        const oasStructureWithIncorrectServers = _.cloneDeep(simplestOasStructure);

        oasStructureWithIncorrectServers.paths['/'].get.servers = {};
        oasStructureWithIncorrectServers.paths['/additional'] = _.cloneDeep(
            oasStructureWithIncorrectServers.paths['/']
        );
        oasStructureWithIncorrectServers.paths['/additional'].get.servers = [
            { url: null }
        ];
        convertor.loadOAPI3Structure(oasStructureWithIncorrectServers);

        expect(() => {
            convertor.getMethodsSchemes([]);
        }).toThrowError(/Server object should have url/);

        expect(_.get(warnings, '[0].meta.jsonPath')).toBe('/path/~1/get/servers');
    });

    it.each([
        'parameters',
        'responses',
        'requestBody'
    ])('should throw understandable error when `%s` schemas fetching fails', source => {
        const oasStructure = _.cloneDeep(simplestOasStructure);
        let thrownError: ParsingError;

        // different ways to cause an error
        if (source === 'requestBody') {
            oasStructure.paths['/'].get[source] = {content: [null]};
        } else {
            oasStructure.paths['/'].get[source] = [null];
        }

        try{
            convertor.loadOAPI3Structure(oasStructure);
            convertor.getMethodsSchemes([]);
        } catch(error) {
            thrownError = error;
        }

        if (!thrownError) {
            fail(`No error was thrown on schemas fetching from ${source}`);
            return;
        }

        expect(thrownError.meta.jsonPath).toBe(`/path/~1/get/${source}`);
    });

    it.each([
        'parameters',
        'responses'
    ])('should throw understandable error when using wrong $ref in `%s`', source => {
        const oasStructure = _.cloneDeep(simplestOasStructure);
        let thrownError: ParsingError;

        oasStructure.paths['/'].get[source] = [
            { $ref: '!wrong.ref.format' }
        ];

        try{
            convertor.loadOAPI3Structure(oasStructure);
            convertor.getMethodsSchemes([]);
        } catch(error) {
            thrownError = error;
        }

        expect(thrownError.meta.jsonPath).toBe(`/path/~1/get/${source}/0`);
    })
});

// TODO do extract server info by operationId
// TODO do extract examples by operationId
