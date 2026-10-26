import {
  type Announcements,
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import * as stylex from "@stylexjs/stylex"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { focus } from "@taiyomoe/ui/styles/recipes"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId } from "react"
import { m } from "@/paraglide/messages"

export type GridPage = { key: string; url: string | null }

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.375rem",
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(8.5rem, 1fr))",
  },
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

function SortablePage({
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

export function SortablePageGrid({
  pages,
  disabled = false,
  onReorder,
  onRemove,
}: {
  pages: GridPage[]
  disabled?: boolean
  onReorder: (keys: string[]) => void
  onRemove?: (key: string) => void
}) {
  const dndId = useId()
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const keys = pages.map((page) => page.key)
  const position = (id: UniqueIdentifier) => keys.indexOf(String(id)) + 1
  const announcements: Announcements = {
    onDragStart: ({ active }) => m.upload_pages_drag_start({ page: position(active.id) }),
    onDragOver: ({ active, over }) =>
      over === null
        ? undefined
        : m.upload_pages_drag_over({ page: position(active.id), position: position(over.id) }),
    onDragEnd: ({ active, over }) =>
      over === null
        ? undefined
        : m.upload_pages_drag_end({ page: position(active.id), position: position(over.id) }),
    onDragCancel: ({ active }) => m.upload_pages_drag_cancel({ page: position(active.id) }),
  }

  return (
    <DndContext
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: m.upload_pages_drag_instructions() },
      }}
      collisionDetection={closestCenter}
      id={dndId}
      onDragEnd={({ active, over }) => {
        if (over !== null && active.id !== over.id) {
          onReorder(arrayMove(keys, position(active.id) - 1, position(over.id) - 1))
        }
      }}
      sensors={sensors}
    >
      <SortableContext items={keys} strategy={rectSortingStrategy}>
        <ol sx={styles.list}>
          {pages.map((page, index) => (
            <SortablePage
              disabled={disabled}
              index={index}
              key={page.key}
              onRemove={
                onRemove === undefined
                  ? undefined
                  : () => {
                      onRemove(page.key)
                    }
              }
              page={page}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  )
}
