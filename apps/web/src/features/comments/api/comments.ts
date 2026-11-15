import type { InferResponseType } from "hono/client"
import {
  type InfiniteData,
  infiniteQueryOptions,
  type QueryClient,
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import type { CommentTarget } from "@/features/comments/lib/comment-target"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export const COMMENT_SORTS = ["newest", "oldest", "top"] as const

export type CommentSort = (typeof COMMENT_SORTS)[number]

type ListResponse = InferResponseType<typeof api.comments.$get, 200>

export type RootComment = ListResponse["data"][number]

export type Comment = Omit<RootComment, "replies">

export type CommentImage = Comment["images"][number]

type ListPage = Pick<ListResponse, "data" | "meta">

type RepliesPage = Pick<
  InferResponseType<(typeof api.comments)[":id"]["replies"]["$get"], 200>,
  "data" | "meta"
>

type CommentContext = InferResponseType<
  (typeof api.comments)[":id"]["context"]["$get"],
  200
>["data"]

export const commentsQueryOptions = (target: CommentTarget, sort: CommentSort) =>
  infiniteQueryOptions({
    queryKey: ["comments", "list", target.type, target.id, sort],
    initialPageParam: null as string | null,
    queryFn: async ({ signal, pageParam }): Promise<ListPage> => {
      const response = await api.comments.$get(
        {
          query: {
            targetType: target.type,
            targetId: target.id,
            sort,
            ...(pageParam === null ? {} : { cursor: pageParam }),
          },
        },
        { init: { signal } },
      )
      const { data, meta } =
        await unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)

      return { data, meta }
    },
    getNextPageParam: (last) => last.meta.nextCursor,
  })

export const commentRepliesQueryOptions = (rootId: string) =>
  infiniteQueryOptions({
    queryKey: ["comments", "replies", rootId],
    initialPageParam: null as string | null,
    queryFn: async ({ signal, pageParam }): Promise<RepliesPage> => {
      const response = await api.comments[":id"].replies.$get(
        { param: { id: rootId }, query: pageParam === null ? {} : { cursor: pageParam } },
        { init: { signal } },
      )
      const { data, meta } =
        await unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)

      return { data, meta }
    },
    getNextPageParam: (last) => last.meta.nextCursor,
  })

export const commentContextQueryOptions = (commentId: string) =>
  queryOptions({
    queryKey: ["comments", "context", commentId],
    queryFn: async ({ signal }) => {
      const response = await api.comments[":id"].context.$get(
        { param: { id: commentId } },
        { init: { signal } },
      )

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    retry: false,
  })

export const commentCountQueryOptions = (target: CommentTarget) =>
  queryOptions({
    queryKey: ["comments", "count", target.type, target.id],
    queryFn: async ({ signal }) => {
      const response = await api.comments.count.$get(
        { query: { targetType: target.type, targetId: target.id } },
        { init: { signal } },
      )

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
  })

export const commentRevisionsQueryOptions = (commentId: string) =>
  queryOptions({
    queryKey: ["comments", "revisions", commentId],
    queryFn: async ({ signal }) => {
      const response = await api.comments[":id"].revisions.$get(
        { param: { id: commentId } },
        { init: { signal } },
      )

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
  })

const tombstoneOrphans = (roots: RootComment[]) =>
  roots.filter((root) => root.removal === null || root.replyCount > 0)

export const mapCachedComments = (
  queryClient: QueryClient,
  update: (comment: Comment) => Comment | null,
) => {
  const updateRoot = (root: RootComment): RootComment | null => {
    const updated = update(root)

    if (updated === null) {
      return null
    }

    return { ...updated, replies: root.replies.flatMap((reply) => update(reply) ?? []) }
  }

  queryClient.setQueriesData<InfiniteData<ListPage>>({ queryKey: ["comments", "list"] }, (data) =>
    data === undefined
      ? data
      : {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: tombstoneOrphans(page.data.flatMap((root) => updateRoot(root) ?? [])),
          })),
        },
  )
  queryClient.setQueriesData<InfiniteData<RepliesPage>>(
    { queryKey: ["comments", "replies"] },
    (data) =>
      data === undefined
        ? data
        : {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              data: page.data.flatMap((reply) => update(reply) ?? []),
            })),
          },
  )
  queryClient.setQueriesData<CommentContext>({ queryKey: ["comments", "context"] }, (data) => {
    if (data === undefined) {
      return data
    }

    const root = updateRoot(data.comment)

    return root === null || (root.removal !== null && root.replyCount === 0)
      ? data
      : { ...data, comment: root }
  })
}

const changeReplyCount = (queryClient: QueryClient, rootId: string, delta: number) => {
  mapCachedComments(queryClient, (comment) =>
    comment.id === rootId
      ? { ...comment, replyCount: Math.max(comment.replyCount + delta, 0) }
      : comment,
  )
}
const invalidateCounts = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: ["comments", "count"] })

