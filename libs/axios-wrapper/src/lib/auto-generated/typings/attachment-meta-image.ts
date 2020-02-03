/* tslint:disable */
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
   * Link to any external resource
   */
  url: string;
  /**
   * Possible thumbnails of uploaded image
   */
  thumbs?: {
    [key: string]: {
      /**
       * Link to any external resource
       */
      url?: string;
      imageOptions?: ImageOptions;
    };
  };
  /**
   * Format of uploaded image
   */
  format: 'png' | 'jpeg' | 'gif' | 'svg' | 'tiff';
  imageOptions: ImageOptions;
}
