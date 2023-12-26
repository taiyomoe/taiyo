export type UploadResponse =
  | { error: string[]; errorCode: string }
  | SuccessfulUploadResponse

export type SuccessfulUploadResponse = { files: string[] }
