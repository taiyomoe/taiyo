import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaCover, VolumeGroup } from "@/features/media/lib/media-images"
import { getLanguageCode, getLanguageName } from "@/components/flags/flags"
import { CoverGrid, CoverGridItem } from "@/features/media/components/media-covers/cover-grid"
import { CoverTile } from "@/features/media/components/media-covers/cover-tile"
import { getVolumeName } from "@/features/media/lib/chapter-volumes"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "2.25rem",
    display: "flex",
    flexDirection: "column",
  },
  section: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    gap: "0.75rem",
    alignItems: "baseline",
    display: "flex",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    paddingBottom: "0.625rem",
  },
  title: {
    margin: 0,
    fontSize: "1.0625rem",
    fontWeight: 600,
  },
  count: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
})

export function CoverSections({
  groups,
  alt,
  onOpen,
}: {
  groups: readonly VolumeGroup[]
  alt: string
  onOpen: (cover: MediaCover) => void
}) {
  return (
    <div sx={styles.root}>
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`covers-volume-${group.key}`} sx={styles.section}>
          <header sx={styles.header}>
            <h3 id={`covers-volume-${group.key}`} sx={styles.title}>
              {getVolumeName(group.volume)}
            </h3>
            <span sx={styles.count}>
              {[...new Set(group.covers.map((cover) => getLanguageCode(cover.language)))].join(
                " · ",
              )}
            </span>
          </header>
          <CoverGrid>
            {group.covers.map((cover) => (
              <CoverGridItem key={cover.id}>
                <CoverTile
                  alt={alt}
                  cover={cover}
                  label={getLanguageName(cover.language)}
                  onOpen={() => {
                    onOpen(cover)
                  }}
                  sublabel={cover.isMainCover ? m.media_covers_main() : undefined}
                />
              </CoverGridItem>
            ))}
          </CoverGrid>
        </section>
      ))}
    </div>
  )
}
