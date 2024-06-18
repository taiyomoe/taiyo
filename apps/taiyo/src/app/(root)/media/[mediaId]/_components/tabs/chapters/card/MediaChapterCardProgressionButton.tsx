import { tv } from "@nextui-org/react"
import { useSession } from "@taiyomoe/auth/client"
import type { MediaLimitedChapter } from "@taiyomoe/types"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { api } from "~/trpc/react"

type Props = {
  chapter: MediaLimitedChapter
  completed: boolean
  setCompleted: Dispatch<SetStateAction<boolean>>
}

const mediaChapterCardProgressionButton = tv({
  slots: {
    container: "hover:cursor-pointer",
    icon: "h-4 w-fit md:h-5",
  },
  variants: {
    completed: {
      true: {
        icon: "text-default-300",
      },
    },
  },
})

export const MediaChapterCardProgressionButton = (props: Props) => {
  const { chapter, completed, setCompleted } = props
  const slots = mediaChapterCardProgressionButton({ completed })
  const { mutate } = api.histories.updateProgression.useMutation()
  const Icon = completed ? EyeOffIcon : EyeIcon
  const divTitle = completed ? "Marcar como não lido" : "Marcar como lido"
  const { data: session } = useSession()

  const handleClick = () => {
    mutate({
      chapterId: chapter.id,
      completed: !completed,
    })

    setCompleted(!completed)
  }

  if (!session) return null

  return (
    <div className={slots.container()} onClick={handleClick} title={divTitle}>
      <Icon className={slots.icon()} />
    </div>
  )
}
