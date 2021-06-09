import { HttpErrorBadRequest } from '../common/http-error-bad-request';
import { HttpErrorNotFound } from '../common/http-error-not-found';
import { HttpErrorConflict } from '../common/http-error-conflict';
import { HttpErrorServer } from '../common/http-error-server';

export type DeleteGroupResponse<
    TCode extends 202 | 400 | 404 | 409 | 500 = 202 | 400 | 404 | 409 | 500,
    TContentType extends 'application/json' = 'application/json'
> = TCode extends 202
    ? TContentType extends 'application/json'
        ? /**
           * Todo group deleted
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
