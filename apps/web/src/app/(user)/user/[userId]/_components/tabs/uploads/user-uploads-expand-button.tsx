import { Button } from "@nextui-org/button"
import { useAtom, useAtomValue } from "jotai"
import { ChevronLeft } from "lucide-react"
import {
  userProfileAdditionalChapters,
  userProfileExpandedMedias,
} from "~/atoms/userProfile.atoms"

type Props = {
  mediaId: string
}

export const UserUploadsExpandButton = ({ mediaId }: Props) => {
  const [expandedMedias, setExpandedMedias] = useAtom(userProfileExpandedMedias)
  const additionalChapters = useAtomValue(userProfileAdditionalChapters)[
    mediaId
  ]
  const isExpanded = expandedMedias.includes(mediaId)

  const handlePress = () => {
    setExpandedMedias((prev) =>
      isExpanded ? prev.filter((m) => m !== mediaId) : prev.concat(mediaId),
    )
  }

  if (!additionalChapters) return null

  return (
    <Button
      className="hover:bg-content4"
      onPress={handlePress}
      startContent={
        <ChevronLeft
          className="data-[expanded=true]:-rotate-90 transition-transform"
          size={20}
          data-expanded={isExpanded}
        />
      }
      variant="light"
      size="sm"
      radius="sm"
      isIconOnly
    />
  )
}
