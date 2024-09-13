import { type VariantProps, tv } from "@nextui-org/react"
import { RelativeTime } from "~/components/ui/relative-time"
import { ClockIcon } from "lucide-react"
import { cn } from "~/lib/utils/cn"

type Props = {
  chapter: { createdAt: Date }
  className?: string
  classNames?: Partial<(typeof chapterUploadedTime)["slots"]>
} & VariantProps<typeof chapterUploadedTime>

const chapterUploadedTime = tv({
  base: "flex min-w-24 items-center justify-end gap-1",
  slots: {
    icon: "",
    text: "select-none rounded px-1 text-sm",
  },
  variants: {
    size: {
      sm: { icon: "h-4 w-4 min-w-4" },
    },
    color: {
      disabled: { base: "text-default-500" },
    },
  },
  defaultVariants: {
    size: "sm",
    color: "disabled",
  },
})

export const ChapterUploadedTime = (props: Props) => {
  const { chapter, className, classNames, ...variants } = props
  const slots = chapterUploadedTime({ className, ...variants })

  return (
    <div className={slots.base()}>
      <ClockIcon className={slots.icon({ className: classNames?.icon })} />
      <p className={cn(slots.text(), classNames?.text)}>
        <RelativeTime date={chapter.createdAt} />
      </p>
    </div>
  )
}
