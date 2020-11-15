import { from, Observable, of } from "rxjs";
import { Injectable } from '@angular/core';
import { HasContentType, HasResponses } from "@codegena/definitions/aspects";
import { Schema as JsonSchema } from "@codegena/definitions/json-schema";
import { EntrypointAbstract, HttpMethod } from '@codegena/ng-http-tools';

import { GetListsParameters } from './get-lists-parameters';
import { GetListsResponse } from './get-lists-response';

@Injectable()
export class GetListsBackendService extends EntrypointAbstract<
    "GET",
    GetListsParameters,
    never,
    GetListsResponse
> {
    protected getMethod(): HttpMethod {
        return "GET";
    }

    protected getPathTemplate(): string {
        return "/list";
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
  "$id": "getLists_parameters",
  "properties": {
    "isComplete": {
      "type": [
        "boolean",
        "null"
      ],
      "default": null
    }
  },
  "required": [],
  "type": "object"
};
    }

    protected getResponseValidationSchema(): HasResponses<HasContentType<JsonSchema>> | null {
        return {
  "200": {
    "application/json": {
      "$ref": "shop#/components/schemas/ToDosItem",
      "$id": "getLists_response_application_json"
    }
  },
  "400": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorBadRequest",
      "$id": "getLists_response_application_json"
    }
  },
  "500": {
    "application/json": {
      "$ref": "shop#/components/schemas/HttpErrorServer",
      "$id": "getLists_response_application_json"
    }
  }
};
    }
}
