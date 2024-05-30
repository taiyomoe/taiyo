import { Button } from "@nextui-org/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

type Props = {
  onPrev: () => void
  onNext: () => void
}

export const FeaturedMediaControlButtons = ({ onPrev, onNext }: Props) => (
  <div className="absolute right-4 bottom-4 flex w-fit gap-4">
    <Button
      className="embla__prev z-10 data-[hover]:bg-primary/30"
      startContent={<ChevronLeftIcon />}
      onPress={onPrev}
      color="primary"
      variant="light"
      radius="full"
      isIconOnly
    />
    <Button
      className="embla__next z-10 data-[hover]:bg-primary/30"
      startContent={<ChevronRightIcon />}
      onPress={onNext}
      color="primary"
      variant="light"
      radius="full"
      isIconOnly
    />
  </div>
)
