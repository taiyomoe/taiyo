import { createFileRoute } from "@tanstack/react-router"
import { UploadPage } from "@/features/uploads/components/upload/upload-page"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/upload")({
  head: () => ({ meta: [{ title: m.upload_meta_title() }] }),
  component: UploadPage,
})
