"use client"

import { Skeleton } from "~/components/ui/skeleton"

export const TrendingMediasCarousel = () => {
  return (
    <div className="sticky top-[calc(var(--navbar-height)+32px)] flex h-fit flex-col gap-4 transition-[top] duration-300">
      <h1 className="font-bold text-2xl">Em alta 🔥</h1>
      <Skeleton className="aspect-7/10 h-[250] max-w-fit transition-[height,width] duration-300 md:h-[300] lg:h-[400] min-[768px]:max-[832px]:group-data-[state=expanded]/sidebar:h-[220]! min-[784px]:max-[832px]:group-data-[state=expanded]/sidebar:h-[240]! min-[800px]:max-[832px]:group-data-[state=expanded]/sidebar:h-[260]! min-[816px]:max-[832px]:group-data-[state=expanded]/sidebar:h-[280]!" />
    </div>
  )
}
