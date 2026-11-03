import type { InferResponseType } from "hono/client"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap } from "@/lib/envelope"

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

export function useSetFollowing(profile: Pick<UserProfile, "id" | "username">) {
  const queryClient = useQueryClient()
  const { queryKey } = userProfileQueryOptions(profile.username)

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
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}
