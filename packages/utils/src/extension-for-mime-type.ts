/**
 * Maps an image MIME type to the file extension to use when storing it.
 *
 * Mirrors the output of the API's `checkImages` middleware, which normalises
 * uploads to JPEG (anything that isn't a GIF) or GIF.
 */
export const extensionForMimeType = (mimeType: string): "gif" | "jpg" =>
  mimeType === "image/gif" ? "gif" : "jpg"
