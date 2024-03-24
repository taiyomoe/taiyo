import { DEFAULT_MIME_TYPES } from "../utils/constants"

class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export class UnauthorizedError extends HttpError {
  constructor() {
    super(401, "Unauthorized")
  }
}

export class MediaNotFoundError extends HttpError {
  constructor() {
    super(404, "Media not found")
  }
}

export class MediaTrackerNotFoundError extends HttpError {
  constructor() {
    super(404, "Media tracker not found")
  }
}

export class ScansNotFoundError extends HttpError {
  constructor() {
    super(404, "One or more scans were not found")
  }
}

export class DuplicatedMediaTrackerError extends HttpError {
  constructor() {
    super(409, "A media with this MangaDex ID already exists")
  }
}

export class InvalidFilesError extends HttpError {
  constructor(files: File[]) {
    const errors = files.map(
      (f) =>
        `The file type of '${
          f.name
        }' is invalid. Allowed types: ${DEFAULT_MIME_TYPES.join(", ")}.`,
    )

    super(422, errors.join())
  }
}
