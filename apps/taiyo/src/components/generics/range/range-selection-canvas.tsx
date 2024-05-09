import Selectable, { type SelectableProps } from "react-selectable-box"
import type { RangeItem, RangeValue } from "~/lib/types"
import { RangeSelectionItem } from "./range-selection-item"

type Props = {
  items: RangeItem[]
  disabledValues: RangeValue[]
} & Omit<SelectableProps<RangeValue>, "items">

export const RangeSelectionCanvas = ({
  items,
  disabledValues,
  ...rest
}: Props) => (
  <Selectable {...rest} mode="reverse">
    <div className="inset-0 flex h-full w-full flex-wrap gap-3 rounded-small border border-content3 bg-[radial-gradient(hsl(var(--nextui-content4))_1px,transparent_1px)] bg-content2 p-6 shadow-lg [background-size:16px_16px]">
      {items.map((item) => (
        <RangeSelectionItem
          key={item.value}
          isDisabled={disabledValues.includes(item.value)}
          {...item}
        />
      ))}
    </div>
  </Selectable>
)
