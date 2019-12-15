import { InjectionToken } from '@angular/core';

/**
 * Constants for {@link ServersInfo.urlWhitelist}
 */
export const enum UrlWhitelistDefinitions {
    /**
     * Allow all servers path
     */
    AllowAll,
    /**
     * Pass all server paths on `localhost` or `0.0.0.0` or `127.0.0.1`.
     */
    AllowLocalhost,
    /**
     * All server paths have to be coerced to `http://localhost`
     * and can be redefined in {@link ServersInfo.redefines}.
     */
    ForceToLocalhost
}

/**
 * Information about servers have to be used
 */
export interface ServersInfo {

    /**
     * List of servers base url could be used.
     * Also supports {@link UrlWhitelistDefinitions}.
     */
    urlWhitelist: string[] | UrlWhitelistDefinitions;

    /**
     * Redefines of server paths
     */
    redefines?: {
        [originalServerUrl: string]: string
    };

    /**
     * Custom redefining of paths for particualar services.
     * Could be used in case when sublcass of {@link ApiService}
     * should work on different domain or mock server.
     */
    customRedefines?: [
        {
            /**
             * Class of service (should be subclass of {@link ApiService})
             */
            serviceClass: typeof Object.constructor,

            /**
             * Custom server path
             */
            serverUrl: string
        }
    ];
}

/**
 * Токен для внедрения  информации о серверах.
 */
export const SERVERS_INFO = new InjectionToken<ServersInfo>('SERVERS_INFO');

export const defaultServerInfo: ServersInfo = {
    urlWhitelist: UrlWhitelistDefinitions.AllowLocalhost
};

export const SERVERS_INFO_PROVIDER = [
    {
        provide: SERVERS_INFO,
        useValue: defaultServerInfo
    }
];
