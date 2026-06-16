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
const historyErrors = {
  HISTORY_ENTRY_NOT_FOUND: {
    message: "No history entry exists for this chapter.",
    code: 404,
  },
} as const
const libraryErrors = {
  LIBRARY_ENTRY_NOT_FOUND: {
    message: "No library entry exists for this media.",
    code: 404,
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

export const errors = {
  ...genericErrors,
  ...mediaErrors,
  ...coverErrors,
  ...bannerErrors,
  ...staffErrors,
  ...chapterErrors,
  ...groupErrors,
  ...mediaStaffErrors,
  ...chapterGroupErrors,
  ...ownershipErrors,
  ...userErrors,
  ...followErrors,
  ...historyErrors,
  ...libraryErrors,
  ...imageErrors,
} as const

export type ErrorCode = keyof typeof errors
