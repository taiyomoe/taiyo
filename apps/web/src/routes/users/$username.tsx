import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { getRichTextParagraphs, parseRichText } from "@/components/rich-text/rich-text-document"
import { latestMediaUpdatesQueryOptions } from "@/features/chapters/api/chapters"
import { commentsQueryOptions } from "@/features/comments/api/comments"
import { userListsQueryOptions } from "@/features/lists/api/lists"
import { userProfileQueryOptions, userStatsQueryOptions } from "@/features/users/api/profile"
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

    const loaded = await profile.catch(() => null)
    const about = loaded === null ? undefined : Object.values(loaded.about).find(Boolean)

    return {
      name: loaded?.displayUsername ?? null,
      about:
        about === undefined
          ? null
          : getRichTextParagraphs(parseRichText(about)).join(" ").trim() || null,
      image: loaded?.image ?? null,
    }
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? null

    return {
      meta: [
        { title: name === null ? m.profile_meta_title_fallback() : m.profile_meta_title({ name }) },
        ...(loaderData?.about === null || loaderData?.about === undefined
          ? []
          : [
              { name: "description", content: loaderData.about.slice(0, 160) },
              { property: "og:description", content: loaderData.about.slice(0, 160) },
            ]),
        ...(name === null ? [] : [{ property: "og:title", content: name }]),
        ...(loaderData?.image === null || loaderData?.image === undefined
          ? []
          : [{ property: "og:image", content: loaderData.image }]),
      ],
    }
  },
  component: ProfilePage,
})
