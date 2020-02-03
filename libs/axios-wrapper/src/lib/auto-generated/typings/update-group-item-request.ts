/* tslint:disable */
import { ToDoTaskBlank } from './to-do-task-blank';

export type UpdateGroupItemRequest<
  TCode extends 'application/json' = 'application/json'
> = TCode extends 'application/json'
/**
 * ## Base part of data of item in todo's group
 * Data about group item needed for creation of it
 */
  ? ToDoTaskBlank
  : any;
