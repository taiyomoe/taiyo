import type { InferRequestType, InferResponseType } from "hono/client"
import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap, unwrapEnvelope } from "@/lib/envelope"
import { sessionQueryOptions } from "@/lib/session"

export const PROFILE_COMMENTS_PER_PAGE = 10

const FOLLOWS_PER_PAGE = 30

export const userProfileQueryOptions = (username: string) =>
  queryOptions({
    queryKey: ["users", "profile", username.toLowerCase()],
    queryFn: async ({ signal }) => {
      const response = await api.users["by-username"][":username"].$get(
        { param: { username } },
        { init: { signal } },
      )

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
  })

export type UserProfile = InferResponseType<
  (typeof api.users)["by-username"][":username"]["$get"],
  200
>["data"]

export const userStatsQueryOptions = (userId: string, contentRatings: readonly ContentRating[]) =>
  queryOptions({
    queryKey: ["users", "stats", userId, { contentRatings }],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.users[":id"].stats.$get(
          { param: { id: userId }, query: { contentRating: contentRatings.join(",") } },
          { init: { signal } },
        ),
      ),
  })

export type UserStats = InferResponseType<(typeof api.users)[":id"]["stats"]["$get"], 200>["data"]

export const profileCommentsQueryOptions = (userId: string, page: number) =>
  queryOptions({
    queryKey: ["users", "comments", userId, { page }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.users[":id"].comments.$get(
          {
            param: { id: userId },
            query: { page: String(page), perPage: String(PROFILE_COMMENTS_PER_PAGE) },
          },
          { init: { signal } },
        ),
      ),
  })

export type ProfileComment = InferResponseType<
  (typeof api.users)[":id"]["comments"]["$get"],
  200
>["data"][number]

export const followListQueryOptions = (userId: string, direction: "followers" | "following") =>
  infiniteQueryOptions({
    queryKey: ["users", direction, userId],
    initialPageParam: 1,
    queryFn: async ({ signal, pageParam }) => {
      const request = {
        param: { id: userId },
        query: { page: String(pageParam), perPage: String(FOLLOWS_PER_PAGE) },
      }

      return unwrapEnvelope(
        direction === "followers"
          ? await api.users[":id"].followers.$get(request, { init: { signal } })
          : await api.users[":id"].following.$get(request, { init: { signal } }),
      )
    },
    getNextPageParam: (last) =>
      last.meta.page * last.meta.perPage < last.meta.total ? last.meta.page + 1 : undefined,
  })

export const myCosmeticsQueryOptions = queryOptions({
  queryKey: ["users", "me", "cosmetics"],
  queryFn: async ({ signal }) =>
    unwrap(await api.users.me.cosmetics.$get({}, { init: { signal } })),
})

export type MyCosmetics = InferResponseType<typeof api.users.me.cosmetics.$get, 200>["data"]

const profileKey = (username: string) => userProfileQueryOptions(username).queryKey

export function useSetFollowing(profile: Pick<UserProfile, "id" | "username">) {
  const queryClient = useQueryClient()
  const queryKey = profileKey(profile.username)

  return useMutation({
    mutationFn: async (follow: boolean) => {
      const param = { param: { id: profile.id } }

      await ensureSuccess(
        await (follow
          ? api.users[":id"].follow.$post(param)
          : api.users[":id"].follow.$delete(param)),
      )
    },
    onMutate: async (follow) => {
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (current) =>
        current === undefined || current.viewerFollows === follow
          ? current
          : {
              ...current,
              viewerFollows: follow,
              followerCount: current.followerCount + (follow ? 1 : -1),
            },
      )

      return { previous }
    },
    onError: (_error, _follow, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ["users", "followers", profile.id] }),
      ]),
  })
}

type ProfilePatch = InferRequestType<(typeof api.users.me.profile)["$patch"]>["json"]

export function useUpdateProfile(username: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: ProfilePatch) =>
      unwrap(await api.users.me.profile.$patch({ json: patch })),
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKey(username), (current) =>
        current === undefined ? current : { ...current, ...updated },
      )
    },
  })
}

