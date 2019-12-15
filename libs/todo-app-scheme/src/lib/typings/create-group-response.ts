/* tslint:disable */
import { HttpErrorBadRequest } from './http-error-bad-request';
import { HttpErrorServer } from './http-error-server';
import { ToDoGroup } from './to-do-group';

export type CreateGroupResponse<
  TCode extends 201 | 400 | 500 = 201 | 400 | 500,
  TContentType extends 'application/json' = 'application/json'
> = TCode extends 201
  ? TContentType extends 'application/json'
    ? ToDoGroup
    : any
  : TCode extends 400
  ? TContentType extends 'application/json'
    ? HttpErrorBadRequest
    : any
  : TCode extends 500
  ? TContentType extends 'application/json'
    ? HttpErrorServer
    : any
  : any;
