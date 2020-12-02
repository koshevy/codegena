import { ToDoGroupBlank } from './to-do-group-blank';
import { ToDoGroupExtendedData } from './to-do-group-extended-data';

export type ToDoGroup = ToDoGroupBlank & // Data needed for group creation
    ToDoGroupExtendedData; // Extended data has to be obtained after first save
