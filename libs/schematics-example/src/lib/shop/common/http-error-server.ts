export interface HttpErrorServer {
  description?: string;
  message: string;
  type?: 'syntax' | 'semantic';
}
