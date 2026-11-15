import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import * as stylex from "@stylexjs/stylex"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, consts, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { EditorTitle } from "@/features/lists/lib/list-editor"
import { ListTitleCardBody, listTitleCardStyles } from "@/features/lists/components/list-title-card"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  card: {
    cursor: { default: "grab", ":active": "grabbing" },
    position: "relative",
    touchAction: "manipulation",
    userSelect: "none",
  },
  source: {
    opacity: 0.35,
  },
  disabled: {
    cursor: "default",
  },
  moving: (transform: string, transition: string) => ({
    transition,
    transform,
  }),
  dragged: {
    borderRadius: radius.lg,
    boxShadow: shadows.overlay,
    cursor: "grabbing",
    transform: "rotate(-2deg) scale(1.03)",
  },
  remove: {
    backdropFilter: "blur(8px)",
    backgroundColor: {
      default: `color-mix(in srgb, ${colors.background} 78%, transparent)`,
      ":hover": `color-mix(in srgb, ${colors.background} 92%, transparent)`,
    },
    opacity: {
      default: 0,
      ":focus-visible": 1,
      ":is(:focus-visible > * > *)": 1,
      ":is(:hover > * > *)": 1,
      [consts.pointerCoarse]: 1,
    },
    position: "absolute",
    transitionDuration: "150ms",
    transitionProperty: "opacity, background-color",
    zIndex: 1,
    right: "0.375rem",
    top: "0.375rem",
  },
})

export function DraggedTitleCard({ title, position }: { title: EditorTitle; position: number }) {
  return (
    <div aria-hidden sx={[listTitleCardStyles.card, styles.dragged]}>
      <ListTitleCardBody eager position={position} title={title} />
    </div>
  )
}

export function SortableTitleCard({
  title,
  position,
  disabled,
  onRemove,
}: {
  title: EditorTitle
  position: number
  disabled: boolean
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: title.mediaId,
    disabled,
  })
  const label = title.title ?? m.media_untitled()

  return (
    <li
      ref={setNodeRef}
      sx={[
        listTitleCardStyles.card,
        styles.card,
        isDragging && styles.source,
        disabled && styles.disabled,
        transform === null
          ? null
          : styles.moving(CSS.Translate.toString(transform) ?? "none", transition ?? "none"),
      ]}
      {...attributes}
      {...listeners}
      aria-label={m.list_editor_item_label({ position, title: label })}
    >
      <ListTitleCardBody
        overlay={
          <Button
            aria-label={m.list_editor_remove_title({ title: label })}
            disabled={disabled}
            onClick={onRemove}
            onKeyDown={(event) => {
              event.stopPropagation()
            }}
            onPointerDown={(event) => {
              event.stopPropagation()
            }}
            size="icon-xs"
            sx={styles.remove}
            type="button"
            variant="ghost"
          >
            <Close />
          </Button>
        }
        position={position}
        title={title}
      />
    </li>
  )
}
