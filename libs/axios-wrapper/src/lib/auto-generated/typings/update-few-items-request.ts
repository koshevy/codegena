/* tslint:disable */
import { ToDoTask } from './to-do-task';

export type UpdateFewItemsRequest<
  TCode extends 'application/json' = 'application/json'
> = TCode extends 'application/json'
/**
 * Collection of `ToDoTask` items. Tasks should be with UID's and should be exists.
 */
  ? Array<ToDoTask>
  : any;
