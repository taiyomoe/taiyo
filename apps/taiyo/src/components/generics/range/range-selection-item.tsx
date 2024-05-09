import { useSelectable } from "react-selectable-box"
import type { RangeItem } from "~/lib/types"

type Props = { isDisabled: boolean } & RangeItem

export const RangeSelectionItem = ({ label, value, isDisabled }: Props) => {
  const { setNodeRef, isSelected, isAdding, isRemoving } = useSelectable({
    value,
    disabled: isDisabled,
  })

  return (
    <span
      className="flex h-6 select-none items-center rounded-md bg-default-300 px-3 text-sm transition-background data-[adding=true]:bg-primary/50 data-[removing=true]:bg-warning-300 data-[selected=true]:bg-primary data-[disabled=true]:opacity-35"
      ref={setNodeRef}
      data-selected={isSelected}
      data-adding={isAdding}
      data-removing={isRemoving}
      data-disabled={isDisabled}
    >
      {label}
    </span>
  )
}
