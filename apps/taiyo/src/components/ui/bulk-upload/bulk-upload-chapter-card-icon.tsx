import { Spinner } from "@nextui-org/spinner"
import { UploadChapterState } from "@taiyomoe/image-orchestrator"
import { CheckIcon, HourglassIcon } from "lucide-react"

type Props = {
  state: UploadChapterState
}

export const BulkUploaderChapterCardIcon = ({ state }: Props) => {
  if (state === UploadChapterState.PENDING) {
    return <HourglassIcon className="text-warning" size={20} />
  }

  if (state === UploadChapterState.UPLOADING) {
    return <Spinner size="sm" />
  }

  return <CheckIcon className="text-success" size={20} />
}
