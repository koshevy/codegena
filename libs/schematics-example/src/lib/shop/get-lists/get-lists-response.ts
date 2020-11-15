import { ToDosItem } from '../common/to-dos-item';
import { HttpErrorBadRequest } from '../common/http-error-bad-request';
import { HttpErrorServer } from '../common/http-error-server';

export type GetListsResponse<
  TCode extends 200 | 400 | 500 = 200 | 400 | 500,
  TContentType extends 'application/json' = 'application/json'
> = TCode extends 200
  ? TContentType extends 'application/json'
    /**
     * ## Item in todo's list
     * Describe data structure of an item in list of tasks
     */
    ? ToDosItem
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
