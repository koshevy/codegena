import { Convertor } from './convertor';
import { defaultConfig } from '../../core/config';
import { ApiMetaInfo } from '../../core/api-meta-info';

import _ from 'lodash';

import { AllOfTypeScriptDescriptor } from './descriptors/all-of';
import { ArrayTypeScriptDescriptor } from './descriptors/array';
import { GenericDescriptor } from './descriptors/generic';
import { NullTypeScriptDescriptor } from './descriptors/null';
import { NumberTypeScriptDescriptor } from './descriptors/number';
import { ObjectTypeScriptDescriptor } from './descriptors/object';

describe('Typescript convertor isolated schema\'s rendering', () => {
    let convertor: Convertor;
    let schemaCases;

    beforeAll(() => {
        schemaCases = require('./mocks/isolated-schemas.json');
    });

    beforeEach(() => {
        convertor = new Convertor(defaultConfig);
    });

    it('should convert numeric scheme as root', () => {
        const cases = schemaCases.simple;
        const container = convertor.convert(
            cases.number,
            {},
            'SimpleNumericType'
        ) as [NumberTypeScriptDescriptor];
        const [descriptor] = container;
        const comments = descriptor.getComments();

        expect(container.length).toBe(1);
        expect(descriptor instanceof NumberTypeScriptDescriptor).toBeTruthy();
        expect(comments).toContain('* ## Simple number schema');
        expect(comments).toContain('* Should be converted in numeric type descriptor');
        expect(descriptor.render([], false))
            .toBe('number');
        // Should contain comment
        expect(descriptor.render([], true))
            .toContain(comments);
    });

    it('should convert numeric scheme with suggested name as root', () => {
        const cases = schemaCases.simple;
        const container = convertor.convert(
            cases.number,
            {},
            null,
            'SuggestedSimpleNumericType'
        ) as [NumberTypeScriptDescriptor];
        const [descriptor] = container;
        const comments = descriptor.getComments();

        expect(descriptor.render([], true))
            .toContain('SuggestedSimpleNumericType');
    });

    it('should throw error at rendering anonymous numeric scheme as root', () => {
        const cases = schemaCases.simple;
        const container = convertor.convert(
            cases.number,
            {}
        ) as [NumberTypeScriptDescriptor];
        const [descriptor] = container;

        expect(() => descriptor.render([], true))
            .toThrow();
    });

    it('should convert array scheme as array of any', () => {
        const cases = schemaCases.simple;
        const container = convertor.convert(
            cases.arrayOfAny,
            {},
            'ArrayOfAny'
        ) as [ArrayTypeScriptDescriptor];
        const [descriptor] = container;
        const renderedArray = descriptor.render([], true);

        expect(renderedArray.replace(/\s+/g, ' ').trim()).toBe([
            `/**`,
            `* ## Simple array with common item definitions (any)`,
            `*/`,
            `export type ArrayOfAny = any[];`
        ].join(' '));
    });

    it('should convert array scheme as array of objects', () => {
        const cases = schemaCases.simple;
        const container = convertor.convert(
            cases.arrayOfObjects,
            {},
            'ArrayOfObjects'
        ) as [ArrayTypeScriptDescriptor];
        const [descriptor] = container;
        const renderedArray = descriptor.render([], true);

        expect(renderedArray.replace(/\s+/g, ' ').trim()).toBe([
            `/**`,
            `* ## Simple array with common item definitions (objects)`,
            `*/`,
            `export type ArrayOfObjects = Array<{`,
            `[key: string]: any;`,
            `}>;`
        ].join(' '));
    });

    it('should convert array scheme as array of arrays', () => {
        const cases = schemaCases.simple;
        const container = convertor.convert(
            cases.arrayOfArrays,
            {},
            'ArrayOfArrays'
        ) as [ArrayTypeScriptDescriptor];
        const [descriptor] = container;
        const renderedArray = descriptor.render([], true);

        expect(renderedArray.replace(/\s+/g, ' ').trim()).toBe([
            `/**`,
            `* ## Simple array with common item definitions (arrays)`,
            `*/`,
            `export type ArrayOfArrays = Array<Array<number>>;`,
        ].join(' '));
    });

    it('should convert array scheme with exactly items order', () => {
        const cases = schemaCases.simple;
        const container = convertor.convert(
            cases.arrayExactly,
            {},
            'ArrayWithExactlyOrder'
        ) as [ArrayTypeScriptDescriptor];
        const [descriptor] = container;
        const renderedArray = descriptor.render([], true);

        expect(renderedArray.replace(/\s+/g, ' ').trim()).toBe([
            `/**`,
            `* ## Simple array with exactly items order`,
            `*/`,
            `export type ArrayWithExactlyOrder = [`,
            `string,`,
            `// String item at first place`,
            `number,`,
            `// Number item at second place`,
            `{`,
            `[key: string]: boolean;`,
            `}`,
            `// Object item at third place`,
            `];`
        ].join(' '));
    });

    it('should convert complex `oneOf`-scheme as root', () => {
        const cases = schemaCases.complex;
        const container = convertor.convert(
            cases.complexOneOf,
            {},
            'ComplexUnionOfObjects'
        ) as [ObjectTypeScriptDescriptor];
        const [descriptor] = container;
        const renderedOneOf = descriptor.render([], true);

        expect(renderedOneOf.replace(/\s+/g, ' ').trim()).toBe([
            `/**`,
            `* ## Complex union schema`,
            `* Complex union of different types with complex condition`,
            `*/`,
            `export type ComplexUnionOfObjects =`,
            `| {`,
            `/**`,
            `* Type of person`,
            `*/`,
            `type: 'individual' | 'person';`,
            `firstName: string;`,
            `lastName: string;`,
            `}`,
            `// First case: a person`,
            `| {`,
            `/**`,
            `* Type of commercial organization`,
            `*/`,
            `type: 'commercial-company' | 'non-government-organization';`,
            `companyName: string;`,
            `branch?: 'it' | 'horeca' | 'retail' | 'sport';`,
            `}`,
            `// Second case: an organization`,
            `| '[PROFILE_FROM_STORAGE]'`,
            `// Information should be obtained by last OPERATION_ID in cookies`,
            `| -1;`,
            `// Information should be obtained by last unsaved request`
        ].join(' '));
    });

    it('should convert simple `allOf`-scheme as root', () => {
        const cases = schemaCases.complex;
        const container = convertor.convert(
            cases.simpleAllOf,
            {},
            'SimpleMixedAllOfType'
        ) as [ObjectTypeScriptDescriptor];
        const [descriptor] = container;
        const renderedAllOf = descriptor.render([], true);

        expect(renderedAllOf.replace(/\s+/g, ' ').trim()).toBe([
            `/** * ## Simple merging schema * Simple merging of object types */`,
            `export interface SimpleMixedAllOfType { /** * Type of commercial`,
            `organization */ type: 'commercial-company' | 'non-government-organization';`,
            `firstName?: string; lastName: string; companyName: string; branch?:`,
            `'it' | 'horeca' | 'retail' | 'sport'; }`
        ].join(' '));
    });

    it('should convert complex `allOf`-scheme as root', () => {
        const cases = schemaCases.complex;
        const container = convertor.convert(
            cases.complexAllOf,
            {},
            'ComplexMixedAllOfType'
        ) as [ObjectTypeScriptDescriptor];
        const [descriptor] = container;
        const renderedAllOf = descriptor.render([], true);

        expect(renderedAllOf.replace(/\s+/g, ' ').trim()).toBe([
            `/** * ## Complex merging schema * Complex merging of different types`,
            `with complex condition */ export type ComplexMixedAllOfType = |`,
            `{ /** * Type of commercial organization */ type: 'commercial-company'`,
            `| 'non-government-organization'; firstName?: string; lastName: string;`,
            `/** * A rare property added to typical organization data */ readonly`,
            `rareOrganizationCode?: boolean; companyName: string; branch?: 'it' |`,
            `'horeca' | 'retail' | 'sport'; } | '[PROFILE_FROM_STORAGE]' // Information`,
            `should be obtained by last OPERATION_ID in cookies | -1 // Information`,
            `should be obtained by last unsaved request | 1 // Data, wrapped by`,
            `OneOf (1 item) | 2; // Data, wrapped by OneOf (2 item)`
        ].join(' '));
    });

    // TODO At same way do simple tests of string
    // TODO At same way do simple tests of boolean
    // TODO At same way do simple tests of null
    // TODO At same way do simple tests of any
    // TODO At same way do simple tests of enum
    // TODO At same way do simple tests of multitypes ['null', 'number', 'string']

    // FIXME Important test! Array
    // FIXME Important test! Object
    // FIXME Important test! Enum
    // FIXME Important test! Simple anyOf
    // FIXME Important test! Array with object
    // FIXME Important test! Array with array
    // FIXME Important test! Array with enum
    // FIXME Important test! Array with someof
    // FIXME Important test! Object with array and enum and someof
});

