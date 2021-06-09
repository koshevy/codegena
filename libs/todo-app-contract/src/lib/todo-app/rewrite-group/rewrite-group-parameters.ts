/**
 * Model of parameters for API `/group/{groupId}`
 */
export interface RewriteGroupParameters {
    /**
     * Uid of TODO group
     */
    groupId: string;
    /**
     * Force save group despite conflicts
     */
    forceSave?: any;
}
