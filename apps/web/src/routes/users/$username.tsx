import { noop } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { z } from "zod"
import { isNotFoundError } from "@/components/boundaries/not-found-page"
import { getRichTextSummary } from "@/components/rich-text/rich-text-document"
import { latestMediaUpdatesQueryOptions } from "@/features/chapters/api/chapters"
import { commentsQueryOptions } from "@/features/comments/api/comments"
import { userListsQueryOptions } from "@/features/lists/api/lists"
import { pageOgMeta } from "@/features/og/lib/og-meta"
import { userProfileQueryOptions, userStatsQueryOptions } from "@/features/users/api/profile"
import { ProfileNotFoundPage } from "@/features/users/components/profile/profile-not-found-page"
import { ProfilePage } from "@/features/users/components/profile/profile-page"
import { PROFILE_TABS, PROFILE_UPLOADS_PER_PAGE } from "@/features/users/lib/profile-page"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  tab: z.enum(PROFILE_TABS).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
  comment: z.uuid().optional().catch(undefined),
})

export const Route = createFileRoute("/users/$username")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ tab: search.tab ?? "profile", page: search.page ?? 1 }),
  loader: async ({ context, params: { username }, deps }) => {
    const { queryClient } = context
    const contentRatings = getContentRatings(context.session)
    const profile = queryClient.query(userProfileQueryOptions(username))
    // Only the open tab's data is fetched; the others load when opened.
    const tabData = profile
      .then(async ({ id }) => {
        if (deps.tab === "stats" || deps.tab === "profile") {
          await queryClient.query(userStatsQueryOptions(id, contentRatings))
        } else if (deps.tab === "uploads") {
          await queryClient.query(
            latestMediaUpdatesQueryOptions(contentRatings, deps.page, PROFILE_UPLOADS_PER_PAGE, id),
          )
        } else if (deps.tab === "lists") {
          await queryClient.query(userListsQueryOptions(id, deps.page, contentRatings))
        } else {
          await queryClient.infiniteQuery(commentsQueryOptions({ type: "USER", id }, "newest"))
        }
      })
      .catch(noop)

    if (import.meta.env.SSR) {
      await Promise.all([profile.catch(noop), tabData])
    }

    const loaded = await profile.catch((error: unknown) => {
      if (isNotFoundError(error, "USER_NOT_FOUND")) {
        throw notFound()
      }

      return null
    })

    return {
      name: loaded?.displayUsername ?? null,
      about: loaded === null ? null : getRichTextSummary(Object.values(loaded.about).find(Boolean)),
    }
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.name ?? null

    return {
      meta: [
        { title: name === null ? m.profile_meta_title_fallback() : m.profile_meta_title({ name }) },
        ...pageOgMeta({
          kind: "users",
          id: params.username,
          title: name,
          description: loaderData?.about,
          type: "profile",
        }),
      ],
    }
  },
  component: ProfilePage,
  notFoundComponent: ProfileNotFoundPage,
})
