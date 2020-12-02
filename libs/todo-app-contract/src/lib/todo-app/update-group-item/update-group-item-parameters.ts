/**
 * Model of parameters for API `/group/{groupId}/item/{itemId}`
 */
export interface UpdateGroupItemParameters {
    /**
     * Uid of TODO group
     */
    groupId: string;
    /**
     * Uid of TODO group item
     */
    itemId: string;
    /**
     * Force save group despite conflicts
     */
    forceSave?: any;
}
