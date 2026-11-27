import type { ComponentType } from 'react';

export interface DocumentationRemoteModule {
  default: ComponentType<{ basename?: string }>;
  initializeDocumentation: (path?: string) => Promise<void>;
}
