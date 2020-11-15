import { ToDosListBlank } from './to-dos-list-blank';
import { ToDosListExtendedData } from './to-dos-list-extended-data';

export type ToDosList = ToDosListBlank & // Data needed for list creation
  ToDosListExtendedData; // Extended data has to be obtained after first save
