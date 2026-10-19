import type { ImageMimeType } from "@taiyomoe/db/constants"
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
import { Close, Image } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { focus } from "@taiyomoe/ui/styles/recipes"
import { colors, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId, useState } from "react"
import { isUploadablePage } from "@/lib/queries/submissions"
import { m } from "@/paraglide/messages"

export type PageFile = { key: string; url: string; file: File & { type: ImageMimeType } }

const styles = stylex.create({
  drop: {
    padding: "1.75rem",
    borderColor: {
      default: colors.border,
      ":hover": `color-mix(in srgb, ${colors.foreground} 30%, transparent)`,
    },
    borderRadius: radius.xl,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    transitionDuration: motion.enter,
    transitionProperty: "border-color",
  },
  dropActive: {
    borderColor: colors.primary,
  },
  dropTitle: {
    color: colors.foreground,
    fontWeight: 500,
  },
  input: {
    display: "none",
  },
  icon: {
    height: "1.75rem",
    width: "1.75rem",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: "0.375rem",
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(8.5rem, 1fr))",
    marginTop: "1rem",
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
  skipped: {
    margin: 0,
    color: colors.warning,
    fontSize: "0.875rem",
    marginTop: "0.75rem",
  },
})
const byName = (a: PageFile, b: PageFile) =>
  a.file.name.localeCompare(b.file.name, undefined, { numeric: true, sensitivity: "base" })

function SortablePage({
  page,
  index,
  disabled,
  onRemove,
}: {
  page: PageFile
  index: number
  disabled: boolean
  onRemove: () => void
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
      <img alt="" draggable={false} src={page.url} sx={styles.thumb} />
      <div sx={styles.meta}>
        <span sx={styles.index}>{index + 1}</span>
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
      </div>
    </li>
  )
}

export function PageFiles({
  value,
  onChange,
  disabled,
}: {
  value: PageFile[]
  onChange: (value: PageFile[]) => void
  disabled: boolean
}) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)
  const [skipped, setSkipped] = useState(0)
  const add = (files: FileList | null) => {
    const list = [...(files ?? [])]
    const accepted = list.filter(isUploadablePage)

    setSkipped(list.length - accepted.length)
    onChange(
      [
        ...value,
        ...accepted.map((file) => ({
          key: crypto.randomUUID(),
          url: URL.createObjectURL(file),
          file,
        })),
      ].sort(byName),
    )
  }
  const dndId = useId()
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const position = (id: UniqueIdentifier) => value.findIndex((page) => page.key === id) + 1
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
    <div>
      <label
        htmlFor={inputId}
        onDragLeave={() => {
          setDragging(false)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)

          if (!disabled) {
            add(event.dataTransfer.files)
          }
        }}
        sx={[styles.drop, dragging && styles.dropActive]}
      >
        <Image {...stylex.props(styles.icon)} />
        <span sx={styles.dropTitle}>{m.upload_pages_drop()}</span>
        <span>{m.upload_pages_hint()}</span>
        <input
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={disabled}
          id={inputId}
          multiple
          onChange={(event) => {
            add(event.target.files)
            event.target.value = ""
          }}
          sx={styles.input}
          type="file"
        />
      </label>
      {skipped === 0 ? null : (
        <p sx={styles.skipped}>{m.upload_pages_skipped({ count: skipped })}</p>
      )}
      {value.length === 0 ? null : (
        <DndContext
          accessibility={{
            announcements,
            screenReaderInstructions: { draggable: m.upload_pages_drag_instructions() },
          }}
          collisionDetection={closestCenter}
          id={dndId}
          onDragEnd={({ active, over }) => {
            if (over !== null && active.id !== over.id) {
              onChange(arrayMove(value, position(active.id) - 1, position(over.id) - 1))
            }
          }}
          sensors={sensors}
        >
          <SortableContext items={value.map((page) => page.key)} strategy={rectSortingStrategy}>
            <ol sx={styles.list}>
              {value.map((page, index) => (
                <SortablePage
                  disabled={disabled}
                  index={index}
                  key={page.key}
                  onRemove={() => {
                    URL.revokeObjectURL(page.url)
                    onChange(value.filter((item) => item.key !== page.key))
                  }}
                  page={page}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
