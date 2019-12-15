/* tslint:disable */
import { ToDoGroupBlank } from './to-do-group-blank';
import { ToDoTaskBlank } from './to-do-task-blank';

export type UpdateGroupRequest<
  TCode extends 'application/json' = 'application/json'
> = TCode extends 'application/json'
/**
 * Required request body
 */
  ? ToDoGroupBlank & { // Data needed for group creation
      /**
       * Title of a group
       */
      title: string;
      /**
       * Detailed description of a group in one/two sequences.
       */
      description?: string;
      items?: Array<ToDoTaskBlank>;
      /**
       * Whether all tasks in group are complete
       */
      isComplete?: boolean;
    }
  : any;
