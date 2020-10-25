export interface SupportedContentTypeMap<TContent> {
    'default'?: TContent;
    'application/javascript'?: TContent;
    'application/json'?: TContent;
    'application/octet-stream'?: TContent;
    'application/xml'?: TContent;
    'application/x-www-form-urlencoded'?: TContent;
    'text/html'?: TContent;
    'text/plain'?: TContent;
    'text/xml'?: TContent;
    'image/gif'?: TContent;
    'image/jpeg'?: TContent;
    'image/pjpeg'?: TContent;
    'image/png'?: TContent;
    'image/svg+xml'?: TContent;
    'multipart/form-data'?: TContent;
    'multipart/mixed'?: TContent;
    'multipart/related'?: TContent;
}
