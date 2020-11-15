import { from, Observable, of } from "rxjs";
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from "@codegena/definitions/aspects";
import { Schema as JsonSchema } from "@codegena/definitions/json-schema";
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { UpdateListItemParameters } from './update-list-item-parameters';
import { UpdateListItemRequest } from './update-list-item-request';
import { UpdateListItemResponse } from './update-list-item-response';

@Injectable()
export class UpdateListItemBackendService extends EntrypointAbstract<
    "PATCH",
    UpdateListItemParameters,
    UpdateListItemRequest,
    UpdateListItemResponse
> {
    protected getMethod(): HttpMethod {
        return "PATCH";
    }

    protected getPathTemplate(): string {
        return "/list/{listId}/item/{itemId}";
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
    "$id": "updateListItem_request_application_json"
  }
};
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
  "$id": "updateListItem_parameters",
  "properties": {
    "listId": {
      "type": "number"
    },
    "itemId": {
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
    "listId",
    "itemId"
  ],
  "type": "object"
};
    }

    protected getResponseValidationSchema(): HasResponses<HasContentType<JsonSchema>> | null {
        return {
  "200": {
    "application/json": {
      "$ref": "shop#/components/schemas/ToDosItem",
      "$id": "updateListItem_response_application_json"
    }
  },
  "400": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorBadRequest",
      "$id": "updateListItem_response_application_json"
    }
  },
  "404": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorNotFound",
      "$id": "updateListItem_response_application_json"
    }
  },
  "409": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorConflict",
      "$id": "updateListItem_response_application_json"
    }
  },
  "500": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorServer",
      "$id": "updateListItem_response_application_json"
    }
  }
};
    }
}
