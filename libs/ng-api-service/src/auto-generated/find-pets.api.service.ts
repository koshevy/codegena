/* tslint:disable */
import { BehaviorSubject, Subject } from 'rxjs';
import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../lib/';
import { ApiSchema } from '../lib/providers/api-schema';
import { SERVERS_INFO, ServersInfo } from '../lib/';

import {
  API_ERROR_HANDLER,
  ApiErrorHandler,
  DISABLE_VALIDATION,
  RESET_API_SUBSCRIBERS,
  VIRTUAL_CONNECTION_STATUS
} from '../lib/';

// Typings for this API method
import { FindPetsParams, FindPetsResponse } from '../lib/mocks/typings';
// Schemas
import { schema as domainSchema } from '../lib/mocks/oapi-specs/pet-shop';

/**
 * Service for angular based on ApiAgent solution.
 * Provides assured request to API method with implicit
 * validation and common errors handling scheme.
 */
@Injectable()
export class FindPetsService extends ApiService<
  FindPetsResponse,
  null,
  FindPetsParams
> {
  protected get method(): 'GET' {
    return 'GET';
  }

  /**
   * Path template, example: `/some/path/{id}`.
   */
  protected get pathTemplate(): string {
    return '/pets';
  }

  /**
   * Parameters in a query.
   */
  protected get queryParams(): string[] {
    return ['tags', 'limit'];
  }

  /**
   * API servers.
   */
  protected get servers(): string[] {
    return ['http://petstore.swagger.io/api'];
  }

  /**
   * Complete domain API schema (OAS3) with library
   * of models.
   */
  protected get domainSchema(): any {
    return domainSchema;
  }

  /**
   * JSON Schemas using for validations at requests.
   */
  protected get schema(): ApiSchema {
    return {
      params: {
        type: 'object',
        properties: {
          tags: { type: 'array', items: { type: 'string' } },
          limit: { type: 'integer', format: 'int32' }
        }
      },
      request: null,
      response: {
        '200': {
          'application/json': {
            type: 'array',
            items: { $ref: 'petShop#/components/schemas/Pet' }
          }
        },
        default: {
          'application/json': { $ref: 'petShop#/components/schemas/Error' }
        }
      }
    } as any;
  }

  // *** Methods

  constructor(
    protected httpClient: HttpClient,
    @Inject(API_ERROR_HANDLER)
    protected errorHandler: ApiErrorHandler,
    @Inject(SERVERS_INFO)
    protected serversInfo: ServersInfo,
    @Inject(RESET_API_SUBSCRIBERS)
    protected resetApiSubscribers: Subject<void>,
    @Inject(VIRTUAL_CONNECTION_STATUS)
    protected virtualConnectionStatus: BehaviorSubject<boolean>,
    @Optional()
    @Inject(DISABLE_VALIDATION)
    protected disableValidation: boolean
  ) {
    super(
      httpClient,
      errorHandler,
      serversInfo,
      resetApiSubscribers,
      virtualConnectionStatus,
      disableValidation,
      domainSchema
    );
  }
}
