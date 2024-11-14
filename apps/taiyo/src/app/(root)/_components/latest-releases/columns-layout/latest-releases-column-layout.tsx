"use client"

import { ScrollShadow } from "@nextui-org/scroll-shadow"
import { Spinner } from "@nextui-org/spinner"
import type { LatestReleaseGrouped } from "@taiyomoe/types"
import useEmblaCarousel from "embla-carousel-react"
import { api } from "~/trpc/react"
import { ReleaseCardColumn } from "./release-card-column"

type Props = {
  initialData: LatestReleaseGrouped[] | null
}

export const LatestReleasesColumnLayout = ({ initialData }: Props) => {
  const [emblaRef] = useEmblaCarousel({ dragFree: true })
  const { data, isLoading } = api.chapters.getLatestGrouped.useQuery(
    {},
    initialData
      ? { initialData: { totalPages: 1, medias: initialData } }
      : undefined,
  )

  if (!data || isLoading) {
    return <Spinner size="lg" />
  }

  return (
    <ScrollShadow
      className="scrollbar-none h-fit"
      orientation="horizontal"
      ref={emblaRef}
    >
      <div className="flex gap-6">
        {data.medias.map((r) => (
          <ReleaseCardColumn key={r.id} release={r} />
        ))}
      </div>
    </ScrollShadow>
  )
}
