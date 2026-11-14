import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router"
import { m } from "@/paraglide/messages"

export const Route = createRootRoute({
  head: () => ({ meta: [{ title: m.maintenance_meta_title() }] }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  )
}
