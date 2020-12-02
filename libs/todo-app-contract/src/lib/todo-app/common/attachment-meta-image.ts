import { ImageOptions } from './image-options';

/**
 * Meta data of image attached to task
 */
export interface AttachmentMetaImage {
    /**
     * An unique id of media. Metadata with unique get from server in return of
     * uploaded image file.
     */
    mediaId: string;
    /**
     * Marks attachment as an image
     */
    type: 'image';
    /**
     * Url of uploaded image
     */
    url: string;
    /**
     * Possible thumbnails of uploaded image
     */
    thumbs?: {
        [key: string]: {
            /**
             * Url of cached thumb
             */
            url?: string;
            /**
             * Information of image
             */
            imageOptions?: ImageOptions;
        };
    };
    /**
     * Format of uploaded image
     */
    format: 'png' | 'jpeg' | 'gif' | 'svg' | 'tiff';
    /**
     * Url of cached thumb
     */
    imageOptions: ImageOptions;
}
