import type { ImageSource } from "@takumi-rs/core"
import type { InferResponseType } from "hono/client"
import type { ReactNode } from "react"
import { config } from "@taiyomoe/config"
import type { Group } from "@/features/groups/api/groups"
import type { ListDetail } from "@/features/lists/api/lists"
import type { Media } from "@/features/media/api/medias"
import type { ReaderChapter } from "@/features/reader/api/reader"
import type { UserProfile } from "@/features/users/api/profile"
import type { api } from "@/lib/api"
import { getLanguageName, LANGUAGE_FLAGS } from "@/components/flags/language-flags"
import { getRichTextSummary } from "@/components/rich-text/rich-text-document"
import {
  CONTENT_RATING_LABELS,
  getAltTitles,
  getMainTitle,
  getMediaTags,
  getMediaYears,
  getSynopsis,
  MEDIA_DEMOGRAPHY_LABELS,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
} from "@/features/media/lib/media-labels"
import { ChapterOgCard } from "@/features/og/components/chapter-og-card"
import { COVER_TEXT_WIDTH } from "@/features/og/components/cover-og-card"
import { IDENTITY_TEXT_WIDTH, IdentityOgCard } from "@/features/og/components/identity-og-card"
import { LIST_TEXT_WIDTH, ListOgCard } from "@/features/og/components/list-og-card"
import { getSynopsisLines, MediaOgCard } from "@/features/og/components/media-og-card"
import { OgChip, OgChips } from "@/features/og/components/og-parts"
import { fetchOgImage } from "@/features/og/lib/og-images"
import { countFirstRow, fitText } from "@/features/og/lib/og-renderer"
import { ogFonts } from "@/features/og/lib/og-theme"
import { ROLE_LABELS } from "@/features/users/lib/role-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

export type OgCard = { element: ReactNode; images: ImageSource[] }

type Chapter = InferResponseType<(typeof api.chapters)[":id"]["$get"], 200>["data"]

