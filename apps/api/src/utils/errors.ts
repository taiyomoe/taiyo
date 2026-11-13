const genericErrors = {
  BAD_REQUEST: {
    message: "The request is invalid or malformed.",
    code: 400,
  },
  UNAUTHORIZED: {
    message: "Authentication is required to access this resource.",
    code: 401,
  },
  FORBIDDEN: {
    message: "You do not have permission to access this resource.",
    code: 403,
  },
  NOT_FOUND: {
    message: "The requested resource was not found.",
    code: 404,
  },
  CONFLICT: {
    message: "The request conflicts with the current state of the resource.",
    code: 409,
  },
  VALIDATION_ERROR: {
    message: "The request data failed validation.",
    code: 422,
  },
  RATE_LIMITED: {
    message: "Too many requests. Please slow down.",
    code: 429,
  },
  INTERNAL_SERVER_ERROR: {
    message: "An internal server error occurred.",
    code: 500,
  },
} as const
const mediaErrors = {
  MEDIA_TITLE_CONFLICT: {
    message: "A media with this title already exists.",
    code: 409,
  },
  MEDIA_LINK_CONFLICT: {
    message: "One or more of the provided links already belong to an existing media.",
    code: 409,
  },
  MEDIA_NOT_FOUND: {
    message: "The requested media was not found.",
    code: 404,
  },
  MEDIA_INVALID_TITLES: {
    message: "Invalid titles configuration. Exactly one main title is required.",
    code: 422,
  },
  MEDIA_INVALID_COVERS: {
    message:
      "Invalid covers configuration. At least one cover with exactly one main cover is required.",
    code: 422,
  },
  MEDIA_ALREADY_DELETED: {
    message: "The media has already been deleted.",
    code: 409,
  },
  MEDIA_NOT_DELETED: {
    message: "The media is not in a deleted state.",
    code: 409,
  },
} as const
const coverErrors = {
  COVER_NOT_FOUND: {
    message: "The requested cover was not found.",
    code: 404,
  },
  COVER_IS_MAIN: {
    message: "The main cover cannot be deleted. Promote another cover to main first.",
    code: 409,
  },
} as const
const bannerErrors = {
  BANNER_NOT_FOUND: {
    message: "The requested banner was not found.",
    code: 404,
  },
} as const
const staffErrors = {
  STAFF_NOT_FOUND: {
    message: "The requested staff was not found.",
    code: 404,
  },
} as const
const chapterErrors = {
  CHAPTER_NOT_FOUND: {
    message: "The requested chapter was not found.",
    code: 404,
  },
} as const
const groupErrors = {
  GROUP_NOT_FOUND: {
    message: "The requested group was not found.",
    code: 404,
  },
  GROUP_NAME_TAKEN: {
    message: "A group with this name already exists. Claim it instead of requesting a new one.",
    code: 409,
  },
  GROUP_INVITATION_NOT_FOUND: {
    message: "The requested invitation was not found.",
    code: 404,
  },
  GROUP_INVITATION_EXISTS: {
    message: "This user already has a pending invitation to the group.",
    code: 409,
  },
  GROUP_INVITATION_NOT_PENDING: {
    message: "This invitation was already answered or cancelled.",
    code: 409,
  },
  GROUP_INVITATION_EXPIRED: {
    message: "This invitation has expired.",
    code: 409,
  },
  GROUP_INVITATION_INVALID: {
    message: "The person who sent this invitation can no longer grant these permissions.",
    code: 409,
  },
  GROUP_CREATION_REQUEST_NOT_FOUND: {
    message: "The requested group creation request was not found.",
    code: 404,
  },
  GROUP_CREATION_REQUEST_NOT_PENDING: {
    message: "This group creation request was already reviewed or cancelled.",
    code: 409,
  },
  GROUP_CREATION_REQUEST_EXISTS: {
    message: "You already have a pending request for a group with this name.",
    code: 409,
  },
  GROUP_REPORT_EXISTS: {
    message: "You already reported this group. Our moderators will look into it.",
    code: 409,
  },
  GROUP_REPORT_NOT_FOUND: {
    message: "The requested group report was not found.",
    code: 404,
  },
  GROUP_REPORT_NOT_PENDING: {
    message: "This report was already reviewed.",
    code: 409,
  },
  GROUP_CREATION_REQUEST_LIMIT: {
    message: "You have too many pending group creation requests. Wait for them to be reviewed.",
    code: 409,
  },
} as const
const mediaSuggestionErrors = {
  MEDIA_SUGGESTION_NOT_FOUND: {
    message: "The requested media suggestion was not found.",
    code: 404,
  },
  MEDIA_SUGGESTION_EXISTS: {
    message: "You already have a pending suggestion for this media. Edit it instead.",
    code: 409,
  },
  MEDIA_SUGGESTION_NOT_PENDING: {
    message: "This suggestion was already reviewed or withdrawn.",
    code: 409,
  },
  MEDIA_SUGGESTION_LIMIT: {
    message:
      "You have too many suggestions waiting for review. Wait for them to be reviewed before sending more.",
    code: 409,
  },
  MEDIA_SUGGESTION_EMPTY: {
    message: "The suggestion does not change anything.",
    code: 422,
  },
  MEDIA_SUGGESTION_UNKNOWN_FIELDS: {
    message: "Only fields changed by the suggestion can be accepted.",
    code: 422,
  },
} as const
const mediaStaffErrors = {
  MEDIA_STAFF_EXISTS: {
    message: "This staff is already linked to the media with that role.",
    code: 409,
  },
  MEDIA_STAFF_NOT_FOUND: {
    message: "The given media has no staff with that id and role.",
    code: 404,
  },
} as const
const chapterGroupErrors = {
  CHAPTER_SUBMISSION_LIMIT: {
    message:
      "You have too many chapters waiting for review. Wait for them to be reviewed before submitting more.",
    code: 409,
  },
  CHAPTER_EXTERNAL: {
    message: "This chapter is hosted on the group's site and has no pages on Taiyō.",
    code: 409,
  },
  CHAPTER_EXTERNAL_LINK_REQUIRED: {
    message: "An external chapter needs a link to the group's site.",
    code: 422,
  },
  CHAPTER_ALREADY_RELEASED: {
    message: "This chapter is already out and cannot be scheduled again.",
    code: 409,
  },
  CHAPTER_NOT_PENDING: {
    message: "This chapter is not waiting for review.",
    code: 409,
  },
  CHAPTER_PAGES_MISSING: {
    message: "This chapter has no processed pages yet.",
    code: 409,
  },
  CHAPTER_PAGES_MISMATCH: {
    message: "The page order must list every page of the chapter exactly once.",
    code: 422,
  },
  CHAPTER_GROUP_EXISTS: {
    message: "This group is already linked to the chapter.",
    code: 409,
  },
  CHAPTER_GROUP_NOT_FOUND: {
    message: "The given chapter has no group with that id.",
    code: 404,
  },
} as const
const ownershipErrors = {
  OWNERSHIP_REQUEST_NOT_FOUND: {
    message: "The requested ownership request was not found.",
    code: 404,
  },
  OWNERSHIP_REQUEST_EXISTS: {
    message: "You already have a pending ownership request for this group.",
    code: 409,
  },
  OWNERSHIP_REQUEST_NOT_PENDING: {
    message: "The ownership request is no longer pending.",
    code: 409,
  },
  GROUP_ALREADY_OWNED: {
    message: "This group already has an owner.",
    code: 409,
  },
  GROUP_MEMBER_NOT_FOUND: {
    message: "The given user has no membership on this group.",
    code: 404,
  },
  GROUP_MEMBER_EXISTS: {
    message: "The given user is already a member of this group.",
    code: 409,
  },
  GROUP_LAST_OWNER: {
    message:
      "This action would leave the group without an owner. Promote another member to OWNER first.",
    code: 409,
  },
} as const
const userErrors = {
  USER_NOT_FOUND: {
    message: "The requested user was not found.",
    code: 404,
  },
  USERNAME_TAKEN: {
    message: "This username is already taken.",
    code: 409,
  },
  DISPLAY_NAME_TAKEN: {
    message: "This display name is already taken.",
    code: 409,
  },
  PASSWORD_ALREADY_SET: {
    message: "Your account already has a password. Change it instead.",
    code: 409,
  },
} as const
const followErrors = {
  FOLLOW_SELF: {
    message: "You can't follow yourself.",
    code: 409,
  },
  ALREADY_FOLLOWING: {
    message: "You already follow this user.",
    code: 409,
  },
  NOT_FOLLOWING: {
    message: "You don't follow this user.",
    code: 404,
  },
} as const
const profileErrors = {
  COSMETIC_LOCKED: {
    message: "You haven't unlocked this cosmetic yet.",
    code: 403,
  },
  INVALID_CROP: {
    message: "The crop area is invalid for this image.",
    code: 422,
  },
} as const
const commentErrors = {
  COMMENT_NOT_FOUND: {
    message: "The requested comment was not found.",
    code: 404,
  },
  NOTIFICATION_NOT_FOUND: {
    message: "The requested notification was not found.",
    code: 404,
  },
  PUSH_SUBSCRIPTION_NOT_FOUND: {
    message: "This device is not subscribed to push notifications.",
    code: 404,
  },
  PUSH_SUBSCRIPTION_EXPIRED: {
    message: "The push service no longer accepts this device's subscription. Subscribe again.",
    code: 410,
  },
  PUSH_NOT_CONFIGURED: {
    message: "Push notifications are not configured on this server.",
    code: 503,
  },
  PUSH_DELIVERY_FAILED: {
    message: "The push service did not accept the notification. Try again later.",
    code: 502,
  },
  COMMENT_EMPTY: {
    message: "A comment needs some text or at least one image.",
    code: 422,
  },
  COMMENT_TOO_LONG: {
    message: "The comment's text is too long.",
    code: 422,
  },
  COMMENT_TOO_MANY_IMAGES: {
    message: "The comment has too many images.",
    code: 422,
  },
  COMMENT_IMAGE_UNAVAILABLE: {
    message:
      "One of the images is not available to you. Upload it or add it to your favorites first.",
    code: 422,
  },
  COMMENT_PARENT_NOT_FOUND: {
    message: "The comment you are replying to no longer exists.",
    code: 404,
  },
  COMMENT_DELETED: {
    message: "This comment was deleted.",
    code: 409,
  },
  COMMENT_SELF_VOTE: {
    message: "You can't upvote your own comment.",
    code: 409,
  },
  COMMENT_REPORT_EXISTS: {
    message: "You already reported this comment, and the report is still open.",
    code: 409,
  },
  COMMENT_REPORT_NOT_FOUND: {
    message: "The requested comment report was not found.",
    code: 404,
  },
  COMMENT_REPORT_CLOSED: {
    message: "This comment report is already closed.",
    code: 409,
  },
  COMMENT_IMAGE_NOT_FOUND: {
    message: "The requested image was not found.",
    code: 404,
  },
  COMMENT_IMAGE_BLOCKED: {
    message: "This image was removed by a moderator and can't be uploaded again.",
    code: 422,
  },
  COMMENT_IMAGE_TOO_COMPLEX: {
    message: "The image is too large: it has too many pixels or animation frames.",
    code: 422,
  },
  COMMENT_FAVORITES_FULL: {
    message: "You have reached the maximum number of favorite images.",
    code: 409,
  },
} as const
const shopErrors = {
  NOT_FOR_SALE: {
    message: "This cosmetic can't be bought directly.",
    code: 409,
  },
  ALREADY_OWNED: {
    message: "You already own this cosmetic.",
    code: 409,
  },
  INSUFFICIENT_POINTS: {
    message: "You don't have enough points.",
    code: 409,
  },
  LOOT_BOX_EXHAUSTED: {
    message: "You already own everything this loot box can drop.",
    code: 409,
  },
  SHOP_IMPERSONATION: {
    message: "Points can't be spent while impersonating a user.",
    code: 403,
  },
} as const
const historyErrors = {
  HISTORY_ENTRY_NOT_FOUND: {
    message: "No history entry exists for this chapter.",
    code: 404,
  },
} as const
const pageErrors = {
  PAGE_NOT_FOUND: {
    message: "The chapter has no page with this id.",
    code: 404,
  },
  PAGE_REPORT_EXISTS: {
    message: "You already reported this page, and the report is still open.",
    code: 409,
  },
  PAGE_REPORT_NOT_FOUND: {
    message: "The requested page report was not found.",
    code: 404,
  },
  PAGE_REPORT_CLOSED: {
    message: "This page report is already closed.",
    code: 409,
  },
} as const
const libraryErrors = {
  LIBRARY_ENTRY_NOT_FOUND: {
    message: "No library entry exists for this media.",
    code: 404,
  },
} as const
const listErrors = {
  LIST_NOT_FOUND: {
    message: "The requested list was not found.",
    code: 404,
  },
  LIST_ITEM_NOT_FOUND: {
    message: "No item with that media id exists on this list.",
    code: 404,
  },
  LIST_ITEM_EXISTS: {
    message: "This media is already on the list.",
    code: 409,
  },
  LIST_FULL: {
    message: "This list has reached the maximum number of titles.",
    code: 409,
  },
  LIST_LIMIT_REACHED: {
    message: "You have reached the maximum number of lists.",
    code: 409,
  },
  LIST_SELF_VOTE: {
    message: "You can't upvote your own list.",
    code: 409,
  },
} as const
const imageErrors = {
  INVALID_IMAGE: {
    message: "The file is not a valid image.",
    code: 422,
  },
  IMAGE_TOO_LARGE: {
    message: "The image exceeds the maximum allowed size.",
    code: 422,
  },
} as const
const chapterUploadErrors = {
  CHAPTER_PAGES_ALREADY_UPLOADED: {
    message: "This chapter already has pages.",
    code: 409,
  },
  CHAPTER_UPLOAD_SESSION_NOT_FOUND: {
    message: "No pending upload session was found for this chapter.",
    code: 404,
  },
} as const
const auditLogErrors = {
  AUDIT_LOG_NOT_FOUND: {
    message: "The requested audit log entry was not found.",
    code: 404,
  },
} as const

export const errors = {
  ...genericErrors,
  ...mediaErrors,
  ...coverErrors,
  ...bannerErrors,
  ...staffErrors,
  ...chapterErrors,
  ...groupErrors,
  ...mediaSuggestionErrors,
  ...mediaStaffErrors,
  ...chapterGroupErrors,
  ...ownershipErrors,
  ...userErrors,
  ...followErrors,
  ...profileErrors,
  ...commentErrors,
  ...shopErrors,
  ...historyErrors,
  ...pageErrors,
  ...libraryErrors,
  ...listErrors,
  ...imageErrors,
  ...chapterUploadErrors,
  ...auditLogErrors,
} as const

export type ErrorCode = keyof typeof errors
