import type { InferRequestType } from "hono/client"
import { config } from "@taiyomoe/config"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isDefined, pickBy } from "remeda"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import { type Session, sessionQueryOptions } from "@/lib/queries/session"

type UserSettings = Session["user"]["settings"]

export type ContentRating = NonNullable<UserSettings["contentRating"]>[number]

export type LatestUpdatesLayout = NonNullable<UserSettings["latestUpdatesLayout"]>

type SettingsPatch = InferRequestType<(typeof api.users.me.settings)["$patch"]>["json"]

export const getContentRatings = (session: Session | null): readonly ContentRating[] =>
  session?.user.settings.contentRating ?? config.settings.contentRating

export function useSettings() {
  const { data: session } = useQuery({ ...sessionQueryOptions, staleTime: "static" })

  return {
    contentRatings: getContentRatings(session ?? null),
    latestUpdatesLayout:
      session?.user.settings.latestUpdatesLayout ?? config.settings.latestUpdatesLayout,
  }
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: SettingsPatch) =>
      unwrap(await api.users.me.settings.$patch({ json: patch })),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: sessionQueryOptions.queryKey })

      const previous = queryClient.getQueryData(sessionQueryOptions.queryKey)

      queryClient.setQueryData(sessionQueryOptions.queryKey, (session) =>
        session
          ? {
              ...session,
              user: {
                ...session.user,
                settings: { ...session.user.settings, ...pickBy(patch, isDefined) },
              },
            }
          : session,
      )

      return { previous }
    },
    onError: (_error, _patch, context) => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, context?.previous)
    },
  })
}
