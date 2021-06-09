import { ToDoGroup } from '../common/to-do-group';
import { HttpErrorBadRequest } from '../common/http-error-bad-request';
import { HttpErrorNotFound } from '../common/http-error-not-found';
import { HttpErrorConflict } from '../common/http-error-conflict';
import { HttpErrorServer } from '../common/http-error-server';

export type RewriteGroupResponse<
    TCode extends 200 | 204 | 400 | 404 | 409 | 500 =
        | 200
        | 204
        | 400
        | 404
        | 409
        | 500,
    TContentType extends 'application/json' = 'application/json'
> = TCode extends 200
    ? TContentType extends 'application/json'
        ? ToDoGroup
        : any
    : TCode extends 204
    ? TContentType extends 'application/json'
        ? /**
           * No changes. Should no have a response!
           */
          null
        : any
    : TCode extends 400
    ? TContentType extends 'application/json'
        ? HttpErrorBadRequest
        : any
    : TCode extends 404
    ? TContentType extends 'application/json'
        ? HttpErrorNotFound
        : any
    : TCode extends 409
    ? TContentType extends 'application/json'
        ? HttpErrorConflict
        : any
    : TCode extends 500
    ? TContentType extends 'application/json'
        ? HttpErrorServer
        : any
    : any;
