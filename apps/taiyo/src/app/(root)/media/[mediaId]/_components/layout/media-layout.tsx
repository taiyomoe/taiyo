import type { MediaLimited } from "@taiyomoe/types"
import { MediaLayoutBanner } from "./media-layout-banner"
import { MediaLayoutLeftPanel } from "./media-layout-left-panel"

type Props = {
  media: MediaLimited
  children: React.ReactNode
}

export const MediaLayout = ({ media, children }: Props) => (
  <main className="h-full">
    <MediaLayoutBanner media={media} />
    <div className="-mt-28 xl:-mt-36 p-bodyPadding pt-0">
      <div className="mx-auto flex w-full max-w-screen-3xl flex-col gap-bodyPadding md:flex-row">
        <MediaLayoutLeftPanel media={media} />
        <section className="z-10 flex flex-col md:w-[calc(100vw-(258px+calc(var(--body-padding)*3)))] lg:w-[calc(100vw-(308px+calc(var(--body-padding)*3)))]">
          {children}
        </section>
      </div>
    </div>
  </main>
)
