import type { BuildExecutorSchema } from '../build/schema';

export interface UpExecutorSchema extends BuildExecutorSchema {
  abortOnContainerExit?: boolean;
  build?: boolean;
  detached?: boolean;
  exitCodeFrom?: string;
}
