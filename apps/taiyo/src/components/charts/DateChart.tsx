import { semanticColors } from "@nextui-org/react"
import type { DateRangeKey } from "@taiyomoe/types"
import { useCallback } from "react"
import Chart from "react-apexcharts"
import { DateRangeDropdown } from "~/components/stats/DateRangeDropdown"
import { ColorUtils } from "~/lib/utils/color.utils"
import { DateUtils } from "~/lib/utils/date.utils"

type Props = {
  id: string
  title: string
  series: ApexAxisChartSeries
}

export const DateChart = ({ id, title, series }: Props) => {
  const handleChange = useCallback(
    (key: DateRangeKey) => {
      ApexCharts.exec(
        id,
        "zoomX",
        DateUtils.getDateFromRange("from", key),
        DateUtils.getDateFromRange("to", key),
      )
    },
    [id],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-2xl">{title}</h2>
        <DateRangeDropdown onChange={handleChange} />
      </div>
      <Chart
        options={{
          colors: ["#ff4f4f", ...ColorUtils.generate(series.length - 1)],
          chart: {
            id,
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
