/* tslint:disable */
import { ToDoGroupBlank } from './to-do-group-blank';

export type UpdateGroupRequest<
  TCode extends 'application/json' = 'application/json'
> = TCode extends 'application/json'
/**
 * Required request body
 */
  ? ToDoGroupBlank // Data needed for group creation
  : any;
