"use client"
import NextImage, { type ImageProps as NextImageProps } from "next/image"
import { useState } from "react"
import { type VariantProps, tv } from "tailwind-variants"
import { Skeleton } from "~/components/ui/skeleton"

const image = tv({
  base: "relative transition-[width,height,min-width,min-height] duration-300",
  slots: {
    skeleton: "absolute size-full",
    image: "size-full",
  },
  variants: {
    radius: {
      md: "*:rounded",
      full: "*:rounded-full",
    },
  },
})

export type ImageProps = NextImageProps & VariantProps<typeof image>

/**
 * Images are hard. Even more if its size is dynamic.
 *
 * @example
 *
 * <Image
 *   src={image}
 *   className="max-h-8 min-h-8 min-w-8 max-w-8 md:max-h-12 md:min-h-12 md:min-w-12 md:max-w-12"
 *   alt="Avatar"
 *   width={48}
 *   height={48}
 *   radius="full"
 * />
 */
export const Image = ({ className, radius, ...props }: ImageProps) => {
  const slots = image({ radius })
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={slots.base({ className })}>
      {isLoading && <Skeleton className={slots.skeleton()} />}
      <NextImage
        className={slots.image()}
        onLoad={() => setIsLoading(false)}
        style={{ opacity: isLoading ? 0 : 1 }}
        {...props}
      />
    </div>
  )
}
