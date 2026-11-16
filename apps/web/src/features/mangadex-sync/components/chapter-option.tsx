// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import type { MangaDexPlan } from "@/features/mangadex-sync/api/mangadex-sync"
import type { PlanSelection } from "@/features/mangadex-sync/hooks/use-plan-selection"
import { ChapterNumber } from "@/features/chapters/components/chapter-number"
import { PlanOption } from "@/features/mangadex-sync/components/plan-option"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

export function ChapterOption({
  chapter,
  selection,
}: {
  chapter: MangaDexPlan["chapters"][number]
  selection: PlanSelection
}) {
  const details = [
    chapter.volume === null ? null : m.chapter_volume({ volume: chapter.volume }),
    chapter.isExternal ? null : m.mangadex_chapter_pages({ count: chapter.pages }),
    chapter.groups.length === 0
      ? m.mangadex_chapter_no_group()
      : chapter.groups
          .map((group) => (group.exists ? group.name : m.mangadex_group_new({ name: group.name })))
          .join(", "),
  ].filter((detail) => detail !== null)

  return (
    <PlanOption
      description={details.join(" · ")}
      itemKey={chapter.key}
      selection={selection}
      title={
        <>
          <ChapterNumber number={chapter.number} />
          {chapter.title}
          {chapter.isExternal ? (
            <Badge variant="outline">{m.mangadex_chapter_external()}</Badge>
          ) : null}
        </>
      }
      trailing={new Date(chapter.publishedAt).toLocaleDateString(getLocale(), {
        dateStyle: "medium",
      })}
    />
  )
}
