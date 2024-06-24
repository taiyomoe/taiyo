"use client"

import { type VariantProps, tv } from "@nextui-org/react"
import { UsersIcon } from "lucide-react"
import Link from "next/link"
import { debounce } from "radash"
import { cache, useEffect, useRef, useState } from "react"
import Marquee from "react-fast-marquee"
import { useEventListener } from "usehooks-ts"

type Props = {
  chapter: { scans: { id: string; name: string }[] }
  className?: string
  classNames?: Partial<(typeof chapterScansListHorizontal)["slots"]>
  index: number
} & VariantProps<typeof chapterScansListHorizontal>

const computeTextWidth = cache((text: string) => {
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  if (!context) return 0

  context.font = "14px 'Inter', sans-serif"

  return context.measureText(text).width
})

const chapterScansListHorizontal = tv({
  base: "flex items-center gap-1",
  slots: {
    icon: "",
    wrapper: "flex max-h-5 w-full gap-1",
    link: "mr-2 line-clamp-1 select-none px-1 transition-all hover:bg-content4",
    empty: "",
  },
  variants: {
    size: {
      sm: {
        base: "text-small",
        icon: "h-4 w-4 min-w-4",
        link: "rounded text-sm",
      },
    },
    color: {
      disabled: {
        base: "text-default-500",
        link: "hover:text-default-700",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    color: "disabled",
  },
})

export const ChapterScansListHorizontal = (props: Props) => {
  const {
    chapter: { scans },
    className,
    index,
    ...variants
  } = props
  const slots = chapterScansListHorizontal({ className, ...variants })
  const [shouldPlay, setShouldPlay] = useState(false)
  const wrapperRef = useRef<HTMLObjectElement>(null)

  const computeMarqueeWidth = debounce({ delay: 100 }, () => {
    const card = document.getElementById(`release-card-${index}`)
    const totalWidth = scans.reduce((acc, scan) => {
      return acc + computeTextWidth(scan.name) + 16
    }, 0)

    if (!card || !wrapperRef.current) return

    const cardWidth = card.clientWidth
    const containerWidth = cardWidth - 204 // image width + gap + icon + gap + uploader width + padding right

    wrapperRef.current.style.width = `${containerWidth}px`

    setShouldPlay(totalWidth > containerWidth)
  })

  useEffect(() => {
    computeMarqueeWidth()
  }, [computeMarqueeWidth])

  useEventListener("resize", computeMarqueeWidth)

  // This should return an empty element so it doesn't break the grid
  if (!scans.length) return <div />

  return (
    <div className={slots.base()}>
      <UsersIcon className={slots.icon()} />
      <object ref={wrapperRef} className={slots.wrapper()}>
        <Marquee
          play={shouldPlay}
          autoFill={shouldPlay}
          gradient={shouldPlay}
          gradientWidth={40}
          speed={15}
          pauseOnHover
        >
          {scans.map((scan) => (
            <Link
              key={scan.id}
              href={`/scans/${scan.id}`}
              className={slots.link()}
            >
              {scan.name}
            </Link>
          ))}
        </Marquee>
      </object>
    </div>
  )
}
