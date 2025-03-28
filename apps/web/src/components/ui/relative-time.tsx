import { DateTime } from "luxon"
import { useLocale } from "next-intl"
import type { HTMLAttributes } from "react"

type Props = HTMLAttributes<HTMLSpanElement> & { date: Date }

export const RelativeTime = ({ date, ...props }: Props) => {
  const locale = useLocale()

  return (
    <span {...props}>{DateTime.fromJSDate(date).toRelative({ locale })}</span>
  )
}
