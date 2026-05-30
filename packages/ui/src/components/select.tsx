import { Select as BaseSelect } from "@base-ui-components/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { cn } from "../utils/cn"

export const Select = (props: ComponentProps<typeof BaseSelect.Root>) => (
  <BaseSelect.Root data-slot="select" {...props} />
)

export const SelectValue = (props: ComponentProps<typeof BaseSelect.Value>) => (
  <BaseSelect.Value data-slot="select-value" {...props} />
)

export const SelectTrigger = ({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseSelect.Trigger>) => (
  <BaseSelect.Trigger
    className={cn(
      "group flex h-9 w-full min-w-64 justify-between gap-4 rounded border border-subtle bg-muted px-3 py-2 text-sm text-primary transition-[background,scale,border] duration-300 outline-none select-none open:border-emphasis hover:cursor-pointer hover:not-disabled:border-emphasis focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default disabled:cursor-not-allowed disabled:opacity-50 pressed:scale-[0.98] pressed:border-emphasis",
      className,
    )}
    data-slot="select-trigger"
    {...props}
  >
    {children}
    <BaseSelect.Icon className="flex items-center justify-center" data-slot="select-icon">
      <ChevronDownIcon className="size-4 text-subtle transition-transform duration-300 group-open:rotate-180" />
    </BaseSelect.Icon>
  </BaseSelect.Trigger>
)

export const SelectContent = ({
  children,
  className,
  ...props
}: ComponentProps<typeof BaseSelect.Popup>) => (
  <BaseSelect.Portal data-slot="select-portal">
    <BaseSelect.Positioner
      className="z-10 outline-none select-none"
      data-slot="select-positioner"
      alignItemWithTrigger={false}
      sideOffset={4}
    >
      <BaseSelect.ScrollUpArrow
        className="top-0 z-1 flex h-4 w-full cursor-default items-center justify-center rounded-md bg-muted text-center text-xs before:absolute before:-top-full before:left-0 before:size-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:-bottom-full"
        data-slot="select-scroll-up-arrow"
      />
      <BaseSelect.Popup
        className={cn(
          "group max-h-(--available-height) origin-(--transform-origin) overflow-y-auto rounded border border-subtle bg-muted bg-clip-padding py-1 text-subtle shadow-lg shadow-gray-200 transition-[transform,scale,opacity] outline-none data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[side=none]:scroll-py-5 data-[side=none]:data-[ending-style]:transition-none data-[starting-style]:scale-90 data-[starting-style]:opacity-0 data-[side=none]:data-[starting-style]:scale-100 data-[side=none]:data-[starting-style]:opacity-100 data-[side=none]:data-[starting-style]:transition-none dark:shadow-none",
          className,
        )}
        data-slot="select-popup"
        {...props}
      >
        {children}
      </BaseSelect.Popup>
      <BaseSelect.ScrollDownArrow
        className="bottom-0 z-1 flex h-4 w-full cursor-default items-center justify-center rounded-md bg-muted text-center text-xs before:absolute before:-top-full before:left-0 before:size-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:-bottom-full"
        data-slot="select-scroll-down-arrow"
      />
    </BaseSelect.Positioner>
  </BaseSelect.Portal>
)

export const SelectItem = ({
  children,
  className,
  ...props
}: ComponentProps<typeof BaseSelect.Item>) => (
  <BaseSelect.Item
    className={cn(
      "grid min-w-(--anchor-width) cursor-default grid-cols-[1fr_0.75rem] items-center gap-4 px-3 py-2 text-sm outline-none select-none group-data-[side=none]:min-w-[calc(var(--anchor-width)+1rem)] group-data-[side=none]:scroll-my-1 group-data-[side=none]:pr-12 group-data-[side=none]:text-base group-data-[side=none]:leading-4 hover:cursor-pointer disabled:pointer-events-none disabled:opacity-50 highlighted:relative highlighted:z-0 highlighted:text-primary highlighted:before:absolute highlighted:before:inset-x-1 highlighted:before:inset-y-0 highlighted:before:z-[-1] highlighted:before:rounded-sm highlighted:before:bg-emphasis selected:font-medium selected:text-primary",
      className,
    )}
    data-slot="select-item"
    {...props}
  >
    <BaseSelect.ItemText className="col-start-1" data-slot="select-item-text">
      {children}
    </BaseSelect.ItemText>
    <BaseSelect.ItemIndicator className="col-start-2" data-slot="select-item-indicator">
      <CheckIcon className="size-3" />
    </BaseSelect.ItemIndicator>
  </BaseSelect.Item>
)
