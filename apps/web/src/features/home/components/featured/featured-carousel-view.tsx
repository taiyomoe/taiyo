import * as stylex from "@stylexjs/stylex"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { type FocusEvent, type PointerEvent, useEffect, useState } from "react"
import type { FeaturedMedia } from "@/features/media/api/medias"
import { FeaturedDots } from "@/features/home/components/featured/featured-dots"
import { FeaturedSlide } from "@/features/home/components/featured/featured-slide"
import { featuredStyles } from "@/features/home/components/featured/featured-styles"
import { useDocumentHidden } from "@/features/home/hooks/use-document-hidden"
import { usePrefersReducedMotion } from "@/features/home/hooks/use-prefers-reduced-motion"
import { m } from "@/paraglide/messages"

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>

const styles = stylex.create({
  viewport: {
    overflow: "hidden",
  },
  container: {
    display: "flex",
    touchAction: "pan-y pinch-zoom",
  },
})

export function FeaturedCarouselView({ medias }: { medias: FeaturedMedia[] }) {
  const [viewportRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 32 })
  const [selected, setSelected] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const hidden = useDocumentHidden()
  const autoplay = emblaApi !== undefined && medias.length > 1 && !reducedMotion
  const paused = hovered || focused || dragging || hidden

  useEffect(() => {
    const onSelect = (api: EmblaApi) => {
      setSelected(api.selectedSnap())
    }
    const onPointerDown = () => {
      setDragging(true)
    }
    const onPointerUp = () => {
      setDragging(false)
    }

    emblaApi?.on("select", onSelect)
    emblaApi?.on("pointerdown", onPointerDown)
    emblaApi?.on("pointerup", onPointerUp)

    return () => {
      emblaApi?.off("select", onSelect)
      emblaApi?.off("pointerdown", onPointerDown)
      emblaApi?.off("pointerup", onPointerUp)
    }
  }, [emblaApi])

  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType === "mouse") {
      setHovered(true)
    }
  }
  const onFocus = (event: FocusEvent) => {
    if (event.target.matches(":focus-visible")) {
      setFocused(true)
    }
  }
  const onBlur = (event: FocusEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocused(false)
    }
  }

  return (
    <section
      aria-label={m.home_featured_label()}
      aria-roledescription="carousel"
      onBlur={onBlur}
      onFocus={onFocus}
      onPointerEnter={onPointerEnter}
      onPointerLeave={() => {
        setHovered(false)
      }}
      sx={featuredStyles.root}
    >
      <div ref={viewportRef} sx={styles.viewport}>
        <div sx={styles.container}>
          {medias.map((media, index) => (
            <FeaturedSlide key={media.id} index={index} media={media} total={medias.length} />
          ))}
        </div>
      </div>
      {medias.length > 1 ? (
        <FeaturedDots
          autoplay={autoplay}
          emblaApi={emblaApi}
          medias={medias}
          paused={paused}
          reducedMotion={reducedMotion}
          selected={selected}
        />
      ) : null}
    </section>
  )
}
