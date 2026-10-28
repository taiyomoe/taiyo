import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Media } from "@/features/media/api/medias"
import { InfoSection } from "@/features/media/components/media-info/info-section"
import { MediaAltTitles } from "@/features/media/components/media-info/media-alt-titles"
import { MediaDetails } from "@/features/media/components/media-info/media-details"
import { MediaLinks } from "@/features/media/components/media-info/media-links"
import { MediaSynopsis } from "@/features/media/components/media-info/media-synopsis"
import { MediaTagList } from "@/features/media/components/media-info/media-tag-list"
import {
  getAltTitles,
  getMediaLinks,
  getMediaTags,
  getSynopsis,
} from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "2rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: { [breakpoints.xl]: "minmax(0, 1fr) 20rem", default: "minmax(0, 1fr)" },
  },
  main: {
    gap: "2rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  muted: {
    margin: 0,
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
})

type MediaInfoProps = {
  media: Media
}

export function MediaInfo({ media }: MediaInfoProps) {
  const synopsis = getSynopsis(media.synopsis)
  const tags = getMediaTags(media.tags)
  const altTitles = getAltTitles(media.titles)
  const links = getMediaLinks(media.links)

  return (
    <div sx={styles.root}>
      <div sx={styles.main}>
        <InfoSection title={m.media_info_synopsis()}>
          {synopsis.length === 0 ? (
            <p sx={styles.muted}>{m.media_info_no_synopsis()}</p>
          ) : (
            <MediaSynopsis paragraphs={synopsis} />
          )}
        </InfoSection>
        {tags.length === 0 ? null : (
          <InfoSection title={m.media_info_tags()}>
            <MediaTagList tags={tags} />
          </InfoSection>
        )}
        {altTitles.length === 0 ? null : (
          <InfoSection title={m.media_info_titles()}>
            <MediaAltTitles titles={altTitles} />
          </InfoSection>
        )}
        {links.length === 0 ? null : (
          <InfoSection title={m.media_info_links()}>
            <MediaLinks links={links} />
          </InfoSection>
        )}
      </div>
      <MediaDetails media={media} />
    </div>
  )
}
