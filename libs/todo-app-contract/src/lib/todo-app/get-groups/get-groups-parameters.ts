/**
 * Model of parameters for API `/group`
 */
export interface GetGroupsParameters {
    /**
     * Filter groups by `complete` status
     */
    isComplete?: boolean;
    /**
     * Set it `true` if you want to get all group items with group. Always returns
     * empty `items` array when it's `false`.
     */
    withItems?: boolean;
}