const SAFE_RATINGS: readonly string[] = config.settings.contentRating
const fetchImages = async (...sources: Array<string | null | undefined>) => {
  const images = await Promise.all(sources.map(fetchOgImage))

  return {
    images: images.filter((image) => image !== null),
    // A picture that did not load falls back to its placeholder.
    src: (index: number) => images[index]?.src ?? null,
  }
}
const count = (value: number) =>
  new Intl.NumberFormat(getLocale(), { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  )
const plural = (value: number, one: () => string, other: () => string) =>
  value === 1 ? one() : other()
/**
 * The numbers under a name. The first ones always show; the others only once
 * they are above zero, so a new account is not a row of zeros.
 */
const stats = (always: number, entries: Array<[number, () => string, () => string]>) =>
  entries
    .filter(([value], index) => index < always || value > 0)
    .map(([value, one, other]) => ({ value: count(value), label: plural(value, one, other) }))
const fitTitle = async (text: string, width: number, lines: number, max: number, min: number) =>
  fitText(text, { width, lines, max, min, lineHeight: 1.06, fontFamily: ogFonts.display })
const ORIGINAL_LANGUAGES: Record<Media["countryOfOrigin"], string[]> = {
  JAPAN: ["ja"],
  KOREA: ["ko"],
  CHINA: ["zh", "zh_hk"],
  BRAZIL: ["pt_br"],
  FRANCE: ["fr"],
  USA: ["en"],
}
/** The title in the language the work was written in, else in English, else none. */
const getSubtitle = (media: Media, title: string) =>
  [...ORIGINAL_LANGUAGES[media.countryOfOrigin], "en"]
    .flatMap((language) =>
      getAltTitles(media.titles).filter(
        (alt) => alt.language === language && !alt.isAcronym && alt.title !== title,
      ),
    )
    .at(0)?.title ?? null

type Chip = { label: string; icon?: ReactNode }

/** The chips that fit on one line of the text column, in order. */
const fitChips = async (chips: Chip[]) =>
  chips.slice(
    0,
    await countFirstRow(
      <OgChips width={COVER_TEXT_WIDTH}>
        {chips.map((chip) => (
          <OgChip key={chip.label} icon={chip.icon}>
            {chip.label}
          </OgChip>
        ))}
      </OgChips>,
    ),
  )
const getCover = (media: Media) =>
  media.covers.find((cover) => cover.isMainCover) ?? media.covers.at(0) ?? null
/** The label to blur a picture under, or null when everyone sees it by default. */
const sensitivity = (...ratings: Array<Media["contentRating"]>) =>
  ratings
    .filter((rating) => !SAFE_RATINGS.includes(rating))
    .map((rating) => CONTENT_RATING_LABELS[rating]())
    .at(-1) ?? null

export const mediaOgCard = async (media: Media, host: string) => {
  const title = getMainTitle(media.titles) ?? m.media_untitled()
  const altTitle = getSubtitle(media, title)
  const tags = await fitChips(
    getMediaTags(media.tags)
      .filter((tag) => !tag.isSpoiler)
      .sort((a, b) => Number(b.isGenre) - Number(a.isGenre))
      .map((tag) => ({ label: tag.name })),
  )
  const cover = getCover(media)
  const { images, src } = await fetchImages(cover?.url)
  const fitted = await fitTitle(title, COVER_TEXT_WIDTH, 3, 80, 44)

  return {
    images,
    element: (
      <MediaOgCard
        host={host}
        title={title}
        titleSize={fitted.size}
        altTitle={altTitle}
        synopsis={getRichTextSummary(getSynopsis(media.synopsis))}
        synopsisLines={getSynopsisLines({
          titleHeight: fitted.size * 1.06 * fitted.lines,
          altTitle: altTitle !== null,
          chips: tags.length > 0,
        })}
        eyebrow={[MEDIA_TYPE_LABELS[media.type](), MEDIA_DEMOGRAPHY_LABELS[media.demography]()]}
        status={MEDIA_STATUS_LABELS[media.status]()}
        years={getMediaYears(media)}
        tags={tags}
        cover={src(0)}
        sensitive={sensitivity(media.contentRating, cover?.contentRating ?? "NORMAL")}
      />
    ),
  } satisfies OgCard
}

export const chapterOgCard = async (
  {
    chapter,
    media,
    entry,
  }: {
    chapter: Chapter
    media: Media
    entry: ReaderChapter | undefined
  },
  host: string,
) => {
  const cover = getCover(media)
  const { images, src } = await fetchImages(cover?.url)
  const Flag = LANGUAGE_FLAGS[chapter.language]
  const groups = entry?.groups.map((group) => group.name) ?? []
  const pages = entry?.pageCount ?? chapter.pages?.length ?? 0
  const title = chapter.title?.trim() === "" ? null : chapter.title

  return {
    images,
    element: (
      <ChapterOgCard
        host={host}
        mediaTitle={getMainTitle(media.titles) ?? m.media_untitled()}
        headline={m.og_chapter({ number: chapter.number })}
        chapterTitle={title}
        chapterTitleSize={
          title === null ? 0 : (await fitTitle(title, COVER_TEXT_WIDTH, 2, 46, 32)).size
        }
        chips={await fitChips([
          {
            label: getLanguageName(chapter.language),
            icon:
              Flag === null ? null : <Flag width={30} height={20} style={{ borderRadius: 3 }} />,
          },
          ...(chapter.volume === null ? [] : [{ label: m.og_volume({ volume: chapter.volume }) }]),
          ...(pages === 0
            ? []
            : [{ label: plural(pages, m.og_page, () => m.og_pages({ count: pages })) }]),
        ])}
        credits={
          groups.length === 0
            ? null
            : m.og_credits({
                groups: [
                  groups.slice(0, 2).join(", "),
                  ...(groups.length > 2 ? [m.og_more({ count: groups.length - 2 })] : []),
                ].join(" "),
              })
        }
        cover={src(0)}
        sensitive={sensitivity(
          media.contentRating,
          cover?.contentRating ?? "NORMAL",
          chapter.contentRating,
        )}
      />
    ),
  } satisfies OgCard
}

export const userOgCard = async (user: UserProfile, host: string) => {
  const { images, src } = await fetchImages(user.image, user.bannerUrl)
  const about = getRichTextSummary(Object.values(user.about).find(Boolean))

  return {
    images,
    element: (
      <IdentityOgCard
        host={host}
        name={user.displayUsername}
        nameSize={(await fitTitle(user.displayUsername, IDENTITY_TEXT_WIDTH, 2, 84, 44)).size}
        eyebrow={user.role === "USER" ? null : ROLE_LABELS[user.role]()}
        handle={`@${user.username}`}
        shape="circle"
        picture={src(0)}
        backdrop={src(1)}
        stats={stats(1, [
          [user.followerCount, m.og_stat_follower, m.og_stat_followers],
          [user.uploadCount, m.og_stat_upload, m.og_stat_uploads],
          [user.listCount, m.og_stat_list, m.og_stat_lists],
        ])}
        about={about}
      />
    ),
  } satisfies OgCard
}

export const groupOgCard = async (group: Group, host: string) => {
  // An empty logo key still comes back as the bucket's root URL.
  const { images, src } = await fetchImages(
    group.logo === null || group.logo === "" ? null : group.logoUrl,
  )

  return {
    images,
    element: (
      <IdentityOgCard
        host={host}
        name={group.name}
        nameSize={(await fitTitle(group.name, IDENTITY_TEXT_WIDTH, 2, 84, 44)).size}
        eyebrow={m.og_group()}
        handle={
          group.languages.length === 0 ? null : group.languages.map(getLanguageName).join(" · ")
        }
        shape="square"
        picture={src(0)}
        backdrop={null}
        stats={stats(2, [
          [group.mediaCount, m.og_stat_title, m.og_stat_titles],
          [group.chapterCount, m.og_stat_chapter, m.og_stat_chapters],
          [group.memberCount, m.og_stat_member, m.og_stat_members],
          [group.followerCount, m.og_stat_follower, m.og_stat_followers],
        ])}
        about={getRichTextSummary(group.description)}
      />
    ),
  } satisfies OgCard
}

export const listOgCard = async (list: ListDetail, host: string) => {
  const covers = list.items.slice(0, 5).map((item) => item.coverUrl)
  const { images, src } = await fetchImages(list.owner.image, ...covers)
  const titles = list.itemCount

  return {
    images,
    element: (
      <ListOgCard
        host={host}
        name={list.name}
        nameSize={(await fitTitle(list.name, LIST_TEXT_WIDTH, 3, 76, 40)).size}
        eyebrow={[
          m.og_list(),
          plural(titles, m.og_list_title, () => m.og_list_titles({ count: count(titles) })),
        ].join("  ·  ")}
        description={getRichTextSummary(list.description)}
        owner={{
          name: list.owner.displayUsername,
          label: m.og_list_owner({ name: list.owner.displayUsername }),
          picture: src(0),
        }}
        covers={covers.map((_, index) => src(index + 1))}
      />
    ),
  } satisfies OgCard
}
