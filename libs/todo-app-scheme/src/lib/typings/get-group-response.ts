/* tslint:disable */
import { HttpErrorBadRequest } from './http-error-bad-request';
import { HttpErrorNotFound } from './http-error-not-found';
import { HttpErrorServer } from './http-error-server';
import { ToDoGroup } from './to-do-group';

export type GetGroupResponse<
  TCode extends 200 | 400 | 404 | 500 = 200 | 400 | 404 | 500,
  TContentType extends 'application/json' = 'application/json'
> = TCode extends 200
  ? TContentType extends 'application/json'
    ? ToDoGroup
    : any
  : TCode extends 400
  ? TContentType extends 'application/json'
    ? HttpErrorBadRequest
    : any
  : TCode extends 404
  ? TContentType extends 'application/json'
    ? HttpErrorNotFound
    : any
  : TCode extends 500
  ? TContentType extends 'application/json'
    ? HttpErrorServer
    : any
  : any;
