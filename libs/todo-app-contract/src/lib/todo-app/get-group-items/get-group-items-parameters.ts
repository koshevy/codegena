/**
 * Model of parameters for API `/group/{groupId}/item`
 */
export interface GetGroupItemsParameters {
    /**
     * Uid of TODO group
     */
    groupId: string;
    /**
     * Filter groups by `complete` status
     */
    isComplete?: boolean;
}
