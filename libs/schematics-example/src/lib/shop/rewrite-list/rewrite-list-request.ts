import { ToDosListBlank } from '../common/to-dos-list-blank';

export type RewriteListRequest<
  TCode extends 'application/json' = 'application/json'
> = TCode extends 'application/json'
/**
 * ## Base part of data of list
 * Data needed for list creation
 */
  ? ToDosListBlank
  : any;
