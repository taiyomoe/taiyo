import { defineChart, lineY } from "@tanstack/charts"
import { Chart } from "@tanstack/charts/react"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { useMemo } from "react"
import { chartTheme } from "@/features/dashboard/components/overview/chart-frame"

type SparklineProps = {
  values: readonly number[]
  tone: string
  label: string
}

export function Sparkline({ values, tone, label }: SparklineProps) {
  const definition = useMemo(() => {
    const min = Math.min(...values)
    const max = Math.max(...values)

    return defineChart({
      marks: [
        lineY(
          values.map((value, index) => ({ index, value })),
          { x: "index", y: "value", stroke: tone, strokeWidth: 2 },
        ),
      ],
      scales: {
        x: { scale: scaleLinear },
        y: {
          scale: scaleLinear().domain(
            min === max ? [Math.min(min, 0), Math.max(max, 1)] : [min, max],
          ),
        },
      },
      guides: false,
      margin: 3,
      focus: false,
      pointer: false,
      keyboard: false,
      theme: chartTheme,
    })
  }, [values, tone])

  return <Chart ariaLabel={label} definition={definition} height={40} initialWidth={160} />
}
