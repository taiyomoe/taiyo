import { semanticColors } from "@nextui-org/react"
import { useCallback } from "react"
import Chart from "react-apexcharts"

import { DateRangeDropdown } from "~/components/stats/DateRangeDropdown"
import { DateRangeKey } from "~/lib/types"
import { DateUtils } from "~/lib/utils/date.utils"

type Props = {
  title: string
  series: ApexAxisChartSeries
}

export const DateChart = ({ title, series }: Props) => {
  const handleChange = useCallback((key: DateRangeKey) => {
    ApexCharts.exec(
      "uploaded-chapters-stats",
      "zoomX",
      DateUtils.getDateFromRange("from", key),
      DateUtils.getDateFromRange("to", key),
    )
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">{title}</h2>
        <DateRangeDropdown onChange={handleChange} />
      </div>
      <Chart
        options={{
          colors: ["#ff4f4f"],
          chart: {
            id: "uploaded-chapters-stats",
            locales: [require("apexcharts/dist/locales/pt-br.json")],
            defaultLocale: "pt-br",
            toolbar: {
              tools: {
                download: false,
              },
            },
          },
          xaxis: {
            type: "datetime",
            labels: { style: { cssClass: "fill-default-300" } },
          },
          yaxis: { labels: { style: { cssClass: "fill-default-300" } } },
          grid: { borderColor: semanticColors.dark.default[300] },
        }}
        series={series}
        type="area"
        height={400}
      />
    </div>
  )
}
