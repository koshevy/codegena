import { JsonError } from './json-error';

export interface HttpErrorBadRequest {
  message: string;
  type?: 'syntax' | 'semantic';
  errors?: Array<JsonError>;
}
