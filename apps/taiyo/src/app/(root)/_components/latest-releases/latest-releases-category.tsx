import type { HomeLayout } from "@taiyomoe/db"
import { api } from "~/trpc/server"
// import { UnderlineButton } from "~/components/generics/buttons/underline-button"
import { LatestReleasesLayout } from "./latest-releases-layout"
import { LatestReleasesLayoutButton } from "./latest-releases-layout-button"

type Props = {
  initialLayout: HomeLayout
}

export const LatestReleasesCategory = async ({ initialLayout }: Props) => {
  const releases =
    initialLayout === "ROWS"
      ? await api.chapters.getLatest()
      : await api.chapters.getLatestGrouped({})

  return (
    <div className="flex grow flex-col gap-4">
      <div className="flex justify-between">
        <p className="font-semibold text-2xl">Lançamentos</p>
        <div className="flex h-8 items-center gap-4">
          {/* <UnderlineButton className="hidden md:block">
              Acompanhando
            </UnderlineButton> */}
          {/* <UnderlineButton className="block md:hidden">A</UnderlineButton> */}
          <LatestReleasesLayoutButton initialLayout={initialLayout} />
          {/* <Button isIconOnly variant="light">
              <ArrowRightIcon />
            </Button> */}
        </div>
      </div>
      <LatestReleasesLayout
        initialLayout={initialLayout}
        initialData={"totalPages" in releases ? releases.medias : releases}
      />
    </div>
  )
}
