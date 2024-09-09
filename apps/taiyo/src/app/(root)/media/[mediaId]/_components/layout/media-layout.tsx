import type { MediaLimited } from "@taiyomoe/types"
import { MediaLayoutBanner } from "./media-layout-banner"
import { MediaLayoutLeftPanel } from "./media-layout-left-panel"

type Props = {
  media: MediaLimited
  children: React.ReactNode
}

export const MediaLayout = ({ media, children }: Props) => {
  return (
    <main className="h-full">
      <MediaLayoutBanner media={media} />
      <div className="-mt-28 xl:-mt-36 flex flex-col gap-bodyPadding p-bodyPadding pt-0 md:flex-row">
        <MediaLayoutLeftPanel media={media} />
        <section className="z-10 flex flex-col md:w-[calc(100vw-(258px+calc(var(--body-padding)*3)))] lg:w-[calc(100vw-(308px+calc(var(--body-padding)*3)))]">
          {children}
        </section>
      </div>
    </main>
  )
}
