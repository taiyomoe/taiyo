export type UploadResponse =
  | { error: string[]; errorCode: string }
  | { files: string[] };
