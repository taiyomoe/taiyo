import * as stylex from "@stylexjs/stylex"
import { Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  empty: {
    paddingBlock: "2rem",
  },
})

export function MediaChapterListEmpty({
  filtered,
  onClear,
}: {
  filtered: boolean
  onClear: () => void
}) {
  return (
    <Empty sx={styles.empty}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search size={18} />
        </EmptyMedia>
        <EmptyTitle>{m.media_chapters_empty_title()}</EmptyTitle>
        <EmptyDescription>{m.media_chapters_empty_description()}</EmptyDescription>
      </EmptyHeader>
      {filtered ? (
        <EmptyContent>
          <Button onClick={onClear} size="sm" variant="outline">
            {m.media_chapters_clear()}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
