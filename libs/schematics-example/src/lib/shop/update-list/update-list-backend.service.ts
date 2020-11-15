import { from, Observable, of } from "rxjs";
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from "@codegena/definitions/aspects";
import { Schema as JsonSchema } from "@codegena/definitions/json-schema";
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { UpdateListParameters } from './update-list-parameters';
import { UpdateListRequest } from './update-list-request';
import { UpdateListResponse } from './update-list-response';

@Injectable()
export class UpdateListBackendService extends EntrypointAbstract<
    "PATCH",
    UpdateListParameters,
    UpdateListRequest,
    UpdateListResponse
> {
    protected getMethod(): HttpMethod {
        return "PATCH";
    }

    protected getPathTemplate(): string {
        return "/list/{listId}";
    }

    protected getQueryParameters(): string[] {
        return ["forceSave"];
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
    "$id": "updateList_request_application_json"
  }
};
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
  "$id": "updateList_parameters",
  "properties": {
    "listId": {
      "type": "number"
    },
    "forceSave": {
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
      "$ref": "shop#/components/schemas/ToDosList",
      "$id": "updateList_response_application_json"
    }
  },
  "400": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorBadRequest",
      "$id": "updateList_response_application_json"
    }
  },
  "404": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorNotFound",
      "$id": "updateList_response_application_json"
    }
  },
  "409": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorConflict",
      "$id": "updateList_response_application_json"
    }
  },
  "500": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorServer",
      "$id": "updateList_response_application_json"
    }
  }
};
    }
}
