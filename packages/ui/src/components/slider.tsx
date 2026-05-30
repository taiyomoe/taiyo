import { Slider as BaseSlider } from "@base-ui-components/react/slider"
import { type ComponentProps, useMemo } from "react"
import { cn } from "../utils/cn"

export const Slider = ({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: ComponentProps<typeof BaseSlider.Root>) => {
  const _values = useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  )

  return (
    <BaseSlider.Root
      className={cn(
        "relative flex w-full touch-none items-center select-none disabled:cursor-not-allowed disabled:opacity-50 vertical:h-full vertical:min-h-64 vertical:w-auto vertical:flex-col horizontal:min-w-64",
        className,
      )}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      data-slot="slider"
      {...props}
    >
      <BaseSlider.Control
        className="grid grow vertical:h-full vertical:w-2 horizontal:h-2 horizontal:w-full"
        data-slot="slider-control"
      >
        <BaseSlider.Track
          className="relative overflow-hidden rounded-full bg-muted shadow-[inset_0_0_0_1px] shadow-subtle vertical:w-full horizontal:h-full"
          data-slot="slider-track"
        >
          <BaseSlider.Indicator
            className="absolute bg-primary vertical:w-full horizontal:h-full"
            data-slot="slider-range"
          />
        </BaseSlider.Track>
        {Array.from({ length: _values.length }, (_, i) => (
          <BaseSlider.Thumb
            key={i}
            className="block size-4 shrink-0 rounded-full border bg-subtle shadow-sm ring-primary transition-[color,box-shadow] hover:not-disabled:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:not-disabled:ring-3"
            data-slot="slider-thumb"
          />
        ))}
      </BaseSlider.Control>
    </BaseSlider.Root>
  )
}
