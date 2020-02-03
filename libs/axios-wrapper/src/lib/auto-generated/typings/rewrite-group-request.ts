/* tslint:disable */
import { ToDoGroupBlank } from './to-do-group-blank';

export type RewriteGroupRequest<
  TCode extends 'application/json' = 'application/json'
> = TCode extends 'application/json'
/**
 * ## Base part of data of group
 * Data needed for group creation
 */
  ? ToDoGroupBlank
  : any;
