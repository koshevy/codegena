import { from, Observable, of } from "rxjs";
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from "@codegena/definitions/aspects";
import { Schema as JsonSchema } from "@codegena/definitions/json-schema";
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { GetListItemsParameters } from './get-list-items-parameters';
import { GetListItemsResponse } from './get-list-items-response';

@Injectable()
export class GetListItemsBackendService extends EntrypointAbstract<
    "GET",
    GetListItemsParameters,
    never,
    GetListItemsResponse
> {
    protected getMethod(): HttpMethod {
        return "GET";
    }

    protected getPathTemplate(): string {
        return "/list/{listId}/item";
    }

    protected getQueryParameters(): string[] {
        return ["isComplete"];
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
  "$id": "getListItems_parameters",
  "properties": {
    "listId": {
      "type": "number"
    },
    "isComplete": {
      "type": [
        "boolean",
        "null"
      ],
      "default": null
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
      "$id": "getListItems_response_application_json"
    }
  },
  "400": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorBadRequest",
      "$id": "getListItems_response_application_json"
    }
  },
  "404": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorNotFound",
      "$id": "getListItems_response_application_json"
    }
  },
  "500": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorServer",
      "$id": "getListItems_response_application_json"
    }
  }
};
    }
}
