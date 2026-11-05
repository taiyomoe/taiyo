import * as stylex from "@stylexjs/stylex"
import {
  Fragment,
  type RefObject,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useState,
} from "react"
import { StripDivider } from "@/features/reader/components/stage/strip-divider"
import { StripEnd } from "@/features/reader/components/stage/strip-end"
import { StripPage } from "@/features/reader/components/stage/strip-page"

const DEFAULT_ASPECT = 2 / 3
const styles = stylex.create({
  column: (width: number, gap: number) => ({
    marginInline: "auto",
    display: "flex",
    flexDirection: "column",
    rowGap: `${gap}px`,
    width: `min(100%, ${width}px)`,
  }),
})

export type StripSegment = {
  id: string
  label: string
  title: string | null
  urls: readonly string[]
}

export const getPageKey = (chapterId: string, index: number) => `${chapterId}:${index}`

export function StripView({
  segments,
  initial,
  pageWidth,
  pageGap,
  preload,
  stage,
  pageElements,
  nextLabel,
  onPageVisible,
  onLoad,
  onNext,
  onBack,
}: {
  segments: readonly StripSegment[]
  initial: { chapterId: string; page: number }
  pageWidth: number
  pageGap: number
  preload: number
  stage: RefObject<HTMLElement | null>
  pageElements: RefObject<Map<string, HTMLElement>>
  nextLabel: string | null
  onPageVisible: (chapterId: string, index: number) => void
  onLoad: (chapterId: string, index: number, aspect: number) => void
  onNext: () => void
  onBack: () => void
}) {
  const [aspect, setAspect] = useState(DEFAULT_ASPECT)
  const [start] = useState(initial)
  const visible = useEffectEvent(onPageVisible)
  const register = (key: string, element: HTMLElement | null) => {
    if (element === null) {
      pageElements.current.delete(key)
    } else {
      pageElements.current.set(key, element)
    }
  }
  const last = segments.at(-1)

  useLayoutEffect(() => {
    pageElements.current.get(getPageKey(start.chapterId, start.page))?.scrollIntoView({
      block: "start",
    })
  }, [pageElements, start])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            const { chapter, page } = entry.target.dataset

            if (chapter !== undefined) {
              visible(chapter, Number(page))
            }
          }
        }
      },
      { root: stage.current, rootMargin: "-50% 0px -50% 0px" },
    )

    for (const element of pageElements.current.values()) {
      observer.observe(element)
    }

    return () => {
      observer.disconnect()
    }
  }, [pageElements, stage, segments])

  return (
    <>
      {segments.map((segment, position) => {
        const previous = segments[position - 1]

        return (
          <Fragment key={segment.id}>
            {previous === undefined ? null : (
              <StripDivider
                chapterId={previous.id}
                label={segment.label}
                page={previous.urls.length - 1}
                previousLabel={previous.label}
                register={(element) => {
                  register(`${previous.id}:end`, element)
                }}
                title={segment.title}
              />
            )}
            <div sx={styles.column(pageWidth, pageGap)}>
              {segment.urls.map((url, index) => (
                <StripPage
                  chapterId={segment.id}
                  fallbackAspect={aspect}
                  index={index}
                  key={url}
                  margin={`100% 0px ${Math.max(preload, 1) * 100}% 0px`}
                  onLoad={(page, ratio) => {
                    if (aspect === DEFAULT_ASPECT) {
                      setAspect(ratio)
                    }

                    onLoad(segment.id, page, ratio)
                  }}
                  register={(page, element) => {
                    register(getPageKey(segment.id, page), element)
                  }}
                  root={stage}
                  url={url}
                />
              ))}
            </div>
          </Fragment>
        )
      })}
      {last === undefined ? null : (
        <StripEnd
          chapterLabel={last.label}
          nextLabel={nextLabel}
          onBack={onBack}
          onNext={onNext}
          onVisible={() => {
            onPageVisible(last.id, last.urls.length - 1)
          }}
          root={stage}
        />
      )}
    </>
  )
}
