import { useQuery } from "@tanstack/react-query"
import type { CommentTarget } from "@/features/comments/lib/comment-target"
import { commentCountQueryOptions } from "@/features/comments/api/comments"

export function useCommentCount(target: CommentTarget, initial?: number) {
  const { data } = useQuery({
    ...commentCountQueryOptions(target),
    ...(initial === undefined ? {} : { initialData: { total: initial } }),
  })

  return data?.total
}
