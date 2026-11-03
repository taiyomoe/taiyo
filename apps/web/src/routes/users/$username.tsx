import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { userProfileQueryOptions } from "@/features/users/api/profile"
import { ProfilePage } from "@/features/users/components/profile/profile-page"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/users/$username")({
  loader: async ({ context, params: { username } }) => {
    const profile = context.queryClient.query(userProfileQueryOptions(username))

    if (import.meta.env.SSR) {
      await profile.catch(noop)
    }

    return { name: await profile.then((data) => data.displayUsername).catch(() => null) }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData?.name === null || loaderData?.name === undefined
            ? m.profile_meta_title_fallback()
            : m.profile_meta_title({ name: loaderData.name }),
      },
    ],
  }),
  component: ProfilePage,
})
