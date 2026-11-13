import * as stylex from "@stylexjs/stylex"
import { MEDIA_RELATION_TYPES } from "@taiyomoe/db/constants"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useParams } from "@tanstack/react-router"
import type { EditorProps } from "@/features/media-suggestions/components/field-editors/editor-props"
import type { MediaEditRelation } from "@/features/media-suggestions/lib/media-edit-model"
import { EnumSelect } from "@/features/media-suggestions/components/field-editors/enum-select"
import { fieldEditorStyles } from "@/features/media-suggestions/components/field-editors/field-editor-styles"
import { RelatedMediaPicker } from "@/features/media-suggestions/components/field-editors/related-media-picker"
import { Cover } from "@/features/media/components/cover"
import { RELATION_TYPE_LABELS } from "@/features/recommendations/lib/recommendation-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  row: {
    gap: "0.5rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "2rem minmax(0, 1fr) 10rem auto",
  },
  cover: {
    borderRadius: radius.sm,
    width: "2rem",
  },
  title: {
    overflow: "hidden",
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function RelationsEditor({ draft, onChange: change }: EditorProps) {
  const { mediaId } = useParams({ strict: false })
  const value = draft.relations
  const onChange = (next: MediaEditRelation[]) => {
    change({ ...draft, relations: next })
  }

  return (
    <div sx={fieldEditorStyles.stack}>
      {value.length === 0 ? (
        <p sx={fieldEditorStyles.muted}>{m.media_edit_relation_empty()}</p>
      ) : null}
      {value.map((relation) => (
        <div key={relation.mediaId} sx={styles.row}>
          <Cover alt="" src={relation.coverUrl} sx={styles.cover} />
          <span sx={styles.title}>{relation.title ?? m.media_untitled()}</span>
          <EnumSelect
            label={m.media_edit_relation_type()}
            labels={RELATION_TYPE_LABELS}
            onChange={(type) => {
              onChange(
                value.map((item) => (item.mediaId === relation.mediaId ? { ...item, type } : item)),
              )
            }}
            options={MEDIA_RELATION_TYPES}
            value={relation.type}
          />
          <Button
            aria-label={m.media_edit_remove()}
            onClick={() => {
              onChange(value.filter((item) => item.mediaId !== relation.mediaId))
            }}
            size="icon-sm"
            variant="ghost"
          >
            <Close />
          </Button>
        </div>
      ))}
      <RelatedMediaPicker
        excludedIds={
          new Set([
            ...value.map((relation) => relation.mediaId),
            ...(mediaId === undefined ? [] : [mediaId]),
          ])
        }
        onPick={(media) => {
          onChange([...value, { ...media, type: "SEQUEL" }])
        }}
      />
    </div>
  )
}
