import { Button } from "@nextui-org/button"
import { type SlotsToClasses, type VariantProps, tv } from "@nextui-org/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type { HTMLAttributes } from "react"

const carouselButtons = tv({
  base: "flex w-fit gap-4",
  slots: {
    prev: "embla__prev z-10 data-[hover]:bg-primary/30",
    next: "embla__next z-10 data-[hover]:bg-primary/30",
  },
  variants: {
    orientation: {
      horizontal: {},
      vertical: {
        prev: "rotate-90",
        next: "rotate-90",
      },
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
})

type Props = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof carouselButtons> & {
    classNames?: SlotsToClasses<keyof (typeof carouselButtons)["slots"]>
    onPrev: () => void
    onNext: () => void
  }

export const CarouselButtons = ({
  className,
  classNames,
  orientation,
  onPrev,
  onNext,
  ...props
}: Props) => {
  const slots = carouselButtons({ orientation })

  return (
    <div className={slots.base({ className })} {...props}>
      <Button
        className={slots.prev({ className: classNames?.prev })}
        startContent={<ChevronLeftIcon />}
        onPress={onPrev}
        color="primary"
        variant="light"
        radius="full"
        isIconOnly
      />
      <Button
        className={slots.next({ className: classNames?.next })}
        startContent={<ChevronRightIcon />}
        onPress={onNext}
        color="primary"
        variant="light"
        radius="full"
        isIconOnly
      />
    </div>
  )
}
