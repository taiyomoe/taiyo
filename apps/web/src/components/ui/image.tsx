"use client"
import NextImage, { type ImageProps as NextImageProps } from "next/image"
import { useState } from "react"
import { type VariantProps, tv } from "tailwind-variants"
import { Skeleton } from "~/components/ui/skeleton"
import { cn } from "~/utils/cn"

const image = tv({
  base: "relative min-w-fit overflow-hidden",
  slots: {
    skeleton: "absolute size-full",
    image:
      "size-full opacity-0 transition-transform duration-300 data-[loading=false]:opacity-100",
  },
  variants: {
    radius: {
      md: "rounded *:rounded",
      full: "rounded-full *:rounded-full",
    },
    shouldZoom: {
      true: "hover:[&_img]:scale-110",
    },
  },
})

export type ImageProps = NextImageProps &
  VariantProps<typeof image> & {
    classNames?: Record<
      "base" | keyof (typeof image)["slots"],
      string | undefined
    >
  }

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
export const Image = ({
  className,
  classNames,
  radius,
  shouldZoom,
  ...props
}: ImageProps) => {
  const slots = image({ radius, shouldZoom })
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div
      className={slots.base({ className: classNames?.base })}
      style={{
        transition:
          "color 200ms, background 200ms, opacity 200ms, width 300ms, height 300ms, min-width 300ms, min-height 300ms, max-width 300ms, max-height 300ms, padding 300ms",
      }}
    >
      {(isLoading || typeof window === "undefined") && (
        <Skeleton
          className={slots.skeleton({ className: classNames?.skeleton })}
        />
      )}
      <NextImage
        className={slots.image({ className: cn(className, classNames?.image) })}
        onLoad={() => setIsLoading(false)}
        data-loading={isLoading}
        {...props}
      />
    </div>
  )
}
