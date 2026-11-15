import * as stylex from "@stylexjs/stylex"
import { ArrowRight, ChevronLeft, ChevronRight } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { CatchBoundary, Link } from "@tanstack/react-router"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { Suspense, useEffect, useState } from "react"
import {
  RecentlyAddedTrack,
  RecentlyAddedTrackSkeleton,
} from "@/features/home/components/recently-added/recently-added-track"
import { m } from "@/paraglide/messages"

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>

const styles = stylex.create({
  section: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  heading: {
    margin: 0,
    gap: "0.75rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontFamily: sceneFont.display,
    fontSize: { default: "1.5rem", [breakpoints.md]: "1.875rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  accent: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexShrink: 0,
    height: "0.1875rem",
    width: "1.25rem",
  },
  actions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  arrows: {
    gap: "0.375rem",
    display: { default: "none", [breakpoints.md]: "flex" },
  },
  seeAll: {
    color: colors.mutedForeground,
    marginInlineEnd: "-0.75rem",
  },
})

export function RecentlyAdded() {
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: "auto",
  })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    const update = (api: EmblaApi) => {
      setCanPrev(api.canGoToPrev())
      setCanNext(api.canGoToNext())
    }

    if (emblaApi) {
      update(emblaApi)
    }

    emblaApi?.on("select", update)
    emblaApi?.on("reinit", update)
    emblaApi?.on("resize", update)

    return () => {
      emblaApi?.off("select", update)
      emblaApi?.off("reinit", update)
      emblaApi?.off("resize", update)
    }
  }, [emblaApi])

  return (
    <section aria-labelledby="recently-added" aria-roledescription="carousel" sx={styles.section}>
      <div sx={styles.header}>
        <h2 id="recently-added" sx={styles.heading}>
          <span aria-hidden sx={styles.accent} />
          {m.shell_nav_recently_added()}
        </h2>
        <div sx={styles.actions}>
          {canPrev || canNext ? (
            <div sx={styles.arrows}>
              <Button
                aria-label={m.home_recently_added_previous()}
                disabled={!canPrev}
                onClick={() => emblaApi?.goToPrev()}
                size="icon-sm"
                variant="outline"
              >
                <ChevronLeft />
              </Button>
              <Button
                aria-label={m.home_recently_added_next()}
                disabled={!canNext}
                onClick={() => emblaApi?.goToNext()}
                size="icon-sm"
                variant="outline"
              >
                <ChevronRight />
              </Button>
            </div>
          ) : null}
          <Button
            render={<Link to="/recently-added" />}
            size="sm"
            sx={styles.seeAll}
            variant="ghost"
          >
            {m.home_latest_see_all()}
            <ArrowRight />
          </Button>
        </div>
      </div>
      <CatchBoundary errorComponent={() => null} getResetKey={() => "recently-added"}>
        <Suspense fallback={<RecentlyAddedTrackSkeleton />}>
          <RecentlyAddedTrack viewportRef={viewportRef} />
        </Suspense>
      </CatchBoundary>
    </section>
  )
}
