import * as stylex from "@stylexjs/stylex"
import { ImageMissing } from "@taiyomoe/ui/components/icons"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { consts, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useImageLoaded } from "@/hooks/use-image-loaded"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  frame: {
    position: "relative",
    height: "100%",
    width: "100%",
  },
  image: {
    inset: 0,
    margin: "auto",
    borderRadius: radius.lg,
    boxShadow: "0 24px 80px -16px rgb(0 0 0 / 80%), 0 0 0 1px rgb(255 255 255 / 6%)",
    display: "block",
    objectFit: "contain",
    opacity: { "[data-loaded]": 1, default: 0 },
    position: "absolute",
    transform: { "[data-loaded]": "scale(1)", default: "scale(0.985)" },
    transitionDuration: { default: motion.enterLarge, [consts.reducedMotion]: "0s" },
    transitionProperty: "opacity, transform",
    transitionTimingFunction: motion.easeOut,
    userSelect: "none",
    maxHeight: "100%",
    maxWidth: "100%",
  },
  status: {
    inset: 0,
    gap: "0.5rem",
    alignItems: "center",
    color: "rgb(255 255 255 / 60%)",
    display: "flex",
    flexDirection: "column",
    fontSize: "0.875rem",
    justifyContent: "center",
    position: "absolute",
  },
})

export function LightboxImage({ src, alt }: { src: string; alt: string }) {
  const { loaded, failed, ref, onLoad, onError } = useImageLoaded()

  return (
    <div sx={styles.frame}>
      {loaded ? null : (
        <div sx={styles.status}>
          {failed ? (
            <>
              <ImageMissing size={28} />
              {m.media_lightbox_failed()}
            </>
          ) : (
            <Spinner />
          )}
        </div>
      )}
      {failed ? null : (
        <img
          ref={ref}
          alt={alt}
          data-loaded={loaded ? "" : undefined}
          draggable={false}
          onError={onError}
          onLoad={onLoad}
          src={src}
          sx={styles.image}
        />
      )}
    </div>
  )
}