type CosmeticsPatch = InferRequestType<(typeof api.users.me.cosmetics)["$patch"]>["json"]

// The shell reads the session from the router context, a snapshot taken when
// the route loaded: re-run it so the patched session reaches the navbar.
const useRefreshSession = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return (patch: { image?: string | null; nameEffect?: string | null }) => {
    queryClient.setQueryData(sessionQueryOptions.queryKey, (session) =>
      session ? { ...session, user: { ...session.user, ...patch } } : session,
    )
    void router.invalidate()
  }
}

export function useEquipCosmetics(username: string) {
  const queryClient = useQueryClient()
  const refreshSession = useRefreshSession()

  return useMutation({
    mutationFn: async (patch: CosmeticsPatch) => {
      const response = await api.users.me.cosmetics.$patch({ json: patch })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSuccess: (equipped) => {
      queryClient.setQueryData(profileKey(username), (current) =>
        current === undefined ? current : { ...current, ...equipped },
      )
      queryClient.setQueryData(myCosmeticsQueryOptions.queryKey, (current) =>
        current === undefined ? current : { ...current, ...equipped },
      )
      refreshSession({ nameEffect: equipped.nameEffect })
    },
    // Every list that shows this user's name carries their effect.
    onSettled: () =>
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] !== "session" }),
  })
}

export type ProfileImageKind = "avatar" | "banner"

export type ProfileImageCrop = {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  flipX: boolean
  flipY: boolean
}

export function useProfileImage(username: string, kind: ProfileImageKind) {
  const queryClient = useQueryClient()
  const refreshSession = useRefreshSession()
  const applyImage = (url: string | null) => {
    queryClient.setQueryData(profileKey(username), (current) => {
      if (current === undefined) {
        return current
      }

      return kind === "avatar" ? { ...current, image: url } : { ...current, bannerUrl: url }
    })

    if (kind === "avatar") {
      refreshSession({ image: url })
    }
  }
  const upload = useMutation({
    mutationFn: async ({ file, crop }: { file: File; crop: ProfileImageCrop }) => {
      const body = new FormData()

      body.set("file", file)

      for (const [key, value] of Object.entries(crop)) {
        body.set(`crop.${key}`, String(value))
      }

      // The Hono client has no typed multipart input for these routes, so the
      // request goes through fetch and the envelope is typed by hand.
      const response = await fetch(
        (kind === "avatar" ? api.users.me.avatar : api.users.me.banner).$url(),
        { method: "PUT", body, credentials: "include" },
      )
      const data = await unwrap(
        response as {
          status: number
          json: () => Promise<
            | { success: true; data: { image?: string; bannerUrl?: string } }
            | { success: false; code: string; message: string }
          >
        },
      )

      return data.image ?? data.bannerUrl ?? null
    },
    onSuccess: applyImage,
  })
  const remove = useMutation({
    mutationFn: async () => {
      await ensureSuccess(
        kind === "avatar"
          ? await api.users.me.avatar.$delete()
          : await api.users.me.banner.$delete(),
      )
    },
    onSuccess: () => {
      applyImage(null)
    },
  })

  return { upload, remove }
}

export function useCreateProfileComment(profile: Pick<UserProfile, "id" | "username">) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (content: string) =>
      unwrap(
        await api.users[":id"].comments.$post({ param: { id: profile.id }, json: { content } }),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users", "comments", profile.id] }),
        queryClient.invalidateQueries({ queryKey: profileKey(profile.username) }),
      ]),
  })
}

export function useDeleteProfileComment(profile: Pick<UserProfile, "id" | "username">) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) =>
      ensureSuccess(
        await api.users[":id"].comments[":commentId"].$delete({
          param: { id: profile.id, commentId },
        }),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users", "comments", profile.id] }),
        queryClient.invalidateQueries({ queryKey: profileKey(profile.username) }),
      ]),
  })
}
