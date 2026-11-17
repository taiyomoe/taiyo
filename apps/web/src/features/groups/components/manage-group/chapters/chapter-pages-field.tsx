import * as stylex from "@stylexjs/stylex"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { SortablePageGrid } from "@/features/uploads/components/sortable-page-grid"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  loading: {
    margin: 0,
    color: colors.mutedForeground,
  },
})

export function ChapterPagesField({
  pages,
  onReorder,
}: {
  pages: Array<{ key: string; url: string | null }> | undefined
  onReorder: (keys: string[]) => void
}) {
  return (
    <Field>
      <FieldLabel>{m.upload_pages()}</FieldLabel>
      <FieldDescription>{m.group_chapter_pages_hint()}</FieldDescription>
      {pages === undefined ? (
        <p sx={styles.loading}>{m.upload_pages_loading()}</p>
      ) : (
        <SortablePageGrid onReorder={onReorder} pages={pages} />
      )}
    </Field>
  )
}