describe('Convert and rendering combined schema with $refs to local `#/components/schemas`', () => {
    const oasSchema = require('../../core/mocks/oas3/05-case-combined.json');
    const convertor = new Convertor(defaultConfig);

    const context = {};
    const metainfo: ApiMetaInfo[] = [];

    convertor.loadOAPI3Structure(oasSchema);
    const entryPoints = convertor.getOAPI3EntryPoints(context, metainfo);
    const affectedModels = {};
    const affectedModelsRendered = {};

    const refsInContext = [
        '#/components/schemas/HttpErrorBadRequest',
        '#/components/schemas/HttpErrorConflict',
        '#/components/schemas/HttpErrorNotFound',
        '#/components/schemas/HttpErrorServer',
        '#/components/schemas/JsonError',
        '#/components/schemas/ToDosItem',
        '#/components/schemas/ToDosList'
    ];

    // collect extracted models
    Convertor.renderRecursive(
        entryPoints,
        (desc, text) => {
            const name = desc.modelName || desc.suggestedModelName;
            affectedModels[name] = desc;
            affectedModelsRendered[name] = text;
        },
        []
    );

    // Synthetic models
    describe('should create Request/Response/Parameters models', () => {
        _.each([
            'CreateListItemParameters',
            'CreateListItemRequest',
            'CreateListItemResponse',
            'CreateListRequest',
            'CreateListResponse',
            'GetListItemsParameters',
            'GetListItemsResponse',
            'GetListsParameters',
            'GetListsResponse',
            'RewriteListItemParameters',
            'RewriteListItemRequest',
            'RewriteListItemResponse',
            'RewriteListParameters',
            'RewriteListResponse',
            'RewriteListRequest',
            'UpdateListItemParameters',
            'UpdateListItemRequest',
            'UpdateListItemResponse',
            'UpdateListParameters',
            'UpdateListRequest',
            'UpdateListResponse'
        ], modelName => {
            it(`Cant find generated model: ${modelName}`, () => {
                expect(affectedModels[modelName]).toBeTruthy();
            });
        });
    });

    // Models from `#/components/schemas`
    describe(
        'should affect all related by $ref models in `#/components/schemas`',
        () => {
            // todo migrate to https://jestjs.io/docs/en/api#describeskipeachtablename-fn-1
            _.each([
                'JsonError',
                'HttpErrorBadRequest',
                'HttpErrorConflict',
                'HttpErrorNotFound',
                'HttpErrorServer',
                'ToDosItem',
                'ToDosList'
            ], modelName => {
                it(`Cant find related by $ref model: ${modelName}`, () => {
                    expect(affectedModels[modelName]).toBeTruthy();
                });
            });
        }
    );

    // ***
    // Scrutinize of some models (not all)

    // CreateListRequest
    describe('should correct convert `CreateListRequest` model', () => {
        const createListRequest: GenericDescriptor = affectedModels['CreateListRequest'];
        const jsonRequests = _.get(createListRequest, 'children.application/json');

        it('with `application/json` request, converted to `GenericDescriptor`', () => {
            expect(createListRequest instanceof GenericDescriptor).toBeTruthy();
        });

        it('with request child items converted to ObjectTypeScriptDescriptor', () => {
            expect(jsonRequests).toBeTruthy();
            expect(jsonRequests.length).toBe(1);
            // Model `CreateListRequest` should be converted to `ObjectTypeScriptDescriptor`
            expect(jsonRequests[0] instanceof ObjectTypeScriptDescriptor).toBeTruthy();
        });

        it('with correct context of converting, contained all needed refs', () => {
            expect(_.keys(context).sort()).toEqual(refsInContext);
        });

        // todo migrate to https://jestjs.io/docs/en/api#describeskipeachtablename-fn-1
        _.each(
            refsInContext,
            ref => {
                it(
                    `with corrected converted items in context: ${ref}`,
                    () => {
                        expect(jsonRequests[0].context[ref]).toBeTruthy()
                    })
            }
        );
    });

    // CreateListRequest code
    it('should correct render `CreateListRequest` model', () => {
        const createListRequestCode = affectedModelsRendered['CreateListRequest'];
        expect(createListRequestCode.replace(/\s+/g, ' ').trim()).toBe([
            'export type CreateListRequest< TCode extends \'application/json\'',
            '= \'application/json\' >',
            '= TCode extends \'application/json\'',
            '/**',
            '* ## Todo\'s list',
            '* Object with todo\'s list of items',
            '*/',
            '? ToDosList : any;'
        ].join(' '));
    });

    // createListResponse
    it('should correct convert `CreateListResponse` model', () => {
        const createListResponse: GenericDescriptor = affectedModels['CreateListResponse'];
        const responses = createListResponse.children;
        const response201 = _.get(createListResponse, 'children.201');
        const jsonResponse = _.get(response201, '[0].children.application/json');
        expect(createListResponse instanceof GenericDescriptor).toBeTruthy();
        expect(response201).toBeTruthy();
        expect(_.keys(responses).sort()).toEqual(['201', '400', '500']);
        expect(response201).toBeTruthy();
        expect(response201.length).toBe(1);
        expect(response201[0] instanceof GenericDescriptor).toBeTruthy();
        expect(jsonResponse[0] instanceof ObjectTypeScriptDescriptor).toBeTruthy();
    });

    // createListResponse code
    it('should correct render `CreateListResponse` model', () => {
        const createListResponseCode = affectedModelsRendered['CreateListResponse'];
        expect(createListResponseCode.replace(/\s+/g, ' ').trim()).toBe([
            'export type CreateListResponse<',
            'TCode extends 201 | 400 | 500 =',
            '201 | 400 | 500,',
            'TContentType extends \'application/json\' = \'application/json\'',
            '> = TCode extends 201',
            '? TContentType extends \'application/json\'',
            '/**',
            '* ## Todo\'s list',
            '* Object with todo\'s list of items',
            '*/',
            '? ToDosList',
            ': any',
            ': TCode extends 400',
            '? TContentType extends \'application/json\'',
            '? HttpErrorBadRequest',
            ': any',
            ': TCode extends 500',
            '? TContentType extends \'application/json\'',
            '? HttpErrorServer',
            ': any',
            ': any;'
        ].join(' '));
    });

    // UpdateListParameters
    it('should correct convert `UpdateListParameters` model', () => {
        const updateListParameters: ObjectTypeScriptDescriptor
            = affectedModels['UpdateListParameters'];
        const propertyNames = _.reduce<any, any>(
            updateListParameters.propertiesSets,
            (acc, prop) => {
                acc.push(..._.keys(prop));

                return acc;
            },
            []
        );
        expect(updateListParameters instanceof ObjectTypeScriptDescriptor).toBeTruthy();
        expect(propertyNames).toEqual(['listId', 'forceSave']);
    });

    // // UpdateListParameters code
    it('should correct render `UpdateListParameters` model', () => {
        const updateListParametersCode = affectedModelsRendered['UpdateListParameters'];
        expect(updateListParametersCode.replace(/\s+/g, ' ').trim()).toBe([
            '/** * Model of parameters for API `/lists/{listId}`',
            '*/ export interface UpdateListParameters { /** * Uid',
            'of TODO list */ listId: number; /** * Force save list',
            'despite conflicts */ forceSave?: any; }',
        ].join(' '));
    });

    // RewriteListResponse
    it('should correct convert empty responses (204 in `RewriteListResponse`)', () => {
        const rewriteListResponse: GenericDescriptor = affectedModels['RewriteListResponse'];
        const response204 = _.get(
            rewriteListResponse.children,
            '204[0]'
        ) as any as GenericDescriptor;
        const jsonResponse = _.get(response204.children, 'application/json[0]');

        expect(rewriteListResponse).toBeTruthy();
        expect(rewriteListResponse instanceof GenericDescriptor).toBeTruthy();
        expect(response204).toBeTruthy();
        expect(response204 instanceof GenericDescriptor).toBeTruthy();
        expect(jsonResponse).toBeTruthy();
        expect(jsonResponse instanceof NullTypeScriptDescriptor).toBeTruthy();
    });

    // RewriteListResponse code
    it ('should correct render empty responses (204 in `RewriteListResponse`)', () => {
        const rewriteListResponseCode = affectedModelsRendered['RewriteListResponse'];
        expect(rewriteListResponseCode.replace(/\s+/g, ' ').trim()).toBe([
            `export type RewriteListResponse<`,
            `TCode extends 200 | 204 | 400 | 404 | 409 | 500`,
            `= | 200 | 204 | 400 | 404 | 409 | 500,`,
            `TContentType extends 'application/json' = 'application/json'`,
            `> = TCode extends 200`,
            `? TContentType extends 'application/json'`,
            `/**`,
            `* ## Todo's list`,
            `* Object with todo's list of items`,
            `*/`,
            `? ToDosList`,
            `: any`,
            `: TCode extends 204`,
            `? TContentType extends 'application/json'`,
            `/**`,
            `* No changes. Should no have a response!`,
            `*/`,
            `? null`,
            `: any`,
            `: TCode extends 400`,
            `? TContentType extends 'application/json'`,
            `? HttpErrorBadRequest`,
            `: any`,
            `: TCode extends 404`,
            `? TContentType extends 'application/json'`,
            `? HttpErrorNotFound`,
            `: any`,
            `: TCode extends 409`,
            `? TContentType extends 'application/json'`,
            `? HttpErrorConflict`,
            `: any`,
            `: TCode extends 500`,
            `? TContentType extends 'application/json'`,
            `? HttpErrorServer`,
            `: any`,
            `: any;`
        ].join(' '));
    });

    // UpdateListItemParameters
    it('should correct convert `UpdateListItemParameters` model', () => {
        const updateListParameters: ObjectTypeScriptDescriptor
            = affectedModels['UpdateListItemParameters'];
        const propertyNames = _.reduce<any, any>(
            updateListParameters.propertiesSets,
            (acc, prop) => {
                acc.push(..._.keys(prop));

                return acc;
            },
            []
        );
        expect(updateListParameters instanceof ObjectTypeScriptDescriptor).toBeTruthy();
        expect(propertyNames).toEqual(['listId', 'itemId', 'forceSave']);
    });
});

