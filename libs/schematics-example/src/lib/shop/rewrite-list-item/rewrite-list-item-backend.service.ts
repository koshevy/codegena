import { from, Observable, of } from "rxjs";
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from "@codegena/definitions/aspects";
import { Schema as JsonSchema } from "@codegena/definitions/json-schema";
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { RewriteListItemParameters } from './rewrite-list-item-parameters';
import { RewriteListItemRequest } from './rewrite-list-item-request';
import { RewriteListItemResponse } from './rewrite-list-item-response';

@Injectable()
export class RewriteListItemBackendService extends EntrypointAbstract<
    "PUT",
    RewriteListItemParameters,
    RewriteListItemRequest,
    RewriteListItemResponse
> {
    protected getMethod(): HttpMethod {
        return "PUT";
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
    "$id": "rewriteListItem_request_application_json"
  }
};
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
  "$id": "rewriteListItem_parameters",
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
      "$id": "rewriteListItem_response_application_json"
    }
  },
  "400": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorBadRequest",
      "$id": "rewriteListItem_response_application_json"
    }
  },
  "404": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorNotFound",
      "$id": "rewriteListItem_response_application_json"
    }
  },
  "409": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorConflict",
      "$id": "rewriteListItem_response_application_json"
    }
  },
  "500": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorServer",
      "$id": "rewriteListItem_response_application_json"
    }
  }
};
    }
}
