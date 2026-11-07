import { getRouteApi } from "@tanstack/react-router"
import type { UserProfile } from "@/features/users/api/profile"
import type { Session } from "@/lib/session"
import { CommentSection } from "@/features/comments/components/comment-section"

const routeApi = getRouteApi("/users/$username")

export function CommentsTab({
  profile,
  viewer,
}: {
  profile: UserProfile
  viewer: Session["user"] | null
}) {
  const { comment } = routeApi.useSearch()

  return (
    <CommentSection
      getPermalink={(id) =>
        `/users/${encodeURIComponent(profile.username)}?tab=comments&comment=${id}`
      }
      linkedCommentId={comment ?? null}
      target={{ type: "USER", id: profile.id }}
      viewer={viewer}
    />
  )
}
