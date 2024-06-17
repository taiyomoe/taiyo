import { ScrollShadow } from "@nextui-org/scroll-shadow"
import { Spinner } from "@nextui-org/spinner"
import useEmblaCarousel from "embla-carousel-react"
import { api } from "~/trpc/react"
import { ReleaseCardColumn } from "./release-card-column"

export const LatestReleasesColumnLayout = () => {
  const [emblaRef] = useEmblaCarousel({ dragFree: true })
  const { data, isLoading } = api.mediaChapters.getLatestGrouped.useQuery({})

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
