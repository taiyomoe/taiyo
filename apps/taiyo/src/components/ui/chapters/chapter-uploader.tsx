import { type VariantProps, tv } from "@nextui-org/react"
import { UserIcon } from "lucide-react"
import Link from "next/link"

type Props = {
  chapter: { uploader: { id: string; name: string | null } } | null
  className?: string
  classNames?: Partial<(typeof mediaChapterUploader)["slots"]>
} & VariantProps<typeof mediaChapterUploader>

const mediaChapterUploader = tv({
  base: "flex w-fit max-w-[112px] items-center place-self-end",
  slots: {
    icon: "w-auto",
    link: "block select-none truncate px-1 transition-all hover:bg-content4",
  },
  variants: {
    size: {
      sm: {
        base: "gap-1",
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

export const ChapterUploader = (props: Props) => {
  const { chapter, className, classNames, ...variants } = props
  const slots = mediaChapterUploader({ className, ...variants })

  if (!chapter) return null

  return (
    <div className={slots.base()}>
      <UserIcon className={slots.icon()} />
      {chapter.uploader && (
        <object>
          <Link className={slots.link()} href={`/user/${chapter.uploader.id}`}>
            {chapter.uploader.name}
          </Link>
        </object>
      )}
    </div>
  )
}
