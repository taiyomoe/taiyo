import type { CommentReportReason } from "@taiyomoe/db/constants"
import type { InferResponseType } from "hono/client"
import {
  type InfiniteData,
  infiniteQueryOptions,
  type QueryClient,
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export const REVIEW_SORTS = ["helpful", "newest", "highest", "lowest"] as const

export type ReviewSort = (typeof REVIEW_SORTS)[number]

type MediaReviewsResponse = InferResponseType<(typeof api.medias)[":id"]["reviews"]["$get"], 200>

type UserReviewsResponse = InferResponseType<(typeof api.users)[":id"]["reviews"]["$get"], 200>

export type Review = MediaReviewsResponse["data"][number]

export type UserReview = UserReviewsResponse["data"][number]

type ReviewPage<T extends Review> = { data: T[]; meta: { nextCursor: string | null } }

export const reviewKeys = {
  all: ["reviews"] as const,
  lists: ["reviews", "list"] as const,
  media: (mediaId: string) => ["reviews", "list", "media", mediaId] as const,
  user: (userId: string) => ["reviews", "list", "user", userId] as const,
  count: (mediaId: string) => ["reviews", "count", mediaId] as const,
  mine: (mediaId: string) => ["reviews", "mine", mediaId] as const,
}

export const mediaReviewsQueryOptions = (
  mediaId: string,
  sort: ReviewSort,
  contentRatings: readonly ContentRating[],
) =>
  infiniteQueryOptions({
    queryKey: [...reviewKeys.media(mediaId), { sort, contentRatings }] as const,
    initialPageParam: null as string | null,
    queryFn: async ({ signal, pageParam }) => {
      const response = await api.medias[":id"].reviews.$get(
        {
          param: { id: mediaId },
          query: {
            sort,
            contentRating: contentRatings.join(","),
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

export const reviewCountQueryOptions = (
  mediaId: string,
  contentRatings: readonly ContentRating[],
) =>
  queryOptions({
    queryKey: [...reviewKeys.count(mediaId), { contentRatings }] as const,
    queryFn: async ({ signal }) => {
      const response = await api.medias[":id"].reviews.$get(
        {
          param: { id: mediaId },
          query: { sort: "newest", contentRating: contentRatings.join(","), limit: "1" },
        },
        { init: { signal } },
      )
      const { meta } = await unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)

      return meta.total
    },
  })

export const userReviewsQueryOptions = (userId: string, contentRatings: readonly ContentRating[]) =>
  infiniteQueryOptions({
    queryKey: [...reviewKeys.user(userId), { contentRatings }] as const,
    initialPageParam: null as string | null,
    queryFn: async ({ signal, pageParam }) => {
      const response = await api.users[":id"].reviews.$get(
        {
          param: { id: userId },
          query: {
            contentRating: contentRatings.join(","),
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

export const myReviewQueryOptions = (mediaId: string) =>
  queryOptions({
    queryKey: reviewKeys.mine(mediaId),
    queryFn: async ({ signal }) => {
      const response = await api.medias[":id"].review.$get(
        { param: { id: mediaId } },
        { init: { signal } },
      )

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
  })

/** Applies `update` to the review wherever it is cached. */
const mapCachedReview = (
  queryClient: QueryClient,
  id: string,
  update: (review: Review) => Review,
) => {
  const mapPages = <T extends Review>(data: InfiniteData<ReviewPage<T>> | undefined) =>
    data === undefined
      ? data
      : {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: page.data.map((review) =>
              review.id === id ? { ...review, ...update(review) } : review,
            ),
          })),
        }

  queryClient.setQueriesData<InfiniteData<ReviewPage<Review>>>(
    { queryKey: ["reviews", "list", "media"] },
    mapPages,
  )
  queryClient.setQueriesData<InfiniteData<ReviewPage<UserReview>>>(
    { queryKey: ["reviews", "list", "user"] },
    mapPages,
  )
  queryClient.setQueriesData<Review | null>({ queryKey: ["reviews", "mine"] }, (review) =>
    review?.id === id ? update(review) : review,
  )
}
const getCachedReview = (queryClient: QueryClient, id: string) => {
  const listed = queryClient
    .getQueriesData<InfiniteData<ReviewPage<Review>>>({ queryKey: reviewKeys.lists })
    .flatMap(([, data]) => data?.pages.flatMap((page) => page.data) ?? [])
  const mine = queryClient
    .getQueriesData<Review | null>({ queryKey: ["reviews", "mine"] })
    .flatMap(([, review]) => review ?? [])

  return [...listed, ...mine].find((review) => review.id === id)
}

/** Refetches every list and count a review shows in, after it was written or removed. */
export const invalidateReviews = (queryClient: QueryClient, mediaId: string) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: reviewKeys.lists }),
    queryClient.invalidateQueries({ queryKey: reviewKeys.count(mediaId) }),
    queryClient.invalidateQueries({ queryKey: reviewKeys.mine(mediaId) }),
    queryClient.invalidateQueries({ queryKey: ["review-reports"] }),
  ])

export const useSaveReview = (mediaId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (json: { body: string; containsSpoilers: boolean }) => {
      const response = await api.medias[":id"].review.$put({ param: { id: mediaId }, json })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: (review) => {
      queryClient.setQueryData(reviewKeys.mine(mediaId), review)

      return invalidateReviews(queryClient, mediaId)
    },
  })
}

/** A review to delete: as its author, or with `moderate` as a moderator, which resolves its reports. */
type DeletedReview = Pick<Review, "id" | "mediaId" | "viewer"> & { moderate?: boolean }

const isOwnDeletion = (review: DeletedReview) =>
  review.moderate !== true && review.viewer?.canEdit === true

export const useDeleteReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (review: DeletedReview) => {
      if (isOwnDeletion(review)) {
        const response = await api.medias[":id"].review.$delete({ param: { id: review.mediaId } })

        return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
      }

      const response = await api.reviews[":id"].$delete({ param: { id: review.id } })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: (_, review) => {
      if (isOwnDeletion(review)) {
        queryClient.setQueryData(reviewKeys.mine(review.mediaId), null)
      }

      return invalidateReviews(queryClient, review.mediaId)
    },
  })
}

const countWithVote = (review: Review, voted: boolean) => {
  if (voted === review.viewer?.voted) {
    return review.helpfulCount
  }

  return Math.max(0, review.helpfulCount + (voted ? 1 : -1))
}

export const useVoteReview = (id: string) => {
  const queryClient = useQueryClient()
  const apply = (voted: boolean, helpfulCount?: number) => {
    mapCachedReview(queryClient, id, (review) => ({
      ...review,
      helpfulCount: helpfulCount ?? countWithVote(review, voted),
      viewer: review.viewer === null ? null : { ...review.viewer, voted },
    }))
  }

  return useMutation({
    scope: { id: `review-vote:${id}` },
    mutationFn: async (voted: boolean) => {
      const route = api.reviews[":id"].vote
      const response = voted
        ? await route.$put({ param: { id } })
        : await route.$delete({ param: { id } })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onMutate: async (voted) => {
      await queryClient.cancelQueries({ queryKey: reviewKeys.all })

      const previous = getCachedReview(queryClient, id)

      apply(voted)

      return { voted: previous?.viewer?.voted ?? !voted, helpfulCount: previous?.helpfulCount }
    },
    onError: (_, __, context) => {
      if (context !== undefined) {
        apply(context.voted, context.helpfulCount)
      }
    },
    onSuccess: (result) => {
      apply(result.viewerVoted, result.helpfulCount)
    },
  })
}

export const useReportReview = () =>
  useMutation({
    mutationFn: async ({
      id,
      ...json
    }: {
      id: string
      reason: CommentReportReason
      details: string
    }) => {
      const response = await api.reviews[":id"].reports.$post({ param: { id }, json })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
  })
