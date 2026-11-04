import * as stylex from "@stylexjs/stylex"
import type { ReaderSettings } from "@/features/reader/lib/reader-settings"
import { PageImage } from "@/features/reader/components/stage/page-image"

const styles = stylex.create({
  spread: {
    margin: "auto",
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    position: "relative",
  },
  rtl: {
    flexDirection: "row-reverse",
  },
  spreadFull: {
    height: "100%",
    width: "100%",
  },
  spreadWidth: (width: number) => ({
    width: `min(100%, ${width}px)`,
  }),
  slot: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    position: "relative",
    minWidth: 0,
  },
  slotFull: {
    flexBasis: 0,
    flexGrow: 1,
    height: "100%",
  },
  slotWidth: {
    flexBasis: 0,
    flexGrow: 1,
  },
  screen: {
    objectFit: "contain",
    height: "100%",
    width: "100%",
  },
  screenNatural: {
    maxHeight: "100%",
    maxWidth: "100%",
  },
  towardStart: {
    objectPosition: "right center",
  },
  towardEnd: {
    objectPosition: "left center",
  },
  height: {
    height: "100dvh",
    maxWidth: "none",
  },
  heightNatural: {
    maxHeight: "100dvh",
  },
  width: {
    height: "auto",
    width: "100%",
  },
  widthNatural: {
    maxWidth: "100%",
  },
})

export function PagedView({
  urls,
  visible,
  settings,
  onLoad,
}: {
  urls: readonly string[]
  visible: readonly number[]
  settings: Pick<ReaderSettings, "fit" | "stretchSmall" | "direction" | "pageWidth">
  onLoad: (index: number, aspect: number) => void
}) {
  const { fit, stretchSmall, direction } = settings
  const paired = visible.length > 1

  return (
    <div
      sx={[
        styles.spread,
        direction === "rtl" && styles.rtl,
        fit === "screen" && styles.spreadFull,
        fit === "width" && styles.spreadWidth(settings.pageWidth * visible.length),
      ]}
    >
      {visible.map((index, position) => {
        const towardStart = paired && position === 0

        return (
          <div
            key={index}
            sx={[
              styles.slot,
              fit === "screen" && styles.slotFull,
              fit === "width" && styles.slotWidth,
            ]}
          >
            <PageImage
              index={index}
              onLoad={onLoad}
              sx={[
                fit === "screen" && (stretchSmall ? styles.screen : styles.screenNatural),
                fit === "screen" && paired && (towardStart ? styles.towardStart : styles.towardEnd),
                fit === "height" && (stretchSmall ? styles.height : styles.heightNatural),
                fit === "width" && (stretchSmall ? styles.width : styles.widthNatural),
              ]}
              url={urls[index] ?? ""}
            />
          </div>
        )
      })}
    </div>
  )
}
