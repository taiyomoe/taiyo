export const extensionForMimeType = (mimeType: string): "gif" | "jpg" =>
  mimeType === "image/gif" ? "gif" : "jpg"
