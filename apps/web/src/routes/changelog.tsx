import { createFileRoute } from "@tanstack/react-router"
import { ChangelogPage } from "@/features/changelog/components/changelog-page"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: m.changelog_meta_title() },
      { name: "description", content: m.changelog_subtitle() },
    ],
  }),
  component: ChangelogPage,
})
