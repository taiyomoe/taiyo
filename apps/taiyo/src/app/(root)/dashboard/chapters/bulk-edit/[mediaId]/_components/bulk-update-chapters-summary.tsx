import { Accordion, AccordionItem } from "@nextui-org/accordion"
import type { MediaChapterWithScans } from "@taiyomoe/types"
import { unique } from "radash"
import { useMemo } from "react"

type Props = {
  type: "volumes" | "scans"
  chapters: MediaChapterWithScans[]
}

export const BulkUpdateChaptersSummary = ({ type, chapters }: Props) => {
  const allChapters = useMemo(
    () => unique(chapters, (c) => c.number).join(", "),
    [chapters],
  )
  const chaptersWithoutType = useMemo(() => {
    switch (type) {
      case "volumes":
        return chapters.filter((c) => c.volume === null).map((c) => c.number)
      case "scans":
        return chapters
          .filter((c) => c.scanIds.length === 0)
          .map((c) => c.number)
          .join(", ")
    }
  }, [type, chapters.filter])

  return (
    <Accordion>
      <AccordionItem title="Capítulos">{allChapters}</AccordionItem>
      <AccordionItem title="Capítulos sem volume">
        {chaptersWithoutType}
      </AccordionItem>
    </Accordion>
  )
}
