import { useSession } from "@taiyomoe/auth/client"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { api } from "~/trpc/react"

type Props = {
  chapter: { id: string }
  completed: boolean
  setCompleted: Dispatch<SetStateAction<boolean>>
}

export const MediaChaptersTabRowProgressionButton = (props: Props) => {
  const { chapter, completed, setCompleted } = props
  const { mutate } = api.histories.updateProgression.useMutation()
  const { data: session } = useSession()
  const Icon = completed ? EyeOffIcon : EyeIcon

  const handleClick = () => {
    mutate({
      chapterId: chapter.id,
      completed: !completed,
    })

    setCompleted(!completed)
  }

  if (!session) return null

  return (
    <Icon
      className="h-4 w-4 min-w-4 text-default-500 transition-colors hover:cursor-pointer hover:text-foreground"
      onClick={handleClick}
    >
      <title>{completed ? "Marcar como não lido" : "Marcar como lido"}</title>
    </Icon>
  )
}
