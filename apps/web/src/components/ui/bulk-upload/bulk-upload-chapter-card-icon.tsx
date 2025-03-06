import { Spinner } from "@heroui/spinner"
import { UploadChapterState } from "@taiyomoe/types"
import { CheckIcon, HourglassIcon, XIcon } from "lucide-react"

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

  if (state === UploadChapterState.ERROR) {
    return <XIcon className="text-danger" size={20} />
  }

  return <CheckIcon className="text-success" size={20} />
}
