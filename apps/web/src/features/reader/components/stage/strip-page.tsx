import * as stylex from "@stylexjs/stylex"
import { type RefObject, useRef, useState } from "react"
import { PageImage } from "@/features/reader/components/stage/page-image"
import { useNearViewport } from "@/features/reader/hooks/use-near-viewport"

const styles = stylex.create({
  page: {
    position: "relative",
    width: "100%",
  },
  placeholder: (aspect: number) => ({
    aspectRatio: String(aspect),
  }),
  image: {
    height: "auto",
    width: "100%",
  },
})

export function StripPage({
  chapterId,
  url,
  index,
  root,
  margin,
  fallbackAspect,
  register,
  onLoad,
}: {
  chapterId: string
  url: string
  index: number
  root: RefObject<HTMLElement | null>
  margin: string
  fallbackAspect: number
  register: (index: number, element: HTMLElement | null) => void
  onLoad: (index: number, aspect: number) => void
}) {
  const element = useRef<HTMLDivElement | null>(null)
  const near = useNearViewport(element, root, margin)
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      data-chapter={chapterId}
      data-page={index}
      ref={(node) => {
        element.current = node
        register(index, node)
      }}
      sx={[styles.page, !loaded && styles.placeholder(fallbackAspect)]}
    >
      {near ? (
        <PageImage
          index={index}
          priority="auto"
          onLoad={(page, aspect) => {
            setLoaded(true)
            onLoad(page, aspect)
          }}
          sx={styles.image}
          url={url}
        />
      ) : null}
    </div>
  )
}
