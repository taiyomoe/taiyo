import { createContext, use } from "react"
import type { CommentImage } from "@/features/comments/api/comments"
import type { CommentTarget } from "@/features/comments/lib/comment-target"
import type { Session } from "@/lib/session"

export type CommentsContextValue = {
  target: CommentTarget
  viewer: Session["user"] | null
  canReview: boolean
  canRemoveImages: boolean
  getPermalink: (commentId: string) => string
}

export const CommentsContext = createContext<CommentsContextValue | null>(null)

export const useCommentsContext = () => {
  const value = use(CommentsContext)

  if (value === null) {
    throw new Error("useCommentsContext must be used inside a comment section")
  }

  return value
}

export type CommentImageEditing = {
  toggleSpoiler: (id: string) => void
  remove: (id: string) => void
}

export const CommentImagesContext = createContext<{
  images: ReadonlyMap<string, CommentImage>
  interactive: boolean
  editing: CommentImageEditing | null
}>({ images: new Map(), interactive: false, editing: null })
