import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { changelogContainers } from "@/features/changelog/components/changelog.stylex"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  date: {
    gridColumn: { default: "1 / span 3", [changelogContainers.stacked]: "1 / -1" },
    alignSelf: "start",
    opacity: { default: 1, [changelogContainers.stacked]: 0.75 },
    position: { default: "sticky", [changelogContainers.stacked]: "relative" },
    marginBottom: { default: "1rem", [changelogContainers.stacked]: 0 },
    paddingLeft: { default: "1.5rem", [changelogContainers.stacked]: 0 },
    top: { default: "calc(var(--navbar-height) + 1.5rem)", [changelogContainers.stacked]: 0 },
  },
  dot: {
    borderRadius: "9999px",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 24%, ${colors.background})`,
    display: { default: "block", [changelogContainers.stacked]: "none" },
    position: "absolute",
    transform: "translate(-50%, -50%)",
    height: "0.4375rem",
    left: "0.59375rem",
    top: "50%",
    width: "0.4375rem",
  },
  dotLatest: {
    backgroundColor: colors.primary,
  },
  text: {
    color: colors.foreground,
    display: "block",
    fontFamily: font.sans,
    fontSize: "0.875rem",
    letterSpacing: "-0.013em",
    lineHeight: "1.5rem",
  },
})

export const ChangelogDate = ({ date, latest }: { date: string; latest: boolean }) => (
  <div sx={styles.date}>
    <span aria-hidden sx={[styles.dot, latest && styles.dotLatest]} />
    <time dateTime={date} sx={styles.text}>
      {new Intl.DateTimeFormat(getLocale(), { dateStyle: "long", timeZone: "UTC" }).format(
        new Date(`${date}T00:00:00Z`),
      )}
    </time>
  </div>
)
