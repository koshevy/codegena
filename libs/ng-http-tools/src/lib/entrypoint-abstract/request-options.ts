import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

/**
 * Type of `options` parameter in {@link HttpClient.request}
 */
type HttpClientsRequestParameters = Parameters<HttpClient['request']>['2'];

/**
 * Expected options for {@link HttpClient.request}
 */
export interface RequestOptionsRaw extends HttpClientsRequestParameters {
    headers?: HttpHeaders;
}

export interface RequestOptions<TRequestBody> {
    body: FormData | TRequestBody | string | ArrayBuffer;
    params: HttpParams;
    headers: HttpHeaders;
    /**
     * `Observe` is always 'response' because response
     * required for validation and scenario understanding.
     */
    observe: 'response',
}
