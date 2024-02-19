import type { MediaLimited } from "@taiyomoe/types"

import { MediaLayoutBanner } from "./MediaLayoutBanner"
import { MediaLayoutLeftPanel } from "./MediaLayoutLeftPanel"

type Props = {
  media: MediaLimited
  children: React.ReactNode
}

export const MediaLayout = ({ media, children }: Props) => {
  return (
    <main className="h-full">
      <MediaLayoutBanner media={media} />
      <div className="px-bodyPadding pb-bodyPadding gap-bodyPadding -mt-28 flex flex-col md:flex-row xl:-mt-36">
        <MediaLayoutLeftPanel media={media} />
        <section className="z-10 flex flex-col md:w-[calc(100vw-(258px+calc(var(--body-padding)*3)))] lg:w-[calc(100vw-(308px+calc(var(--body-padding)*3)))]">
          {children}
        </section>
      </div>
    </main>
  )
}
