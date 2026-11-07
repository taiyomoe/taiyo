import { Hono } from "hono"
import { favoriteCommentImageHandler } from "../handlers/favorite-comment-image-handler"
import { listMyCommentImagesHandler } from "../handlers/list-my-comment-images-handler"
import { removeCommentImageHandler } from "../handlers/remove-comment-image-handler"
import { uploadCommentImageHandler } from "../handlers/upload-comment-image-handler"

export const commentImagesRouter = new Hono()
  .route("/", uploadCommentImageHandler)
  .route("/", listMyCommentImagesHandler)
  .route("/", favoriteCommentImageHandler)
  .route("/", removeCommentImageHandler)
