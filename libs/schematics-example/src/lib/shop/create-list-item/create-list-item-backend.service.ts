import { from, Observable, of } from "rxjs";
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from "@codegena/definitions/aspects";
import { Schema as JsonSchema } from "@codegena/definitions/json-schema";
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { CreateListItemParameters } from './create-list-item-parameters';
import { CreateListItemRequest } from './create-list-item-request';
import { CreateListItemResponse } from './create-list-item-response';

@Injectable()
export class CreateListItemBackendService extends EntrypointAbstract<
    "POST",
    CreateListItemParameters,
    CreateListItemRequest,
    CreateListItemResponse
> {
    protected getMethod(): HttpMethod {
        return "POST";
    }

    protected getPathTemplate(): string {
        return "/list/{listId}/item";
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
    "$ref": "shop#/components/schemas/ToDosItemBlank",
    "$id": "createListItem_request_application_json"
  }
};
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
  "$id": "createListItem_parameters",
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
  "202": {
    "application/json": {
      "$ref": "shop#/components/schemas/ToDosItem",
      "$id": "createListItem_response_application_json"
    }
  },
  "400": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorBadRequest",
      "$id": "createListItem_response_application_json"
    }
  },
  "404": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorNotFound",
      "$id": "createListItem_response_application_json"
    }
  },
  "409": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorConflict",
      "$id": "createListItem_response_application_json"
    }
  },
  "500": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorServer",
      "$id": "createListItem_response_application_json"
    }
  }
};
    }
}
