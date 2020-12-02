/**
 * Meta data of document attached to task
 */
export interface AttachmentMetaDocument {
    /**
     * An unique id of document. Metadata with unique get from server in return of
     * uploaded image file.
     */
    docId: string;
    /**
     * Marks attachment as an document
     */
    type: 'document';
    /**
     * Url of uploaded document
     */
    url: string;
    /**
     * Format of document
     */
    format: 'doc' | 'docx' | 'pdf' | 'rtf' | 'xls' | 'xlsx' | 'txt';
    /**
     * File size
     */
    size: number;
}
