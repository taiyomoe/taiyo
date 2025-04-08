"use client"

import { config } from "@taiyomoe/config"
import { parseAsInteger, useQueryState } from "nuqs"
import { Separator } from "~/components/ui/separator"
import { Skeleton } from "~/components/ui/skeleton"

export const LatestPaginatedReleasesSkeleton = () => {
  const [perPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(config.pagination.defaultPerPage),
  )

  return Array.from({ length: perPage }).map((_, i) => (
    <div key={i}>
      <Skeleton className="h-7 w-2/3" />
      <Separator className="mt-1 mb-2 w-full" />
      <div className="flex gap-2">
        <Skeleton className="sticky top-[calc(var(--navbar-height)+8px)] aspect-7/10 max-h-[80] min-h-[80] select-none md:max-h-[200] md:min-h-[200]" />
        <div className="flex w-full flex-col gap-1">
          {Array.from({
            length: Math.floor(Math.random() * (5 - 1 + 1) + 1),
          }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </div>
    </div>
  ))
}
