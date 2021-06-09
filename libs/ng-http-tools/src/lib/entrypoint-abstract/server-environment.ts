import { InjectionToken } from '@angular/core';

export interface ServerEnvironment {
    serverParams?: Record<string, string>;
    environment?: string,
}

export const SERVER_ENVIRONMENT = new InjectionToken<ServerEnvironment>(
    'ServerEnvironment',
);
