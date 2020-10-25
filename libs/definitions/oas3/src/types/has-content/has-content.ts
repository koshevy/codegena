import { MediaContentMap } from "./media-content-map";

export interface HasContent {

    /**
     * REQUIRED. The content of the request body. The key is a media type or
     * {@link https://tools.ietf.org/html/rfc7231#appendix-D | media type range}
     * and the value describes it. For requests that match multiple keys,
     * only the most specific key is applicable. e.g. `"text/plain"` overrides `"text/*"`
     */
    content: MediaContentMap;
}
