import { createFileRoute, redirect } from "@tanstack/react-router"
import { NewListPage } from "@/features/lists/components/list-editor/new-list-page"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/lists/new")({
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } })
    }

    return { session: context.session }
  },
  head: () => ({ meta: [{ title: m.list_editor_new_title() }] }),
  component: NewListPage,
})
