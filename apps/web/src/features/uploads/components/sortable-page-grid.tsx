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
import * as stylex from "@stylexjs/stylex"
import { useHydrated } from "@tanstack/react-router"
import { useId, useState } from "react"
import { createPortal } from "react-dom"
import {
  DraggedPage,
  type GridPage,
  SortablePage,
} from "@/features/uploads/components/sortable-page"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.375rem",
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(8.5rem, 1fr))",
  },
})

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
  const hydrated = useHydrated()
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const keys = pages.map((page) => page.key)
  const position = (id: UniqueIdentifier) => keys.indexOf(String(id)) + 1
  const activeIndex = activeKey === null ? -1 : keys.indexOf(activeKey)
  const activePage = pages[activeIndex]
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
      onDragCancel={() => {
        setActiveKey(null)
      }}
      onDragEnd={({ active, over }) => {
        setActiveKey(null)

        if (over !== null && active.id !== over.id) {
          onReorder(arrayMove(keys, position(active.id) - 1, position(over.id) - 1))
        }
      }}
      onDragStart={({ active }) => {
        setActiveKey(String(active.id))
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
      {hydrated
        ? createPortal(
            <DragOverlay>
              {activePage === undefined ? null : (
                <DraggedPage
                  index={activeIndex}
                  page={activePage}
                  removable={onRemove !== undefined}
                />
              )}
            </DragOverlay>,
            document.body,
          )
        : null}
    </DndContext>
  )
}
