import type { VariantProps } from "@nextui-org/react"
import { Skeleton } from "@nextui-org/skeleton"
import type { Scan } from "@prisma/client"
import { UsersIcon } from "lucide-react"
import Link from "next/link"
import { tv } from "tailwind-variants"

type Props = {
  scans?: Scan[] | Pick<Scan, "id" | "name">[]
} & VariantProps<typeof chapterScansList>

const chapterScansList = tv({
  base: "flex w-full",
  slots: {
    iconWrapper: "flex items-center",
    linkWrapper: "flex gap-1",
    icon: "w-auto",
    skeleton: "grow",
    link: "hover:bg-content3",
    text: "select-none truncate px-2",
  },
  variants: {
    size: {
      sm: {
        base: "gap-1",
        icon: "h-4 md:h-5", // intentional md:h-5
        skeleton: "rounded",
        link: "rounded",
        text: "text-sm",
      },
      md: {
        base: "gap-2",
        iconWrapper: "h-6",
        icon: "h-5",
        skeleton: "h-6 rounded-md",
        link: "rounded-md",
        text: "text-md",
      },
    },
    orientation: {
      horizontal: {
        linkWrapper: "scrollbar-none flex-row overflow-x-scroll",
      },
      vertical: {
        linkWrapper: "flex-col",
        link: "w-fit",
      },
    },
    isCompact: {
      true: {
        linkWrapper: "max-w-[150px]",
        text: "truncate",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    orientation: "horizontal",
  },
})

export const ChapterScansList = (props: Props) => {
  const { scans, size, orientation, isCompact } = props
  const slots = chapterScansList({ size, orientation })

  const scansToDisplay = isCompact ? scans?.slice(0, 1) : scans
  const otherScansCount =
    scans && scansToDisplay ? scans.length - scansToDisplay.length : 0

  return (
    <div className={slots.base()}>
      <div className={slots.iconWrapper()}>
        <UsersIcon className={slots.icon()} />
      </div>
      {scans === undefined && <Skeleton className={slots.skeleton()} />}
      {scans && scans.length === 0 && <p className={slots.text()}>Sem scans</p>}
      {scans && scans.length !== 0 && (
        <div className={slots.linkWrapper()}>
          {scansToDisplay?.map((scan) => (
            <Link
              key={scan.id}
              className={slots.link()}
              href={`/scans/${scan.id}`}
            >
              <p className={slots.text()}>{scan.name}</p>
            </Link>
          ))}
          {isCompact && otherScansCount !== 0 && (
            <p className={slots.text()}>+{otherScansCount}</p>
          )}
        </div>
      )}
    </div>
  )
}
