import { createFileRoute, redirect } from "@tanstack/react-router"
import { NewMediaPage } from "@/features/catalog/components/medias/new-media-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/medias/new")({
  head: () => ({ meta: [{ title: m.catalog_media_new_meta_title() }] }),
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("media.create")) {
      throw redirect({ to: "/dashboard/medias" })
    }
  },
  component: NewMediaPage,
})
