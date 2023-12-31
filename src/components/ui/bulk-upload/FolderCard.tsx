import { Card, CardBody } from "@nextui-org/card"
import { Spinner } from "@nextui-org/react"
import { CheckIcon, HourglassIcon, RefreshCwIcon } from "lucide-react"
import prettyBytes from "pretty-bytes"
import { useMemo } from "react"
import { ImageFolder } from "~/lib/types"
import { useImageFolderStore } from "~/stores"

type Props = {
  folder: ImageFolder
  position: string
}

export const FolderCard = ({ folder, position }: Props) => {
  const [chapterNumber, files] = folder
  const { compressing, uploading, uploaded } = useImageFolderStore()
  const totalBytes = files.map((f) => f.size).reduce((a, b) => a + b, 0)

  const computeStatusIcon = useMemo(() => {
    switch (true) {
      case compressing.includes(chapterNumber):
        return <RefreshCwIcon className="text-blue-400" size={20} />
      case uploading.includes(chapterNumber):
        return <Spinner size="sm" />
      case uploaded.includes(chapterNumber):
        return <CheckIcon className="text-success" size={20} />
      default:
        return (
          <RefreshCwIcon
            className="text-blue-400 animate-spin-medium"
            size={20}
          />
        )
    }
  }, [compressing, uploading, uploaded, chapterNumber])

  return (
    <Card className="bg-content2">
      <CardBody>
        <div className="flex justify-between">
          <div className="flex gap-4 items-center">
            {computeStatusIcon}
            <p>
              Capítulo {chapterNumber}{" "}
              <span className="text-sm text-default-500">
                ({files.length} imagens, {prettyBytes(totalBytes)})
              </span>
            </p>
          </div>
          <p>{position}</p>
        </div>
      </CardBody>
    </Card>
  )
}
