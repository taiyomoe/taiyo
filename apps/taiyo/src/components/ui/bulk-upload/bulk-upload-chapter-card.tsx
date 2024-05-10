import { Card, CardBody } from "@nextui-org/card"
import type { UploadChaptersInput } from "@taiyomoe/image-orchestrator"
import prettyBytes from "pretty-bytes"
import { useMemo } from "react"
import { BulkUploaderChapterCardIcon } from "./bulk-upload-chapter-card-icon"

type Props = {
  chapter: UploadChaptersInput["chapters"][number]
  position: string
}

export const BulkUploadChapterCard = ({ chapter, position }: Props) => {
  const prettifiedBytes = useMemo(
    () =>
      prettyBytes(chapter.files.map((f) => f.size).reduce((a, b) => a + b, 0)),
    [chapter.files],
  )

  return (
    <Card>
      <CardBody>
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <BulkUploaderChapterCardIcon state={chapter.state} />
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
