import { auth } from "@taiyomoe/auth"
import { ChaptersService } from "~/services/chapters.web-service"
// import { UnderlineButton } from "~/components/generics/buttons/underline-button"
import { LatestReleasesLayout } from "./latest-releases-layout"
import { LatestReleasesLayoutButton } from "./latest-releases-layout-button"

export const LatestReleasesCategory = async () => {
  const session = await auth()
  const releases = await ChaptersService.getLatest(
    session?.user.preferredTitles,
  )

  return (
    <div className="flex grow flex-col gap-4">
      <div className="flex justify-between">
        <p className="font-semibold text-2xl">Lançamentos</p>
        <div className="flex h-8 items-center gap-4">
          {/* <UnderlineButton className="hidden md:block">
            Acompanhando
          </UnderlineButton> */}
          {/* <UnderlineButton className="block md:hidden">A</UnderlineButton> */}
          <LatestReleasesLayoutButton />
          {/* <Button isIconOnly variant="light">
            <ArrowRightIcon />
          </Button> */}
        </div>
      </div>
      <LatestReleasesLayout releases={releases} />
    </div>
  )
}
