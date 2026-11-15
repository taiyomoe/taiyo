import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { SettingsPage } from "@/features/settings/components/settings-page"
import { SETTINGS_TABS } from "@/features/settings/lib/settings-tabs"
import { userProfileQueryOptions } from "@/features/users/api/profile"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  tab: z.enum(SETTINGS_TABS).optional().catch(undefined),
})

export const Route = createFileRoute("/settings")({
  validateSearch: searchSchema,
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } })
    }

    return { session: context.session }
  },
  loader: async ({ context }) => {
    const username = context.session.user.username

    if (typeof username !== "string" || username === "") {
      return
    }

    const profile = context.queryClient.query(userProfileQueryOptions(username)).catch(noop)

    if (import.meta.env.SSR) {
      await profile
    }
  },
  head: () => ({ meta: [{ title: m.user_settings_meta_title() }] }),
  component: SettingsPage,
})
