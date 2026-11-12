import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { type ShowcaseMedia, showcaseMediasQueryOptions } from "@/features/media/api/medias"
import { Cover } from "@/features/media/components/cover"
import { localizeTagName } from "@/lib/locale"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  band: {
    overflow: "hidden",
    backgroundColor: scene.night,
    position: "relative",
    paddingBottom: "0.625rem",
    paddingTop: "2.5rem",
  },
  fade: {
    inset: 0,
    backgroundImage: `linear-gradient(90deg, ${scene.night} 0%, transparent 12%, transparent 88%, ${scene.night} 100%)`,
    pointerEvents: "none",
    position: "absolute",
    zIndex: 2,
  },
  track: {
    gap: "1.125rem",
    display: "flex",
    width: "max-content",
  },
  slot: {
    borderRadius: radius.md,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    flexShrink: 0,
    position: "relative",
    width: "9.375rem",
  },
  cover: {
    borderRadius: 0,
    width: "100%",
  },
  caption: {
    inset: 0,
    padding: "0.875rem",
    gap: "0.25rem",
    backgroundImage: "linear-gradient(180deg, transparent 45%, rgba(8,4,2,0.9))",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    position: "absolute",
  },
  title: {
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: text.base,
    fontWeight: 700,
    lineHeight: 1.15,
    textShadow: "0 2px 8px rgba(0,0,0,0.5)",
    textWrap: "balance",
  },
  meta: {
    color: `color-mix(in srgb, ${scene.paper} 70%, transparent)`,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
  },
})
const isTagKey = (key: string): key is keyof typeof config.tags => key in config.tags
const getGenre = (tags: string[]) => {
  const known = tags.filter(isTagKey).map((key) => config.tags[key])
  const tag = known.find(({ category }) => category === "Genre") ?? known[0]

  return tag === undefined ? undefined : localizeTagName(tag.name)
}
const getMeta = (media: ShowcaseMedia) =>
  [m.landing_marquee_chapters({ count: media.chapterCount }), getGenre(media.tags)]
    .filter(Boolean)
    .join(" · ")

export const LandingMarquee = () => {
  const { data: medias = [] } = useQuery(showcaseMediasQueryOptions())
  const trackProps = stylex.props(styles.track)
  // Two copies side by side: the track slides by half its width and loops.
  const strip = ["a", "b"].flatMap((copy) =>
    medias.map((media) => ({ media, key: `${media.id}-${copy}`, copy })),
  )

  return (
    <section id="titles" sx={styles.band}>
      <div sx={styles.fade} />
      {medias.length > 0 ? (
        <div
          className={trackProps.className}
          style={{ ...trackProps.style, animation: "scene-marquee 64s linear infinite" }}
        >
          {strip.map(({ media, key, copy }) => (
            <div key={key} aria-hidden={copy === "b"} sx={styles.slot}>
              <Cover src={media.coverUrl} priority="low" sx={styles.cover} />
              <div sx={styles.caption}>
                <span sx={styles.title}>{media.title}</span>
                <span sx={styles.meta}>{getMeta(media)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
