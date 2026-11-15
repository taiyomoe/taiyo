import * as stylex from "@stylexjs/stylex"
import { MEDIA_LINK_KEYS } from "@taiyomoe/db/constants"
import type { EditorProps } from "@/features/media-suggestions/components/field-editors/editor-props"
import { LinkField } from "@/features/media-suggestions/components/field-editors/link-field"

const styles = stylex.create({
  grid: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))",
  },
})

export function LinksEditor({ draft, onChange }: EditorProps) {
  return (
    <div sx={styles.grid}>
      {MEDIA_LINK_KEYS.map((key) => (
        <LinkField
          key={key}
          linkKey={key}
          links={draft.links}
          onChange={(links) => {
            onChange({ ...draft, links })
          }}
        />
      ))}
    </div>
  )
}
