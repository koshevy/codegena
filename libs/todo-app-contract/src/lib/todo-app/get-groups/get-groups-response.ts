import { ToDoGroup } from '../common/to-do-group';
import { HttpErrorBadRequest } from '../common/http-error-bad-request';
import { HttpErrorServer } from '../common/http-error-server';

export type GetGroupsResponse<
    TCode extends 200 | 400 | 500 = 200 | 400 | 500,
    TContentType extends 'application/json' = 'application/json'
> = TCode extends 200
    ? TContentType extends 'application/json'
        ? /**
           * TODO's groups
           */
          Array<ToDoGroup>
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
