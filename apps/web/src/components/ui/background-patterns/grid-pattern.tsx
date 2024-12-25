import { type SVGProps, useId } from "react"
import { cn } from "~/lib/utils/cn"

type Props = {
  squares?: Array<[x: number, y: number]>
} & SVGProps<SVGSVGElement>

export const GridPattern = ({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  squares,
  className,
  ...props
}: Props) => {
  const id = useId()

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          <title>Grid pattern</title>
          {squares.map(([x, y]) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={Number(width) - 1}
              height={Number(height) - 1}
              x={x * Number(width) + 1}
              y={y * Number(height) + 1}
            />
          ))}
        </svg>
      )}
    </svg>
  )
}
