import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, posix } from 'node:path';
import {
  createProgram,
  flattenDiagnosticMessageText,
  getPreEmitDiagnostics,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
} from 'typescript';

import { jsonSchemaToTypescript } from '../../json-schema-to-typescript';
import type {
  TypescriptParserVisitorResult,
} from '../../typescript-parser-visitor-result';

/* eslint-disable max-len -- Exact generated TypeScript output is compared verbatim. */

const fixturePath = join(
  __dirname,
  '../__fixtures__/oas3-inventory.json',
);

const fileLayoutFixturePath = join(
  __dirname,
  '../__fixtures__/oas3-file-layout.json',
);

const eventComponentsFixturePath = join(
  __dirname,
  '../__fixtures__/oas3-event-components.json',
);

const arrayResponseComponentsFixturePath = join(
  __dirname,
  '../__fixtures__/oas3-array-response-components.json',
);

const operationIdentitiesFixturePath = join(
  __dirname,
  '../__fixtures__/oas3-operation-identities.json',
);

const operationBreadcrumbsFixturePath = join(
  __dirname,
  '../__fixtures__/oas3-operation-breadcrumbs.json',
);

async function renderDeclaration(
  items: TypescriptParserVisitorResult[],
  name: string,
): Promise<string> {
  const item = items.find(({ identifierName }) => (
    identifierName === name
  ));

  if (!item) {
    throw new Error(`Missing generated declaration ${name}.`);
  }

  return item.toString();
}

