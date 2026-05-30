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
        "relative flex vertical:h-full vertical:min-h-64 vertical:w-auto w-full horizontal:min-w-64 touch-none select-none vertical:flex-col items-center disabled:cursor-not-allowed disabled:opacity-50",
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
        className="grid horizontal:h-2 vertical:h-full horizontal:w-full vertical:w-2 grow"
        data-slot="slider-control"
      >
        <BaseSlider.Track
          className="relative horizontal:h-full vertical:w-full overflow-hidden rounded-full bg-muted shadow-[inset_0_0_0_1px] shadow-subtle"
          data-slot="slider-track"
        >
          <BaseSlider.Indicator
            className="absolute horizontal:h-full vertical:w-full bg-primary"
            data-slot="slider-range"
          />
        </BaseSlider.Track>
        {Array.from({ length: _values.length }, (_, i) => (
          <BaseSlider.Thumb
            key={i}
            className="block size-4 shrink-0 rounded-full border bg-subtle shadow-sm ring-primary transition-[color,box-shadow] hover:not-disabled:ring-3 focus-visible:outline-hidden focus-visible:ring-3 active:not-disabled:ring-3"
            data-slot="slider-thumb"
          />
        ))}
      </BaseSlider.Control>
    </BaseSlider.Root>
  )
}
