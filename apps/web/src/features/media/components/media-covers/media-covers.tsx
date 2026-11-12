import * as stylex from "@stylexjs/stylex"
import { Image } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { getRouteApi } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { Media } from "@/features/media/api/medias"
import { LanguageFlag, getLanguageName } from "@/components/flags/flags"
import { ImageLightbox } from "@/features/media/components/image-lightbox/image-lightbox"
import { ManageImagesLink } from "@/features/media/components/manage-images-link"
import { CoverSections } from "@/features/media/components/media-covers/cover-sections"
import { CoverVolumeSelect } from "@/features/media/components/media-covers/cover-volume-select"
import { CoversToolbar } from "@/features/media/components/media-covers/covers-toolbar"
import { MediaImagesEmpty } from "@/features/media/components/media-images-empty"
import {
  type MediaCover,
  getCoverFileName,
  getCoverLabel,
  getCoverLanguages,
  groupByVolume,
  sortCovers,
} from "@/features/media/lib/media-images"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { ContentFilterEmpty } from "@/features/settings/components/content-filter"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/media/$mediaId")
const styles = stylex.create({
  root: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
})

type CoverSearch = ReturnType<typeof routeApi.useSearch>

export function MediaCovers({ media, canManage }: { media: Media; canManage: boolean }) {
  const search = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const [openId, setOpenId] = useState<string | null>(null)
  const title = getMainTitle(media.titles) ?? ""
  const visible = sortCovers(
    media.covers.filter((cover) => contentRatings.includes(cover.contentRating)),
  )
  const languages = getCoverLanguages(visible)
  const language = languages.find((entry) => entry.language === search.coverLang)?.language
  const inLanguage =
    language === undefined ? visible : visible.filter((cover) => cover.language === language)
  const groups = groupByVolume(inLanguage)
  const volume = groups.some((group) => group.key === search.coverVolume)
    ? search.coverVolume
    : undefined
  const shownGroups = volume === undefined ? groups : groups.filter((group) => group.key === volume)
  const shown = shownGroups.flatMap((group) => group.covers)
  const openIndex = shown.findIndex((cover) => cover.id === openId)
  const update = (patch: Partial<CoverSearch>) => {
    void navigate({
      replace: true,
      resetScroll: false,
      search: (previous) => ({ ...previous, ...patch }),
    })
  }
  const onOpen = (cover: MediaCover) => {
    setOpenId(cover.id)
  }
  const manage = canManage ? (
    <ManageImagesLink kind="covers" label={m.media_covers_manage()} mediaId={media.id} />
  ) : null

  if (media.covers.length === 0) {
    return (
      <MediaImagesEmpty
        action={manage ?? undefined}
        description={m.media_covers_none_description()}
        icon={<Image />}
        title={m.media_covers_none_title()}
      />
    )
  }

  if (visible.length === 0) {
    return (
      <ContentFilterEmpty
        description={m.media_covers_filtered_description()}
        title={m.media_covers_none_title()}
      />
    )
  }

  return (
    <div sx={styles.root}>
      <CoversToolbar
        end={manage ?? undefined}
        language={language}
        languages={languages}
        onLanguageChange={(coverLang) => {
          update({ coverLang, coverVolume: undefined })
        }}
        start={
          <CoverVolumeSelect
            groups={groups}
            onSelect={(coverVolume) => {
              update({ coverVolume })
            }}
            selected={volume}
            total={inLanguage.length}
          />
        }
      />
      {shown.length === 0 ? (
        <MediaImagesEmpty
          action={
            <Button
              onClick={() => {
                update({ coverLang: undefined, coverVolume: undefined })
              }}
              size="sm"
              variant="outline"
            >
              {m.media_chapters_clear()}
            </Button>
          }
          description={m.media_chapters_empty_description()}
          icon={<Image />}
          title={m.media_covers_empty_title()}
        />
      ) : null}
      {shown.length > 0 ? <CoverSections alt={title} groups={shownGroups} onOpen={onOpen} /> : null}
      <ImageLightbox
        index={openIndex === -1 ? null : openIndex}
        items={shown.map((cover) => ({
          id: cover.id,
          url: cover.url,
          title: `${title} — ${getCoverLabel(cover)}`,
          detail: (
            <>
              <LanguageFlag language={cover.language} />
              {cover.isMainCover
                ? m.media_lightbox_detail_main({ language: getLanguageName(cover.language) })
                : getLanguageName(cover.language)}
            </>
          ),
          fileName: getCoverFileName(title, cover),
        }))}
        onClose={() => {
          setOpenId(null)
        }}
        onIndexChange={(index) => {
          setOpenId(shown[index]?.id ?? null)
        }}
      />
    </div>
  )
}
