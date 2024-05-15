import { Card, CardBody } from "@nextui-org/card"
import {
  UploadChapterState,
  type UploadChaptersInput,
} from "@taiyomoe/image-orchestrator"
import { useAtomValue } from "jotai"
import prettyBytes from "pretty-bytes"
import { useMemo } from "react"
import { bulkUploadChaptersStateAtoms } from "~/atoms/bulkUploadChapters.atoms"
import { BulkUploaderChapterCardIcon } from "./bulk-upload-chapter-card-icon"

type Props = {
  chapter: UploadChaptersInput["chapters"][number]
  position: string
  index: number
}

export const BulkUploadChapterCard = ({ chapter, position, index }: Props) => {
  const prettifiedBytes = useMemo(
    () =>
      prettyBytes(chapter.files.map((f) => f.size).reduce((a, b) => a + b, 0)),
    [chapter.files],
  )
  const chapterState =
    useAtomValue(bulkUploadChaptersStateAtoms)[index] ??
    UploadChapterState.PENDING

  return (
    <Card>
      <CardBody>
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <BulkUploaderChapterCardIcon state={chapterState} />
            <p>
              Capítulo {chapter.number}{" "}
              <span className="text-default-500 text-sm">
                ({chapter.files.length} imagens, {prettifiedBytes})
              </span>
            </p>
          </div>
          <p>{position}</p>
        </div>
      </CardBody>
    </Card>
  )
}
