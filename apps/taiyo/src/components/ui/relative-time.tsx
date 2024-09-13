import { DateTime } from "luxon"
import { type HTMLAttributes, useEffect, useState } from "react"

type Props = HTMLAttributes<HTMLParagraphElement> & {
  date: Date
}

export const RelativeTime = ({ date, ...props }: Props) => {
  const [relative, setRelative] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setRelative(
        DateTime.fromJSDate(date)
          .setLocale("pt-br")
          .toRelative({ style: "short" }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [date])

  return (
    <p {...props}>{relative ?? DateTime.fromJSDate(date).toLocaleString()}</p>
  )
}
