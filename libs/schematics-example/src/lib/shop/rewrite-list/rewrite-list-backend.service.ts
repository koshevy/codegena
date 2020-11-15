import { from, Observable, of } from "rxjs";
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from "@codegena/definitions/aspects";
import { Schema as JsonSchema } from "@codegena/definitions/json-schema";
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { RewriteListParameters } from './rewrite-list-parameters';
import { RewriteListRequest } from './rewrite-list-request';
import { RewriteListResponse } from './rewrite-list-response';

@Injectable()
export class RewriteListBackendService extends EntrypointAbstract<
    "PUT",
    RewriteListParameters,
    RewriteListRequest,
    RewriteListResponse
> {
    protected getMethod(): HttpMethod {
        return "PUT";
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
    "$id": "rewriteList_request_application_json"
  }
};
    }

    protected getParametersSchema(): JsonSchema | null {
        return {
  "$id": "rewriteList_parameters",
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
      "$ref": "shop#/components/schemas/ToDosItem",
      "$id": "rewriteList_response_application_json"
    }
  },
  "204": {
    "application/json": {
      "type": "null",
      "$id": "rewriteList_response_application_json"
    }
  },
  "400": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorBadRequest",
      "$id": "rewriteList_response_application_json"
    }
  },
  "404": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorNotFound",
      "$id": "rewriteList_response_application_json"
    }
  },
  "409": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorConflict",
      "$id": "rewriteList_response_application_json"
    }
  },
  "500": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorServer",
      "$id": "rewriteList_response_application_json"
    }
  }
};
    }
}
