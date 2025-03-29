"use client"

import { DateTime } from "luxon"
import { useLocale } from "next-intl"
import { capitalize } from "radash"
import { type HTMLAttributes, useEffect, useState } from "react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card"
import { cn } from "~/utils/cn"

type Props = HTMLAttributes<HTMLSpanElement> & { date: Date }

export const RelativeTime = ({ className, date, ...props }: Props) => {
  const locale = useLocale()
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const dateTime = DateTime.fromJSDate(date)
  const dateTimeZoned = DateTime.fromJSDate(date, { zone })
  const [relativeTime, setRelativeTime] = useState(
    DateTime.fromJSDate(date).toRelative({ locale }),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(DateTime.fromJSDate(date).toRelative({ locale }))
    }, 1000)

    return () => clearInterval(interval)
  }, [date, locale])

  const gmtOffset = dateTimeZoned.toFormat("ZZZZ")

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span
          className={cn(
            "hover:cursor-pointer hover:underline data-[state=open]:underline",
            className,
          )}
          {...props}
        >
          {capitalize(
            DateTime.fromJSDate(date).toRelative({ style: "long", locale })!,
          )}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-fit flex-col font-mono text-subtle text-xs">
        <span className="text-start">{capitalize(relativeTime!)}</span>
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-sm bg-subtle px-1 py-0.5">UTC</span>
          <div className="flex w-full justify-between gap-8">
            <p className="text-default">
              {dateTime.toLocaleString(DateTime.DATE_FULL, { locale })}
            </p>
            <p>
              {dateTime.toLocaleString(DateTime.TIME_24_WITH_SECONDS, {
                locale,
              })}
            </p>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-sm bg-subtle px-1 py-0.5">{gmtOffset}</span>
          <div className="flex w-full justify-between gap-8">
            <p className="text-default">
              {dateTimeZoned.toLocaleString(DateTime.DATE_FULL, { locale })}
            </p>
            <p>
              {dateTimeZoned.toLocaleString(DateTime.TIME_24_WITH_SECONDS, {
                locale,
              })}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
