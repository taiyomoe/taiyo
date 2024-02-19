"use client"

import { useMemo } from "react"

import { MediaChaptersUploadersStats } from "@taiyomoe/types"
import { DateChart } from "~/components/charts/DateChart"

type Props = {
  data: MediaChaptersUploadersStats
}

export const ChapterUploadersChart = ({ data }: Props) => {
  const chapters = useMemo(
    () =>
      Object.entries(
        data.reduce(
          (acc, record) => {
            const userName = record.userName

            if (!acc[userName]) {
              acc[userName] = []
            }

            acc[userName]!.push(record)
            return acc
          },
          {} as Record<string, MediaChaptersUploadersStats>,
        ),
      ).map(([userName, records]) => ({
        userName: userName,
        chapters: Object.entries(
          records
            .map((d) => ({ x: d.date, y: d.chaptersCount }))
            .reduce(
              (acc, d) => {
                const timestamp = new Date(d.x).getTime()

                if (acc[timestamp]) {
                  acc[timestamp] += d.y
                } else {
                  acc[timestamp] = d.y
                }

                return acc
              },
              {} as Record<number, number>,
            ),
        ).map(([key, value]) => [Number(key), value]),
      })),

    [data],
  )

  return (
    <DateChart
      id="chapter-uploaders-stats"
      title="Capítulos upados por uploader"
      series={chapters.map((d) => ({ name: d.userName, data: d.chapters }))}
    />
  )
}
