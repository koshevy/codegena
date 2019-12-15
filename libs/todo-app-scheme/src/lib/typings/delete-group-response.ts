/* tslint:disable */
import { HttpErrorBadRequest } from './http-error-bad-request';
import { HttpErrorConflict } from './http-error-conflict';
import { HttpErrorNotFound } from './http-error-not-found';
import { HttpErrorServer } from './http-error-server';

export type DeleteGroupResponse<
  TCode extends 202 | 400 | 404 | 409 | 500 = 202 | 400 | 404 | 409 | 500,
  TContentType extends 'application/json' = 'application/json'
> = TCode extends 202
  ? TContentType extends 'application/json'
    /**
     * Todo group deleted
     */
    ? null
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