describe('OpenAPI visitors', () => {
  it('renders a parameter referencing a hyphenated component name', async () => {
    const groups = await jsonSchemaToTypescript({
      jsoncTextData: JSON.stringify({
        openapi: '3.0.3',
        info: { title: 'Advisory API', version: '1.0.0' },
        paths: {
          '/advisories': {
            get: {
              operationId: 'listAdvisories',
              parameters: [{
                in: 'query',
                name: 'ecosystem',
                schema: {
                  $ref: '#/components/schemas/security-advisory-ecosystems',
                },
              }],
              responses: { '200': { description: 'OK' } },
            },
          },
        },
        components: {
          schemas: {
            'security-advisory-ecosystems': { type: 'string' },
          },
        },
      }),
      mode: 'singleFile',
      srcFileId: 'advisory-api.json',
    });

    expect(await renderDeclaration(
      groups[0].groupedItems,
      'QueryParametersListAdvisories',
    )).toBe(`export interface QueryParametersListAdvisories {
    ecosystem?: SecurityAdvisoryEcosystems;
}`);
  });

  it('renders namespaces and conditional request and response declarations', async () => {
    const groups = await jsonSchemaToTypescript({
      mode: 'singleFile',
      srcFilePath: fixturePath,
    });

    const items = groups[0].groupedItems;

    expect(items.find(({ identifierName }) => (
      identifierName === 'InventoryService'
    ))?.keySnippet).toBe('export namespace InventoryService');

    expect(await renderDeclaration(items, 'InventoryService')).toBe(
      `export namespace InventoryService {
    export namespace Inventory {
        /**
         * #### Original info
         *
         * - Path: \`/items/{itemId}\`
         * - Method: \`DELETE\`
         * - Operation ID: \`inventory/deleteItem\`
         * - Tags: \`Catalog\`
         */
        export namespace DeleteItem {
            export type Request = InventoryDeleteItem.Request;
            export type RequestHeaders = InventoryDeleteItem.RequestHeaders;
            export type Response<TCode extends 204 = 204> = InventoryDeleteItem.Response<TCode>;
            export type ResponseHeaders<TCode extends 204 = 204> = InventoryDeleteItem.ResponseHeaders<TCode>;
        }
        /**
         * #### Original info
         *
         * - Path: \`/items/{itemId}\`
         * - Method: \`GET\`
         * - Operation ID: \`inventory/getItem\`
         * - Tags: \`Catalog\`
         */
        export namespace GetItem {
            export type PathParameters = InventoryGetItem.PathParameters;
            export type QueryParameters = InventoryGetItem.QueryParameters;
            export type Response<TCode extends 200 | 404 = 200 | 404, TContentType extends "application/json" | "application/problem+json" = "application/json" | "application/problem+json"> = InventoryGetItem.Response<TCode, TContentType>;
            export type ResponseHeaders<TCode extends 200 | 404 = 200 | 404> = InventoryGetItem.ResponseHeaders<TCode>;
            /**
             * Flat list of all utility data types used by this OpenAPI declaration
             * and defined in the specification.
             */
            export namespace Lib {
                export type Item = InventoryGetItem.Lib.Item;
                export type Problem = InventoryGetItem.Lib.Problem;
            }
        }
        /**
         * #### Original info
         *
         * - Path: \`/items/{itemId}\`
         * - Method: \`POST\`
         * - Operation ID: \`inventory/createItem\`
         * - Tags: \`Catalog\`
         */
        export namespace CreateItem {
            export type Request<TContentType extends "application/json" | "text/plain" = "application/json" | "text/plain"> = InventoryCreateItem.Request<TContentType>;
            export type Response<TCode extends 201 = 201, TContentType extends "application/json" = "application/json"> = InventoryCreateItem.Response<TCode, TContentType>;
            /**
             * Flat list of all utility data types used by this OpenAPI declaration
             * and defined in the specification.
             */
            export namespace Lib {
                export type Item = InventoryCreateItem.Lib.Item;
            }
        }
    }
    /**
     * Flat list of all utility data types used by this OpenAPI declaration
     * and defined in the specification.
     *
     * These types are also available through nested namespace paths,
     * such as {@link Inventory.GetItem.Lib}.
     */
    export namespace Lib {
        export type Item = Inventory.CreateItem.Lib.Item;
        export type Problem = Inventory.GetItem.Lib.Problem;
    }
}`,
    );

    expect(await renderDeclaration(items, 'RequestInventoryCreateItem')).toBe(
      `export type RequestInventoryCreateItem<TContentType extends "application/json" | "text/plain" = "application/json" | "text/plain"> = TContentType extends "application/json" ? Item : TContentType extends "text/plain" ? string : never;`,
    );

    expect(await renderDeclaration(items, 'ResponseInventoryGetItem')).toBe(
      `export type ResponseInventoryGetItem<TCode extends 200 | 404 = 200 | 404, TContentType extends "application/json" | "application/problem+json" = "application/json" | "application/problem+json"> = TCode extends 200 ? TContentType extends "application/json" ? Item : never : TCode extends 404 ? TContentType extends "application/problem+json" ? Problem : never : unknown;`,
    );

    expect(await renderDeclaration(items, 'InventoryGetItem')).toBe(
      `/**
 * #### Original info
 *
 * - Path: \`/items/{itemId}\`
 * - Method: \`GET\`
 * - Operation ID: \`inventory/getItem\`
 * - Tags: \`Catalog\`
 */
export namespace InventoryGetItem {
    export type PathParameters = PathParametersInventoryGetItem;
    export type QueryParameters = QueryParametersInventoryGetItem;
    export type Response<TCode extends 200 | 404 = 200 | 404, TContentType extends "application/json" | "application/problem+json" = "application/json" | "application/problem+json"> = ResponseInventoryGetItem<TCode, TContentType>;
    export type ResponseHeaders<TCode extends 200 | 404 = 200 | 404> = ResponseHeadersInventoryGetItem<TCode>;
    /**
     * Flat list of all utility data types used by this OpenAPI declaration
     * and defined in the specification.
     */
    export namespace Lib {
        export type Item = __Item;
        export type Problem = __Problem;
    }
}`,
    );

    expect(await renderDeclaration(items, 'InventoryDeleteItem')).toBe(
      `/**
 * #### Original info
 *
 * - Path: \`/items/{itemId}\`
 * - Method: \`DELETE\`
 * - Operation ID: \`inventory/deleteItem\`
 * - Tags: \`Catalog\`
 */
export namespace InventoryDeleteItem {
    export type Request = RequestInventoryDeleteItem;
    export type RequestHeaders = RequestHeadersInventoryDeleteItem;
    export type Response<TCode extends 204 = 204> = ResponseInventoryDeleteItem<TCode>;
    export type ResponseHeaders<TCode extends 204 = 204> = ResponseHeadersInventoryDeleteItem<TCode>;
}`,
    );

    expect(await renderDeclaration(items, 'ResponseHeadersInventoryGetItem')).toBe(
      `export type ResponseHeadersInventoryGetItem<TCode extends 200 | 404 = 200 | 404> = TCode extends 200 ? {
    "X-Request-Id"?: string;
} : unknown;`,
    );

    expect(items.some(({ transitiveNode }) => (
      transitiveNode.type === 'contentTypeRecord'
      || transitiveNode.type === 'responseContentRecord'
    ))).toBe(false);
  });

  it('uses the source filename when the title is absent', async () => {
    const groups = await jsonSchemaToTypescript({
      jsoncTextData: JSON.stringify({
        openapi: '3.0.3',
        info: { version: '1.0.0' },
        paths: {
          '/ping': {
            get: {
              operationId: 'getPing',
              responses: { 200: { description: 'OK' } },
            },
          },
        },
      }),
      mode: 'separateFiles',
      srcFileId: 'oas3-title-absent.json',
    });

    const documentGroup = groups.find(({ groupedItems }) => (
      groupedItems.some(({ identifierName }) => (
        identifierName === 'Oas3TitleAbsent'
      ))
    ));

    expect(documentGroup?.fileName).toBe('index.ts');
    expect(groups.map(({ fileName }) => fileName)).toEqual([
      'index.ts',
      'get-ping/index.ts',
      'get-ping/response-get-ping.ts',
    ]);
    expect(await documentGroup?.toString()).toBe(`import type * as _GetPing from './get-ping';

export namespace Oas3TitleAbsent {
  export namespace GetPing {
    export type ResponseGetPing = _GetPing.ResponseGetPing;
  }
}

export type { Oas3TitleAbsent as default };`);
  });

  it('uses every operationId segment to keep declaration names distinct', async () => {
    const groups = await jsonSchemaToTypescript({
      mode: 'singleFile',
      srcFilePath: operationIdentitiesFixturePath,
    });

    expect(await groups[0].toString()).toBe(`export namespace DirectoryApi {
  export namespace Products {
    /**
     * #### Original info
     *
     * - Path: \`/products\`
     * - Method: \`GET\`
     * - Operation ID: \`products/list\`
     */
    export namespace List {
      export type Response = ProductsList.Response;
    }
  }
  export namespace Users {
    /**
     * #### Original info
     *
     * - Path: \`/users\`
     * - Method: \`GET\`
     * - Operation ID: \`users/list\`
     */
    export namespace List {
      export type Response = UsersList.Response;
    }
  }
}

/**
 * #### Original info
 *
 * - Path: \`/users\`
 * - Method: \`GET\`
 * - Operation ID: \`users/list\`
 */
export namespace UsersList {
  export type Response = ResponseUsersList;
}

export type ResponseUsersList = unknown;

/**
 * #### Original info
 *
 * - Path: \`/products\`
 * - Method: \`GET\`
 * - Operation ID: \`products/list\`
 */
export namespace ProductsList {
  export type Response = ResponseProductsList;
}

export type ResponseProductsList = unknown;`);
  });

  it('uses the shortest distinct tag suffix for document namespaces', async () => {
    const groups = await jsonSchemaToTypescript({
      jsoncTextData: JSON.stringify({
        openapi: '3.1.0',
        info: { title: 'Tagged API', version: '1.0.0' },
        paths: {
          '/advisories': {
            get: {
              operationId: 'security-advisories/list',
              tags: ['security-advisories.security-advisories'],
              responses: { 200: { description: 'Listed' } },
            },
          },
          '/alpha': {
            get: {
              operationId: 'shared/read',
              tags: ['alpha'],
              responses: { 200: { description: 'Read' } },
            },
          },
          '/beta': {
            get: {
              operationId: 'shared/write',
              tags: ['beta'],
              responses: { 200: { description: 'Written' } },
            },
          },
          '/north': {
            get: {
              operationId: 'common/read',
              tags: ['north.team'],
              responses: { 200: { description: 'Read' } },
            },
          },
          '/south': {
            get: {
              operationId: 'common/write',
              tags: ['south.team'],
              responses: { 200: { description: 'Written' } },
            },
          },
        },
      }),
      mode: 'singleFile',
      srcFileId: 'tagged-api.json',
    });

    expect(await renderDeclaration(
      groups[0].groupedItems,
      'TaggedApi',
    )).toBe(`export namespace TaggedApi {
    export namespace SecurityAdvisories {
        /**
         * #### Original info
         *
         * - Path: \`/advisories\`
         * - Method: \`GET\`
         * - Operation ID: \`security-advisories/list\`
         * - Tags: \`security-advisories.security-advisories\`
         */
        export namespace List {
            export type Response = SecurityAdvisoriesList.Response;
        }
    }
    export namespace AlphaShared {
        /**
         * #### Original info
         *
         * - Path: \`/alpha\`
         * - Method: \`GET\`
         * - Operation ID: \`shared/read\`
         * - Tags: \`alpha\`
         */
        export namespace Read {
            export type Response = SharedRead.Response;
        }
    }
    export namespace BetaShared {
        /**
         * #### Original info
         *
         * - Path: \`/beta\`
         * - Method: \`GET\`
         * - Operation ID: \`shared/write\`
         * - Tags: \`beta\`
         */
        export namespace Write {
            export type Response = SharedWrite.Response;
        }
    }
    export namespace NorthTeamCommon {
        /**
         * #### Original info
         *
         * - Path: \`/north\`
         * - Method: \`GET\`
         * - Operation ID: \`common/read\`
         * - Tags: \`north.team\`
         */
        export namespace Read {
            export type Response = CommonRead.Response;
        }
    }
    export namespace SouthTeamCommon {
        /**
         * #### Original info
         *
         * - Path: \`/south\`
         * - Method: \`GET\`
         * - Operation ID: \`common/write\`
         * - Tags: \`south.team\`
         */
        export namespace Write {
            export type Response = CommonWrite.Response;
        }
    }
}`);
  });

  it('exposes component schemas and resolves document Lib collisions', async () => {
    const groups = await jsonSchemaToTypescript({
      jsoncTextData: JSON.stringify({
        openapi: '3.1.0',
        info: { title: 'Context API', version: '1.0.0' },
        paths: {
          '/users/{username}/context': {
            get: {
              operationId: 'users-get-context-for-user',
              tags: ['Lib'],
              responses: {
                200: {
                  description: 'Context',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Hovercard' },
                    },
                  },
                },
              },
            },
          },
          '/health': {
            get: {
              operationId: 'getHealth',
              tags: ['LibApi'],
              responses: { 204: { description: 'Healthy' } },
            },
          },
        },
        components: {
          schemas: {
            Hovercard: {
              description: 'A user context card.',
              type: 'object',
              properties: {
                context: { type: 'string' },
                owner: { $ref: '#/components/schemas/User' },
              },
            },
            User: {
              description: 'The owner of a context card.',
              type: 'object',
              properties: { id: { type: 'integer' } },
            },
          },
        },
      }),
      mode: 'singleFile',
      srcFileId: 'context-api.json',
    });

    expect(await renderDeclaration(
      groups[0].groupedItems,
      'ContextApi',
    )).toBe(`export namespace ContextApi {
    export namespace Lib {
        /**
         * #### Original info
         *
         * - Path: \`/users/{username}/context\`
         * - Method: \`GET\`
         * - Operation ID: \`users-get-context-for-user\`
         * - Tags: \`Lib\`
         */
        export namespace UsersGetContextForUserEndpoint {
            export type Response<TCode extends 200 = 200, TContentType extends "application/json" = "application/json"> = UsersGetContextForUser.Response<TCode, TContentType>;
            /**
             * Flat list of all utility data types used by this OpenAPI declaration
             * and defined in the specification.
             */
            export namespace Lib {
                /**
                 * A user context card.
                 */
                export type Hovercard = UsersGetContextForUser.Lib.Hovercard;
                /**
                 * The owner of a context card.
                 */
                export type User = UsersGetContextForUser.Lib.User;
            }
        }
    }
    export namespace LibApi {
        /**
         * #### Original info
         *
         * - Path: \`/health\`
         * - Method: \`GET\`
         * - Operation ID: \`getHealth\`
         * - Tags: \`LibApi\`
         */
        export namespace GetHealthEndpoint {
            export type Response = GetHealth.Response;
        }
    }
    /**
     * Flat list of all utility data types used by this OpenAPI declaration
     * and defined in the specification.
     *
     * These types are also available through nested namespace paths,
     * such as {@link Lib.UsersGetContextForUserEndpoint.Lib}.
     */
    export namespace LibApi1 {
        /**
         * A user context card.
         */
        export type Hovercard = Lib.UsersGetContextForUserEndpoint.Lib.Hovercard;
        /**
         * The owner of a context card.
         */
        export type User = Lib.UsersGetContextForUserEndpoint.Lib.User;
    }
}`);

    expect(await renderDeclaration(
      groups[0].groupedItems,
      'UsersGetContextForUser',
    )).toBe(`/**
 * #### Original info
 *
 * - Path: \`/users/{username}/context\`
 * - Method: \`GET\`
 * - Operation ID: \`users-get-context-for-user\`
 * - Tags: \`Lib\`
 */
export namespace UsersGetContextForUser {
    export type Response<TCode extends 200 = 200, TContentType extends "application/json" = "application/json"> = ResponseUsersGetContextForUser<TCode, TContentType>;
    /**
     * Flat list of all utility data types used by this OpenAPI declaration
     * and defined in the specification.
     */
    export namespace Lib {
        /**
         * A user context card.
         */
        export type Hovercard = __Hovercard;
        /**
         * The owner of a context card.
         */
        export type User = __User;
    }
}`);
  });

  it('places operations and shared schemas in their narrowest directories', async () => {
    const transformedPaths: string[] = [];

    const groups = await jsonSchemaToTypescript({
      mode: 'separateFiles',
      srcFilePath: fileLayoutFixturePath,
      typescriptVisitorOptions: {
        transformFilePath: (filePath) => {
          transformedPaths.push(filePath);

          return posix.join('generated', filePath);
        },
      },
    });

    const fileEntries = groups.flatMap(({ fileName, groupedItems }) => {
      const identifierName = groupedItems[0]?.identifierName;

      return identifierName ? [[identifierName, fileName]] : [];
    });

    const filesByName = Object.fromEntries(fileEntries);

    expect(filesByName).toEqual({
      CommerceApi: 'generated/index.ts',
      GetHealth: 'generated/get-health/index.ts',
      ResponseGetHealth: 'generated/get-health/response-get-health.ts',
      GetReport: 'generated/analytics/index.ts',
      ResponseGetReport: 'generated/analytics/response-get-report.ts',
      Report: 'generated/analytics/report.ts',
      GetCatalog: 'generated/catalog/get/index.ts',
      ResponseGetCatalog: 'generated/catalog/get/response-get-catalog.ts',
      ListItems: 'generated/catalog/list-items/index.ts',
      ResponseListItems: 'generated/catalog/list-items/response-list-items.ts',
      GetItem: 'generated/catalog/get-item/index.ts',
      ResponseGetItem: 'generated/catalog/get-item/response-get-item.ts',
      ItemError: 'generated/catalog/get-item/item-error.ts',
      Item: 'generated/catalog/_common/item.ts',
      Address: 'generated/catalog/_common/address.ts',
      SharedMetadata: 'generated/_common/shared-metadata.ts',
      SharedCode: 'generated/_common/shared-code.ts',
    });

    expect(transformedPaths).toContain('catalog/get-item/index.ts');
    expect(transformedPaths).toContain('catalog/get/index.ts');
    expect(transformedPaths).not.toContain('catalog/catalog/index.ts');
    expect(transformedPaths).toContain('_common/shared-metadata.ts');

    const itemGroup = groups.find(({ fileName }) => (
      fileName === filesByName['Item']
    ));

    expect(await itemGroup?.toString()).toBe(`import type { Address } from './address';
import type { SharedMetadata } from '../../_common/shared-metadata';

export interface Item {
  id: string;
  address?: Address;
  metadata?: SharedMetadata;
}`);
  });

  it('uses operation breadcrumbs before HTTP paths for file scopes', async () => {
    const groups = await jsonSchemaToTypescript({
      mode: 'separateFiles',
      srcFilePath: operationBreadcrumbsFixturePath,
    });

    const fileByName = Object.fromEntries(groups.flatMap(({
      fileName,
      groupedItems,
    }) => (
      groupedItems.flatMap(({ identifierName }) => (
        identifierName ? [[identifierName, fileName]] : []
      ))
    )));

    expect(fileByName).toMatchObject({
      ActionsDeleteArtifact: 'actions/delete-artifact/index.ts',
      ActionsDeleteRequest: 'actions/delete-request/index.ts',
      DeleteArtifact: 'actions/delete/index.ts',
      Artifact: 'actions/_common/artifact.ts',
      GetHealthClusterId: 'health/by-cluster-id/index.ts',
      GetHealthStatus: 'health/status/index.ts',
    });
  });

  it('uses a custom common directory name at the shared scope', async () => {
    const getCommonDirectoryName = jest.fn((
      path: string[],
      _otherDirectoriesAtParent: string[],
    ) => (path.length ? '_shared' : '_root-shared'));

    const groups = await jsonSchemaToTypescript({
      mode: 'separateFiles',
      srcFilePath: operationBreadcrumbsFixturePath,
      typescriptVisitorOptions: { getCommonDirectoryName },
    });

    const artifactGroup = groups.find(({ groupedItems }) => (
      groupedItems.some(({ identifierName }) => (
        identifierName === 'Artifact'
      ))
    ));

    expect(artifactGroup?.fileName).toBe('actions/_shared/artifact.ts');
    expect(getCommonDirectoryName).toHaveBeenCalledWith(
      ['actions'],
      expect.arrayContaining([
        'delete',
        'delete-artifact',
        'delete-request',
      ]),
    );
  });

  it('places exclusive event components beside their direct consumer', async () => {
    const groups = await jsonSchemaToTypescript({
      mode: 'separateFiles',
      srcFilePath: eventComponentsFixturePath,
    });

    const fileEntries = groups.flatMap(({ fileName, groupedItems }) => (
      groupedItems.flatMap(({ identifierName }) => (
        identifierName ? [[identifierName, fileName]] : []
      ))
    ));

    expect(Object.fromEntries(fileEntries)).toEqual({
      ActivityApi: 'index.ts',
      ListEvents: 'activity/index.ts',
      ResponseListEvents: 'activity/response-list-events.ts',
      Event: 'activity/event.ts',
      Actor: 'activity/actor.ts',
      CommitCommentEvent: 'activity/commit-comment-event.ts',
      ForkEvent: 'activity/fork-event.ts',
    });

    const eventGroup = groups.find(({ groupedItems }) => (
      groupedItems.some(({ identifierName }) => (
        identifierName === 'Event'
      ))
    ));

    expect(await eventGroup?.toString()).toBe(`import type { Actor } from './actor';
import type { CommitCommentEvent } from './commit-comment-event';
import type { ForkEvent } from './fork-event';

export interface Event {
  actor?: Actor;
  payload?: CommitCommentEvent | ForkEvent;
}`);
  });

  it('compacts a lone component child beside its response consumer', async () => {
    const groups = await jsonSchemaToTypescript({
      mode: 'separateFiles',
      srcFilePath: arrayResponseComponentsFixturePath,
    });

    const filesByName = Object.fromEntries(groups.flatMap(({
      fileName,
      groupedItems,
    }) => (
      groupedItems.flatMap(({ identifierName }) => (
        identifierName ? [[identifierName, fileName]] : []
      ))
    )));

    expect(filesByName).toEqual({
      ActivityApi: 'index.ts',
      ActivityGetApiRequests: 'activity/index.ts',
      ResponseActivityGetApiRequests: 'activity/response-activity-get-api-requests.ts',
      ActivityGetApiRequestsResponse: 'activity/activity-get-api-requests-response.ts',
      ApiRequest: 'activity/api-request.ts',
    });

    const responseGroup = groups.find(({ groupedItems }) => (
      groupedItems.some(({ identifierName }) => (
        identifierName === 'ActivityGetApiRequestsResponse'
      ))
    ));

    expect(await responseGroup?.toString()).toBe(`import type { ApiRequest } from './api-request';

export type ActivityGetApiRequestsResponse = ApiRequest[];`);
  });

  it('moves a schema shared across tags into common', async () => {
    const schema = { $ref: '#/components/schemas/Shared' };

    const groups = await jsonSchemaToTypescript({
      jsoncTextData: JSON.stringify({
        openapi: '3.1.0',
        info: { title: 'Shared API', version: '1.0.0' },
        paths: {
          '/shared': {
            get: {
              operationId: 'readShared',
              tags: ['Readers'],
              responses: {
                200: {
                  description: 'Shared item',
                  content: { 'application/json': { schema } },
                },
              },
            },
            post: {
              operationId: 'writeShared',
              tags: ['Writers'],
              requestBody: {
                content: { 'application/json': { schema } },
              },
              responses: { 204: { description: 'Saved' } },
            },
          },
        },
        components: {
          schemas: {
            Shared: {
              type: 'object',
              properties: { id: { type: 'string' } },
            },
          },
        },
      }),
      mode: 'separateFiles',
      srcFileId: 'shared-api.json',
    });

    const sharedGroup = groups.find(({ groupedItems }) => (
      groupedItems.some(({ identifierName }) => identifierName === 'Shared')
    ));

    expect(sharedGroup?.fileName).toBe('_common/shared.ts');
    expect(await sharedGroup?.toString()).toBe(`export interface Shared {
  id?: string;
}`);
  });

  it('keeps JSON Schema declarations at the root without OpenAPI nodes', async () => {
    const groups = await jsonSchemaToTypescript({
      jsoncTextData: JSON.stringify({
        title: 'Plain Object',
        type: 'object',
        properties: { id: { type: 'string' } },
      }),
      mode: 'separateFiles',
      srcFileId: 'plain-object.json',
    });

    expect(groups.map(({ fileName }) => fileName)).toEqual([
      'plain-object.ts',
    ]);
  });

  it('compiles separate files with verbatim module syntax', async () => {
    const groups = await jsonSchemaToTypescript({
      mode: 'separateFiles',
      srcFilePath: fixturePath,
    });

    const documentGroup = groups.find(({ groupedItems }) => (
      groupedItems.some(({ identifierName }) => (
        identifierName === 'InventoryService'
      ))
    ));

    expect(documentGroup?.fileName).toBe('index.ts');
    expect(groups.find(({ fileName }) => (
      fileName === 'catalog/_common/item.ts'
    ))).toBeDefined();
    expect(await groups.find(({ fileName }) => (
      fileName === 'catalog/get-item/response-headers-inventory-get-item.ts'
    ))?.toString()).toBe(
      `export type ResponseHeadersInventoryGetItem<TCode extends 200 | 404 = 200 | 404> =
  TCode extends 200
    ? {
        'X-Request-Id'?: string;
      }
    : unknown;`,
    );

    expect(await groups.find(({ fileName }) => (
      fileName === 'catalog/get-item/index.ts'
    ))?.toString()).toBe(`export type { ResponseInventoryGetItem } from './response-inventory-get-item';
export type { ResponseHeadersInventoryGetItem } from './response-headers-inventory-get-item';
export type { Problem } from './problem';
export type { QueryParametersInventoryGetItem } from './query-parameters-inventory-get-item';
export type { PathParametersInventoryGetItem } from './path-parameters-inventory-get-item';`);

    const outputDirectory = mkdtempSync(join(tmpdir(), 'codegena-oas3-'));

    try {
      const fileNames = await Promise.all(groups.map(async (group) => {
        const fileName = join(outputDirectory, group.fileName);

        mkdirSync(dirname(fileName), { recursive: true });
        writeFileSync(fileName, await group.toString());

        return fileName;
      }));

      const usageFileName = join(outputDirectory, 'usage.ts');

      const usageSource = `import type InventoryService from './index';
import type { RequestInventoryCreateItem } from './catalog/create-item/request-inventory-create-item';
import type { ResponseInventoryGetItem } from './catalog/get-item/response-inventory-get-item';

const jsonRequest: RequestInventoryCreateItem<'application/json'> = { id: 'item-1' };
const textRequest: RequestInventoryCreateItem<'text/plain'> = 'item-1';
const notFound: ResponseInventoryGetItem<404, 'application/problem+json'> = {
  detail: 'Missing',
};
const found: InventoryService.Catalog.GetItem.ResponseInventoryGetItem<
  200,
  'application/json'
> = jsonRequest;
const missingHeaders: InventoryService.Catalog.GetItem.ResponseHeadersInventoryGetItem<
  404
> = {};
const item: InventoryService.Lib.Item = jsonRequest;
const problem: InventoryService.Catalog.GetItem.Problem = {
  detail: 'Missing',
};

// @ts-expect-error text/plain requests are strings.
const invalid: RequestInventoryCreateItem<'text/plain'> = jsonRequest;

void [textRequest, notFound, found, missingHeaders, item, problem, invalid];`;

      writeFileSync(usageFileName, usageSource);

      const program = createProgram([...fileNames, usageFileName], {
        module: ModuleKind.ESNext,
        moduleResolution: ModuleResolutionKind.Bundler,
        noEmit: true,
        skipLibCheck: true,
        strict: true,
        target: ScriptTarget.ES2022,
        verbatimModuleSyntax: true,
      });

      const diagnostics = getPreEmitDiagnostics(program)
        .map(({ messageText }) => (
          flattenDiagnosticMessageText(messageText, '\n')
        ));

      expect(diagnostics).toEqual([]);
    }
    finally {
      rmSync(outputDirectory, { force: true, recursive: true });
    }
  });

  it('keeps a declaration named Index and supports numeric OpenAPI paths', async () => {
    const response = {
      description: 'Version index',
      content: {
        'application/json': { schema: { $ref: '#/components/schemas/Index' } },
      },
    };
    const groups = await jsonSchemaToTypescript({
      jsoncTextData: JSON.stringify({
        openapi: '3.0.3',
        info: { title: 'Versions', version: '1.0.0' },
        paths: {
          '/2024': { get: { responses: { 200: response } } },
          '/latest': { get: { responses: { 200: response } } },
        },
        components: { schemas: { Index: { type: 'string' } } },
      }),
      mode: 'separateFiles',
      srcFileId: 'versions.json',
    });

    const document = groups.find(({ fileName }) => fileName === 'index.ts');
    const index = groups.find(({ fileName }) => fileName === '_common/index.ts');
    const barrel = groups.find(({ fileName }) => fileName === '_common/barrel.ts');

    expect(await document?.toString()).toContain('export namespace _2024 {');
    expect(await index?.toString()).toBe('export type Index = string;');
    expect(await barrel?.toString()).toBe('export type { Index } from \'./index\';');
    expect(barrel?.relatedGroups).toEqual([index]);
    expect(document?.relatedGroups).toContain(barrel);
  });
});