export function useCreateComment(target: CommentTarget) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await api.comments.$post({
        json: { targetType: target.type, targetId: target.id, content },
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: (comment) => {
      queryClient.setQueriesData<InfiniteData<ListPage>>(
        { queryKey: ["comments", "list", target.type, target.id] },
        (data) =>
          data === undefined
            ? data
            : {
                ...data,
                pages: data.pages.map((page, index) =>
                  index === 0
                    ? {
                        data: [{ ...comment, replies: [] }, ...page.data],
                        meta: { ...page.meta, total: page.meta.total + 1 },
                      }
                    : page,
                ),
              },
      )
      void invalidateCounts(queryClient)
    },
  })
}

export function useCreateReply(rootId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ replyTo, content }: { replyTo: string; content: string }) => {
      const response = await api.comments[":id"].replies.$post({
        param: { id: replyTo },
        json: { content },
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: (reply) => {
      const appendTo = (root: RootComment): RootComment =>
        root.id === rootId
          ? { ...root, replyCount: root.replyCount + 1, replies: [...root.replies, reply] }
          : root

      queryClient.setQueriesData<InfiniteData<ListPage>>(
        { queryKey: ["comments", "list"] },
        (data) =>
          data === undefined
            ? data
            : {
                ...data,
                pages: data.pages.map((page) => ({ ...page, data: page.data.map(appendTo) })),
              },
      )
      queryClient.setQueriesData<CommentContext>({ queryKey: ["comments", "context"] }, (data) =>
        data === undefined ? data : { ...data, comment: appendTo(data.comment) },
      )
      queryClient.setQueryData<InfiniteData<RepliesPage>>(
        commentRepliesQueryOptions(rootId).queryKey,
        (data) => {
          const last = data?.pages.at(-1)

          return data === undefined || last === undefined || last.meta.nextCursor !== null
            ? data
            : {
                ...data,
                pages: [...data.pages.slice(0, -1), { ...last, data: [...last.data, reply] }],
              }
        },
      )
      void invalidateCounts(queryClient)
    },
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const response = await api.comments[":id"].$patch({ param: { id }, json: { content } })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: (updated) => {
      mapCachedComments(queryClient, (comment) =>
        comment.id === updated.id ? { ...updated, replyCount: comment.replyCount } : comment,
      )
      void queryClient.invalidateQueries({ queryKey: ["comments", "revisions", updated.id] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (comment: Comment) => {
      const response = await api.comments[":id"].$delete({ param: { id: comment.id } })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: ({ id, deletion }, comment) => {
      if (comment.parentId !== null) {
        changeReplyCount(queryClient, comment.parentId, -1)
      }

      mapCachedComments(queryClient, (cached) => {
        if (cached.id !== id) {
          return cached
        }

        if (cached.parentId !== null || cached.replyCount === 0) {
          return null
        }

        return {
          ...cached,
          removal: deletion,
          content: null,
          author: null,
          images: [],
          editedAt: null,
          upvoteCount: 0,
          viewerVoted: false,
          canEdit: false,
          canDelete: false,
          canReport: false,
        }
      })
      void invalidateCounts(queryClient)
    },
  })
}

export function useVoteComment() {
  const queryClient = useQueryClient()
  const delta = (comment: Comment, voted: boolean) => {
    if (voted === comment.viewerVoted) {
      return 0
    }

    return voted ? 1 : -1
  }
  const apply = (id: string, voted: boolean, upvoteCount?: number) => {
    mapCachedComments(queryClient, (comment) =>
      comment.id === id
        ? {
            ...comment,
            viewerVoted: voted,
            upvoteCount: upvoteCount ?? Math.max(comment.upvoteCount + delta(comment, voted), 0),
          }
        : comment,
    )
  }

  return useMutation({
    mutationFn: async ({ id, voted }: { id: string; voted: boolean }) => {
      const request = { param: { id } }
      const response = voted
        ? await api.comments[":id"].vote.$put(request)
        : await api.comments[":id"].vote.$delete(request)

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onMutate: ({ id, voted }) => {
      apply(id, voted)
    },
    onError: (_error, { id, voted }) => {
      apply(id, !voted)
    },
    onSuccess: (result, { id }) => {
      apply(id, result.viewerVoted, result.upvoteCount)
    },
  })
}

export function useReportComment() {
  return useMutation({
    mutationFn: async ({
      id,
      reason,
      details,
    }: {
      id: string
      reason: "SPAM" | "HARASSMENT" | "SPOILER" | "NSFW" | "ILLEGAL" | "OTHER"
      details: string
    }) => {
      const response = await api.comments[":id"].reports.$post({
        param: { id },
        json: { reason, ...(details.trim() === "" ? {} : { details }) },
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
  })
}
