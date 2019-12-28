/* tslint:disable */
import { BehaviorSubject, Subject } from 'rxjs';
import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '@codegena/ng-api-service';
import { ApiSchema } from '@codegena/ng-api-service/lib/providers/api-schema';
import { SERVERS_INFO, ServersInfo } from '@codegena/ng-api-service';

import {
  API_ERROR_HANDLER,
  ApiErrorHandler,
  DISABLE_VALIDATION,
  RESET_API_SUBSCRIBERS,
  VIRTUAL_CONNECTION_STATUS
} from '@codegena/ng-api-service';

// Typings for this API method
import { CreateGroupResponse, CreateGroupRequest } from '../typings';
// Schemas
import { schema as domainSchema } from './schema.b4c655ec1635af1be28bd6';

/**
 * Service for angular based on ApiAgent solution.
 * Provides assured request to API method with implicit
 * validation and common errors handling scheme.
 */
@Injectable()
export class CreateGroupService extends ApiService<
  CreateGroupResponse,
  CreateGroupRequest,
  null
> {
  protected get method(): 'POST' {
    return 'POST';
  }

  /**
   * Path template, example: `/some/path/{id}`.
   */
  protected get pathTemplate(): string {
    return '/group';
  }

  /**
   * Parameters in a query.
   */
  protected get queryParams(): string[] {
    return [];
  }

  /**
   * API servers.
   */
  protected get servers(): string[] {
    return ['http://localhost:3000'];
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
      params: null,
      request: {
        'application/json': {
          $ref:
            'schema.b4c655ec1635af1be28bd6#/components/schemas/ToDoGroupBlank'
        }
      },
      response: {
        '201': {
          'application/json': {
            $ref: 'schema.b4c655ec1635af1be28bd6#/components/schemas/ToDoGroup'
          }
        },
        '400': {
          'application/json': {
            $ref:
              'schema.b4c655ec1635af1be28bd6#/components/schemas/HttpErrorBadRequest'
          }
        },
        '500': {
          'application/json': {
            $ref:
              'schema.b4c655ec1635af1be28bd6#/components/schemas/HttpErrorServer'
          }
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

