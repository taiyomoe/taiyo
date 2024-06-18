import { Button } from "@nextui-org/button"
import { ChaptersService } from "@taiyomoe/services"
import { ArrowRightIcon } from "lucide-react"
import { LatestReleasesLayoutButton } from "~/app/(root)/_components/latest-releases/latest-releases-layout-button"
import { UnderlineButton } from "~/components/generics/buttons/underline-button"
import { LatestReleasesLayout } from "./latest-releases-layout"

export const LatestReleasesCategory = async () => {
  const releases = await ChaptersService.getLatest()

  return (
    <div className="flex grow flex-col gap-4">
      <div className="flex justify-between">
        <p className="font-semibold text-2xl">Lançamentos</p>
        <div className="flex h-8 items-center gap-4">
          <UnderlineButton className="hidden md:block">
            Acompanhando
          </UnderlineButton>
          <UnderlineButton className="block md:hidden">A</UnderlineButton>
          <LatestReleasesLayoutButton />
          <Button isIconOnly variant="light">
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
      <LatestReleasesLayout releases={releases} />
    </div>
  )
}
