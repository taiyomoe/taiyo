import Selectable, { type SelectableProps } from "react-selectable-box"
import { RangeSelectionItem } from "./range-selection-item"

type Props = {
  availableNumbers: number[]
  disabledNumbers: number[]
} & SelectableProps<number>

export const RangeSelectionCanvas = ({
  availableNumbers,
  disabledNumbers,
  ...rest
}: Props) => (
  <Selectable {...rest} mode="reverse">
    <div className="inset-0 flex h-full w-full flex-wrap gap-3 rounded-small border border-content3 bg-[radial-gradient(hsl(var(--nextui-content4))_1px,transparent_1px)] bg-content2 p-6 shadow-lg [background-size:16px_16px]">
      {availableNumbers.map((n) => (
        <RangeSelectionItem
          key={n}
          value={n}
          isDisabled={disabledNumbers.includes(n)}
        />
      ))}
    </div>
  </Selectable>
)
