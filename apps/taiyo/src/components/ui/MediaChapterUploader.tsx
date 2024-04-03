import { Skeleton } from "@nextui-org/skeleton"
import type { User } from "@prisma/client"
import { UserIcon } from "lucide-react"
import Link from "next/link"
import { tv } from "tailwind-variants"

type Props = {
  className?: string
  uploader?: User | Pick<User, "id" | "name">
  size?: "sm" | "md"
}

const mediaChapterUploader = tv({
  slots: {
    container: "flex w-full items-center",
    icon: "w-auto",
    skeleton: "grow",
    link: "select-none px-2 hover:bg-content3",
  },
  variants: {
    size: {
      sm: {
        container: "gap-1",
        icon: "h-4 md:h-5",
        skeleton: "rounded",
        link: "rounded text-sm",
      },
      md: {
        container: "gap-2",
        icon: "h-5",
        skeleton: "h-6 rounded-md",
        link: "rounded-md text-md",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
})

export const MediaChapterUploader = ({ uploader, size, className }: Props) => {
  const slots = mediaChapterUploader({ size })

  return (
    <div className={slots.container({ className })}>
      <UserIcon className={slots.icon()} />
      {!uploader && <Skeleton className={slots.skeleton()} />}
      {uploader && (
        <Link className={slots.link()} href={`/users/${uploader.id}`}>
          <p>{uploader.name}</p>
        </Link>
      )}
    </div>
  )
}
