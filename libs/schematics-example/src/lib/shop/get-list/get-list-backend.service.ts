import { from, Observable, of } from "rxjs";
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from "@codegena/definitions/aspects";
import { Schema as JsonSchema } from "@codegena/definitions/json-schema";
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { GetListParameters } from './get-list-parameters';
import { GetListResponse } from './get-list-response';

@Injectable()
export class GetListBackendService extends EntrypointAbstract<
    "GET",
    GetListParameters,
    never,
    GetListResponse
> {
    protected getMethod(): HttpMethod {
        return "GET";
    }

    protected getPathTemplate(): string {
        return "/list/{listId}";
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
        return null;
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
  "$id": "getList_parameters",
  "properties": {
    "listId": {
      "type": "number"
    }
  },
  "required": [
    "listId"
  ],
  "type": "object"
};
    }

    protected getResponseValidationSchema(): HasResponses<HasContentType<JsonSchema>> | null {
        return {
  "200": {
    "application/json": {
      "$ref": "shop#/components/schemas/ToDosItem",
      "$id": "getList_response_application_json"
    }
  },
  "400": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorBadRequest",
      "$id": "getList_response_application_json"
    }
  },
  "500": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorServer",
      "$id": "getList_response_application_json"
    }
  }
};
    }
}
