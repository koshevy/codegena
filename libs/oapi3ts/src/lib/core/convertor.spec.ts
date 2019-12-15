import { async, TestBed, ComponentFixture } from '@angular/core/testing';

import { MockConvertor } from './mocks/mock-convertor';
import { defaultConfig } from './config';
import { ApiMetaInfo } from './api-meta-info';

import _ from 'lodash';

import {
    DataTypeContainer,
    DataTypeDescriptor,
    DescriptorContext
} from './';

describe('BaseConvertor entry points extracting', () => {
    let convertor: MockConvertor;

    beforeEach(async(() => {
        convertor = new MockConvertor(defaultConfig);
    }));

    // Case 1
    it([
        'should extract meta info for',
        'GET with inline query parameters, inline successful response, no body request'
    ].join(' '), () => {
        const oasSchema = require('./mocks/oas3/01-case-simplest-get.json');
        const sceeningApiMeta: ApiMetaInfo = require(
            './mocks/screening/01-case-simplest-get.json'
        );

        const context = {};
        const metainfo: ApiMetaInfo[] = [];

        let commonDescriptors;

        convertor.loadOAPI3Structure(oasSchema);
        commonDescriptors = convertor.getOAPI3EntryPoints(context, metainfo);

        expect(metainfo.length).toBe(1);

        const [methodMeta] = metainfo;
        const baseTypeName = _.upperFirst(_.get(oasSchema, 'paths./.get.operationId'));

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

    // Case 2
    it([
        'should extract meta info for',
        'POST with no parameters, inline successful response, inline body request'
    ].join(' '), () => {
        const oasSchema = require('./mocks/oas3/02-case-simplest-post.json');
        const sceeningApiMeta: ApiMetaInfo = require(
            './mocks/screening/02-case-simplest-post.json'
        );

        const context = {};
        const metainfo: ApiMetaInfo[] = [];

        let commonDescriptors;

        convertor.loadOAPI3Structure(oasSchema);
        commonDescriptors = convertor.getOAPI3EntryPoints(context, metainfo);

        expect(metainfo.length).toBe(1);

        const [methodMeta] = metainfo;
        const baseTypeName = _.upperFirst(_.get(oasSchema, 'paths./.post.operationId'));

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

    // Case 3
    it([
        'should extract meta info for',
        'PUT with inline path parameters, required inline successful response, inline body request'
    ].join(' '), () => {
        const oasSchema = require('./mocks/oas3/03-case-simplest-put.json');
        const sceeningApiMeta: ApiMetaInfo = require(
            './mocks/screening/03-case-simplest-put.json'
        );

        const context = {};
        const metainfo: ApiMetaInfo[] = [];

        let commonDescriptors;

        convertor.loadOAPI3Structure(oasSchema);
        commonDescriptors = convertor.getOAPI3EntryPoints(context, metainfo);

        expect(metainfo.length).toBe(1);

        const [methodMeta] = metainfo;
        const baseTypeName = _.upperFirst(_.get(oasSchema, 'paths./{id}.put.operationId'));

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

    // Case 4
    it([
        'should extract meta info for',
        'PATCH with parameters, inline successful responses (201, 202),',
        'inline default error response, required body request'
    ].join(' '), () => {
        const oasSchema = require('./mocks/oas3/04-case-simplest-patch.json');
        const sceeningApiMeta: ApiMetaInfo = require(
            './mocks/screening/04-case-simplest-patch.json'
        );

        const context = {};
        const metainfo: ApiMetaInfo[] = [];

        let commonDescriptors;

        convertor.loadOAPI3Structure(oasSchema);
        commonDescriptors = convertor.getOAPI3EntryPoints(context, metainfo);

        expect(metainfo.length).toBe(1);

        const [methodMeta] = metainfo;
        const baseTypeName = _.upperFirst(_.get(oasSchema, 'paths./{id}.patch.operationId'));

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

// TODO do extract server info by operationId
// TODO do extract examples by operationId
