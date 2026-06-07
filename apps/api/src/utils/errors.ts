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
    message: "One or more of the referenced staff members do not exist.",
    code: 422,
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
  ...imageErrors,
} as const

export type ErrorCode = keyof typeof errors
