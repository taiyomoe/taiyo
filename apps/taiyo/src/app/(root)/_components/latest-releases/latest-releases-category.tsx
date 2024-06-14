import { Button, ButtonGroup } from "@nextui-org/button"
import { MediaChapterService } from "@taiyomoe/services"
import { ArrowRightIcon, Columns2Icon, Rows2Icon } from "lucide-react"
import { UnderlineButton } from "~/components/generics/buttons/underline-button"
import { ReleaseCard } from "./release-card"

export const LatestReleasesCategory = async () => {
  const releases = await MediaChapterService.getLatest()

  return (
    <div className="flex grow flex-col gap-4">
      <div className="flex justify-between">
        <p className="font-semibold text-2xl">Lançamentos</p>
        <div className="flex h-8 items-center gap-4">
          <UnderlineButton className="hidden md:block">
            Acompanhando
          </UnderlineButton>
          <UnderlineButton className="block md:hidden">A</UnderlineButton>
          <ButtonGroup isIconOnly>
            <Button color="primary">
              <Rows2Icon />
            </Button>
            <Button>
              <Columns2Icon />
            </Button>
          </ButtonGroup>
          <Button isIconOnly variant="light">
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
      <div className="grid max-h-[944px] grid-cols-1 gap-4 overflow-hidden 2xl:grid-cols-3 lg:md:grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
        {releases.map((release, i) => (
          <ReleaseCard key={release.id} release={release} index={i} />
        ))}
      </div>
    </div>
  )
}
