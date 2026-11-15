import * as stylex from "@stylexjs/stylex"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ChangelogEntry as Entry } from "@/features/changelog/lib/changelog"
import { ChangelogBody } from "@/features/changelog/components/changelog-body"
import { ChangelogDate } from "@/features/changelog/components/changelog-date"
import { ChangelogImage } from "@/features/changelog/components/changelog-image"
import { changelogProse } from "@/features/changelog/components/changelog-prose"
import { ChangelogSection } from "@/features/changelog/components/changelog-section"
import { changelogContainers } from "@/features/changelog/components/changelog.stylex"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  entry: {
    columnGap: "2rem",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(12, minmax(0, 1fr))",
      [changelogContainers.stacked]: "minmax(0, 1fr)",
    },
    position: "relative",
    rowGap: { default: 0, [changelogContainers.stacked]: "0.5rem" },
    scrollMarginTop: "calc(var(--navbar-height) + 1.5rem)",
  },
  bar: {
    backgroundColor: colors.border,
    display: { default: "block", [changelogContainers.stacked]: "none" },
    position: "absolute",
    height: "100%",
    left: "0.5625rem",
    top: "0.5625rem",
    width: "1px",
  },
  barLast: {
    backgroundColor: "transparent",
    backgroundImage: `linear-gradient(${colors.border} 70%, transparent)`,
    height: "calc(100% - 0.5625rem)",
  },
  content: {
    gridColumn: {
      default: "4 / -1",
      [changelogContainers.wide]: "4 / span 6",
      [changelogContainers.stacked]: "1 / -1",
    },
    minWidth: 0,
    paddingBottom: "4.5rem",
  },
  title: {
    margin: 0,
    color: colors.foreground,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", [changelogContainers.wide]: "2rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    lineHeight: 1.125,
    textWrap: "balance",
  },
  titleLink: {
    color: {
      default: "inherit",
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "color",
  },
  body: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    marginTop: "1.5rem",
  },
  bodyAfterImage: {
    marginTop: "3rem",
  },
})

export const ChangelogEntry = ({
  entry,
  latest,
  last,
}: {
  entry: Entry
  latest: boolean
  last: boolean
}) => {
  const locale = getLocale()

  return (
    <article id={entry.id} sx={styles.entry}>
      <div aria-hidden sx={[styles.bar, last && styles.barLast]} />
      <ChangelogDate date={entry.date} latest={latest} />
      <div sx={styles.content}>
        <h2 sx={styles.title}>
          <a href={`#${entry.id}`} sx={styles.titleLink}>
            {entry.title[locale]}
          </a>
        </h2>
        {entry.image === undefined ? null : (
          <ChangelogImage
            alt={entry.image.alt[locale]}
            height={entry.image.height}
            src={entry.image.src[locale]}
            width={entry.image.width}
          />
        )}
        <div
          sx={[
            changelogProse.text,
            styles.body,
            entry.image !== undefined && styles.bodyAfterImage,
          ]}
        >
          <ChangelogBody blocks={entry.body[locale]} />
          {entry.sections === undefined ? null : (
            <div>
              {entry.sections.map((section) => (
                <ChangelogSection key={section.title.en} section={section} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