describe(
    [
        'Convert and rendering advanced combined schema',
        'with $refs to local `#/components/parameters`,',
        '`#/components/responses` and `#/components/requests`'
    ].join(' '),
    () => {
        const oasSchema = require('../../core/mocks/oas3/06-case-combined-advanced.json');
        const convertor = new Convertor(defaultConfig);

        const context = {};
        const metainfo: ApiMetaInfo[] = [];

        convertor.loadOAPI3Structure(oasSchema);
        const entryPoints = convertor.getOAPI3EntryPoints(context, metainfo);
        const affectedModels = {};
        const affectedModelsRendered = {};

        const refsInContext = [
            '#/components/schemas/HttpErrorBadRequest',
            '#/components/schemas/HttpErrorConflict',
            '#/components/schemas/HttpErrorNotFound',
            '#/components/schemas/HttpErrorServer',
            '#/components/schemas/JsonError',
            '#/components/schemas/ToDosItem',
            '#/components/schemas/ToDosList'
        ];

        // collect extracted models
        Convertor.renderRecursive(
            entryPoints,
            (desc, text) => {
                const name = desc.modelName || desc.suggestedModelName;
                affectedModels[name] = desc;
                affectedModelsRendered[name] = text;
            },
            []
        );

        // RewriteListItemParameters
        it('should correct convert `RewriteListItemParameters` model that uses `$ref`', () => {
            const rewriteListItemParameters: ObjectTypeScriptDescriptor
                = affectedModels['RewriteListItemParameters'];
            const propertyNames = _.reduce<any, any>(
                rewriteListItemParameters.propertiesSets,
                (acc, prop) => {
                    acc.push(..._.keys(prop));

                    return acc;
                },
                []
            );
            expect(rewriteListItemParameters instanceof ObjectTypeScriptDescriptor).toBeTruthy();
            expect(propertyNames).toEqual(['listId', 'itemId', 'forceSave']);
        });

        // // RewriteListItemParameters code
        it('should correct convert `RewriteListItemParameters` model that uses `$ref`', () => {
            const rewriteListItemParametersCode
                = affectedModelsRendered['RewriteListItemParameters'];
            expect(rewriteListItemParametersCode.replace(/\s+/g, ' ').trim()).toBe([
                '/** * Model of parameters for API `/list/{listId}/item/{itemId}` */',
                'export interface RewriteListItemParameters { /** * Uid of TODO list */',
                'listId: number; /** * Uid of TODO list item */ itemId: number; /** *',
                'Force save list despite conflicts */ forceSave?: any; }'
            ].join(' '));
        });

        // GetListsResponse
        it('should correct convert `GetListsResponse` that uses `$ref`', () => {
            const getListsResponse: GenericDescriptor = affectedModels['GetListsResponse'];
            const responses = getListsResponse.children;
            const response200 = _.get(getListsResponse, 'children.200');
            const jsonResponse = _.get(response200, '[0].children.application/json');
            expect(getListsResponse instanceof GenericDescriptor).toBeTruthy();
            expect(response200).toBeTruthy();
            expect(_.keys(responses).sort()).toEqual(['200', '400', '500']);
            expect(response200).toBeTruthy();
            expect(response200.length).toBe(1);
            expect(response200[0] instanceof GenericDescriptor).toBeTruthy();
            expect(jsonResponse[0] instanceof AllOfTypeScriptDescriptor).toBeTruthy();
        });
    });

// TODO test extract server info by operationId
// TODO do extract examples by operationId
