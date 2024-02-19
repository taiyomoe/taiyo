"use client"

import { useMemo } from "react"

import { MediaChaptersUploadersStats } from "@taiyomoe/types"
import { DateChart } from "~/components/charts/DateChart"

type Props = {
  data: MediaChaptersUploadersStats
}

export const UploadedChaptersChart = ({ data }: Props) => {
  const chapters = useMemo(
    () =>
      Object.entries(
        data
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
    [data],
  )

  return (
    <DateChart
      id="uploaded-chapters-stats"
      title="Capítulos upados"
      series={[{ data: chapters }]}
    />
  )
}
