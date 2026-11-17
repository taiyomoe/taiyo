/** The tabs of a group's management page, the first one shown by default. */
export const MANAGE_GROUP_TABS = ["members", "chapters", "invitations", "settings"] as const

export type ManageGroupTab = (typeof MANAGE_GROUP_TABS)[number]
