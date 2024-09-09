import { Image, type ImageProps } from "@nextui-org/image"
import type { SlotsToClasses } from "@nextui-org/react"
import NextImage from "next/image"
import { cn } from "~/lib/utils/cn"

type Props = {
  classNames: SlotsToClasses<"height" | "width" | "wrapper" | "img">
  maxHeight: number
  maxWidth: number
  alt: string
} & Omit<ImageProps, "classNames">

export const MediaImage = (props: Props) => {
  const { src, classNames, maxHeight, maxWidth, ...rest } = props

  return (
    <Image
      as={NextImage}
      src={src}
      classNames={{
        wrapper: cn(
          "!max-w-full z-0 select-none",
          classNames?.width,
          classNames?.wrapper,
        ),
        img: cn("w-full object-cover", classNames?.height, classNames?.img),
        blurredImg: cn(classNames?.height, classNames?.width),
        zoomedWrapper: classNames?.height,
      }}
      height={maxHeight}
      width={maxWidth}
      {...rest}
    />
  )
}
