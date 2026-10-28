import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import * as stylex from "@stylexjs/stylex"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { focus } from "@taiyomoe/ui/styles/recipes"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

export type GridPage = { key: string; url: string | null }

const styles = stylex.create({
  page: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.card,
    cursor: "grab",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    userSelect: "none",
  },
  pageDragging: {
    borderColor: colors.ring,
    boxShadow: shadows.overlay,
    cursor: "grabbing",
    zIndex: 10,
  },
  pageDisabled: {
    cursor: "default",
  },
  moving: (transform: string, transition: string) => ({
    transition,
    transform,
  }),
  thumb: {
    aspectRatio: "3 / 4",
    backgroundColor: colors.muted,
    display: "block",
    objectFit: "cover",
    width: "100%",
  },
  meta: {
    padding: "0.375rem",
    gap: "0.125rem",
    alignItems: "center",
    display: "flex",
    paddingInlineStart: "0.625rem",
  },
  index: {
    color: colors.mutedForeground,
    flexGrow: 1,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
  placeholder: {
    aspectRatio: "3 / 4",
    backgroundColor: colors.muted,
    display: "block",
    width: "100%",
  },
})

export function SortablePage({
  page,
  index,
  disabled,
  onRemove,
}: {
  page: GridPage
  index: number
  disabled: boolean
  onRemove: (() => void) | undefined
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.key,
    disabled,
  })

  return (
    <li
      aria-label={m.upload_page_label({ index: index + 1 })}
      ref={setNodeRef}
      sx={[
        styles.page,
        focus.control,
        isDragging && styles.pageDragging,
        disabled && styles.pageDisabled,
        transform === null
          ? null
          : styles.moving(CSS.Transform.toString(transform) ?? "none", transition ?? "none"),
      ]}
      {...attributes}
      {...listeners}
    >
      {page.url === null ? (
        <span sx={styles.placeholder} />
      ) : (
        <img alt="" draggable={false} loading="lazy" src={page.url} sx={styles.thumb} />
      )}
      <div sx={styles.meta}>
        <span sx={styles.index}>{index + 1}</span>
        {onRemove === undefined ? null : (
          <Button
            aria-label={m.upload_page_remove()}
            disabled={disabled}
            onClick={onRemove}
            onKeyDown={(event) => {
              event.stopPropagation()
            }}
            onPointerDown={(event) => {
              event.stopPropagation()
            }}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <Close />
          </Button>
        )}
      </div>
    </li>
  )
}
