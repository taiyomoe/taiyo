import { forwardRef } from "react"
import {
  Button,
  FileTrigger,
  type FileTriggerProps,
} from "react-aria-components"
import { cn } from "~/lib/utils/cn"
import { AssetSelection } from "./asset-selection"

type Props = FileTriggerProps & {
  isSelected?: boolean
  className?: string
}

export const FolderSelection = forwardRef<HTMLButtonElement, Props>(
  ({ className, isSelected, ...props }, ref) => (
    <FileTrigger acceptDirectory {...props}>
      <Button
        className={cn(
          "rounded-medium bg-content1 shadow-medium outline-none transition-[background,transform] data-[pressed=true]:scale-[0.97] data-[hovered=true]:bg-content2",
          className,
        )}
        ref={ref}
        data-selected={isSelected}
      >
        <AssetSelection type="folder" />
      </Button>
    </FileTrigger>
  ),
)
