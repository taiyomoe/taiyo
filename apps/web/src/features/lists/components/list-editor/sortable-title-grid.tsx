import {
  type Announcements,
  closestCenter,
  DndContext,
  DragOverlay,
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
} from "@dnd-kit/sortable"
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { useHydrated } from "@tanstack/react-router"
import { useId, useState } from "react"
import { createPortal } from "react-dom"
import type { EditorTitle } from "@/features/lists/lib/list-editor"
import {
  DraggedTitleCard,
  SortableTitleCard,
} from "@/features/lists/components/list-editor/sortable-title-card"
import { listTitleCardStyles } from "@/features/lists/components/list-title-card"
import { m } from "@/paraglide/messages"

export function SortableTitleGrid({
  items,
  disabled,
  onChange,
}: {
  items: EditorTitle[]
  disabled: boolean
  onChange: (items: EditorTitle[]) => void
}) {
  const dndId = useId()
  const hydrated = useHydrated()
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const ids = items.map((item) => item.mediaId)
  const position = (id: UniqueIdentifier) => ids.indexOf(String(id)) + 1
  const activeIndex = activeId === null ? -1 : ids.indexOf(activeId)
  const activeItem = items[activeIndex]
  const announcements: Announcements = {
    onDragStart: ({ active }) => m.list_editor_drag_start({ position: position(active.id) }),
    onDragOver: ({ active, over }) =>
      over === null
        ? undefined
        : m.list_editor_drag_over({ from: position(active.id), to: position(over.id) }),
    onDragEnd: ({ active, over }) =>
      over === null
        ? undefined
        : m.list_editor_drag_end({ from: position(active.id), to: position(over.id) }),
    onDragCancel: ({ active }) => m.list_editor_drag_cancel({ position: position(active.id) }),
  }

  return (
    <DndContext
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: m.list_editor_drag_instructions() },
      }}
      collisionDetection={closestCenter}
      id={dndId}
      onDragCancel={() => {
        setActiveId(null)
      }}
      onDragEnd={({ active, over }) => {
        setActiveId(null)

        if (over !== null && active.id !== over.id) {
          onChange(arrayMove(items, position(active.id) - 1, position(over.id) - 1))
        }
      }}
      onDragStart={({ active }) => {
        setActiveId(String(active.id))
      }}
      sensors={sensors}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <ol sx={listTitleCardStyles.grid}>
          {items.map((item, index) => (
            <SortableTitleCard
              disabled={disabled}
              key={item.mediaId}
              onRemove={() => {
                onChange(items.filter((other) => other.mediaId !== item.mediaId))
              }}
              position={index + 1}
              title={item}
            />
          ))}
        </ol>
      </SortableContext>
      {hydrated
        ? createPortal(
            <DragOverlay>
              {activeItem === undefined ? null : (
                <DraggedTitleCard position={activeIndex + 1} title={activeItem} />
              )}
            </DragOverlay>,
            document.body,
          )
        : null}
    </DndContext>
  )
}
