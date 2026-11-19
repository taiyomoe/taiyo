import { createFileRoute, redirect } from "@tanstack/react-router"
import { SiteSettingsPage } from "@/features/site-settings/components/site-settings-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: m.site_settings_meta_title() }] }),
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("media.feature")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: SiteSettingsPage,
})
