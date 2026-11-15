// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { groupChaptersStyles } from "@/features/groups/components/manage-group/chapters/group-chapters-styles"
import { SortablePageGrid } from "@/features/uploads/components/sortable-page-grid"
import { m } from "@/paraglide/messages"

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
        <p sx={groupChaptersStyles.empty}>{m.upload_pages_loading()}</p>
      ) : (
        <SortablePageGrid onReorder={onReorder} pages={pages} />
      )}
    </Field>
  )
}
