import { createFileRoute } from "@tanstack/react-router"
import { UploadChapterPage } from "@/components/submissions/upload-chapter-page"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/upload")({
  head: () => ({ meta: [{ title: m.upload_meta_title() }] }),
  component: Upload,
})

function Upload() {
  const { session } = Route.useRouteContext()

  return <UploadChapterPage user={session.user} />
}
