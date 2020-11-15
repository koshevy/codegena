import { from, Observable, of } from "rxjs";
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from "@codegena/definitions/aspects";
import { Schema as JsonSchema } from "@codegena/definitions/json-schema";
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { CreateListRequest } from './create-list-request';
import { CreateListResponse } from './create-list-response';

@Injectable()
export class CreateListBackendService extends EntrypointAbstract<
    "POST",
    never,
    CreateListRequest,
    CreateListResponse
> {
    protected getMethod(): HttpMethod {
        return "POST";
    }

    protected getPathTemplate(): string {
        return "/list";
    }

    protected getQueryParameters(): string[] {
        return [];
    }

    protected getServers(): string[] {
        return [];
    }

    protected getDomainSchema(): Observable<object> {
        return from(
            import('../domain-schema').then(({domainSchema}) => domainSchema),
        );
    }

    protected getRequestBodySchema(): HasContentType<JsonSchema> | null {
        return {
  "application/json": {
    "$ref": "shop#/components/schemas/ToDosListBlank",
    "$id": "createList_request_application_json"
  }
};
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
  "$id": "createList_parameters"
};
    }

    protected getResponseValidationSchema(): HasResponses<HasContentType<JsonSchema>> | null {
        return {
  "201": {
    "application/json": {
      "$ref": "shop#/components/schemas/ToDosList",
      "$id": "createList_response_application_json"
    }
  },
  "400": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorBadRequest",
      "$id": "createList_response_application_json"
    }
  },
  "500": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorServer",
      "$id": "createList_response_application_json"
    }
  }
};
    }
}
