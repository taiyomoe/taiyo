import { useSelectable } from "react-selectable-box"
import type { RangeItem } from "~/lib/types"

export const RangeSelectionItem = ({ label, value }: RangeItem) => {
  const { setNodeRef, isSelected, isAdding, isRemoving } = useSelectable({
    value,
  })

  return (
    <span
      className="data-[removing=true]:!bg-warning-300 flex h-6 select-none items-center rounded-md bg-default-300 px-3 text-sm transition-background data-[adding=true]:bg-primary/50 data-[selected=true]:bg-primary"
      ref={setNodeRef}
      data-selected={isSelected}
      data-adding={isAdding}
      data-removing={isRemoving}
    >
      {label}
    </span>
  )
}
