import { ToDosList } from '../common/to-dos-list';
import { HttpErrorBadRequest } from '../common/http-error-bad-request';
import { HttpErrorServer } from '../common/http-error-server';

export type CreateListResponse<
  TCode extends 201 | 400 | 500 = 201 | 400 | 500,
  TContentType extends 'application/json' = 'application/json'
> = TCode extends 201
  ? TContentType extends 'application/json'
    ? ToDosList
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
