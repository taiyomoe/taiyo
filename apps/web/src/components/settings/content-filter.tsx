import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Eye } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Menu, MenuCheckboxItem, MenuPopup, MenuTrigger } from "@taiyomoe/ui/components/ui/menu"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { ContentRatingLabel } from "@/components/settings/content-rating-label"
import { type ContentRating, useSettings, useUpdateSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const CONTENT_RATINGS = ["NORMAL", "SUGGESTIVE", "NSFW", "NSFL"] as const satisfies ContentRating[]
const CONTENT_RATING_LABELS: Record<ContentRating, () => string> = {
  NORMAL: m.content_rating_normal,
  SUGGESTIVE: m.content_rating_suggestive,
  NSFW: m.content_rating_nsfw,
  NSFL: m.content_rating_nsfl,
}
const styles = stylex.create({
  popup: {
    minWidth: "12.5rem",
  },
})
const itemStyles = stylex.create({
  SUGGESTIVE: {
    backgroundColor: {
      "[data-highlighted]": `color-mix(in srgb, ${colors.contentSuggestive} 14%, transparent)`,
      default: null,
    },
    color: {
      "[data-highlighted]": `color-mix(in srgb, ${colors.contentSuggestive} 70%, ${colors.foreground})`,
      default: colors.contentSuggestive,
    },
  },
  NSFW: {
    backgroundColor: {
      "[data-highlighted]": `color-mix(in srgb, ${colors.contentNsfw} 15%, transparent)`,
      default: null,
    },
    color: {
      "[data-highlighted]": `color-mix(in srgb, ${colors.contentNsfw} 70%, ${colors.foreground})`,
      default: colors.contentNsfw,
    },
  },
  NSFL: {
    backgroundColor: {
      "[data-highlighted]": `color-mix(in srgb, ${colors.contentNsfl} 16%, transparent)`,
      default: null,
    },
    color: {
      "[data-highlighted]": `color-mix(in srgb, ${colors.contentNsfl} 70%, ${colors.foreground})`,
      default: colors.contentNsfl,
    },
  },
})

export function ContentFilterItems() {
  const { contentRatings } = useSettings()
  const updateSettings = useUpdateSettings()

  return CONTENT_RATINGS.map((rating) => {
    const checked = contentRatings.includes(rating)
    const last = checked && contentRatings.length === 1

    return (
      <MenuCheckboxItem
        key={rating}
        checked={checked}
        closeOnClick={false}
        disabled={last}
        sx={rating === "NORMAL" ? undefined : itemStyles[rating]}
        onCheckedChange={(next) => {
          updateSettings.mutate({
            contentRating: CONTENT_RATINGS.filter((candidate) =>
              candidate === rating ? next : contentRatings.includes(candidate),
            ),
          })
        }}
        title={last ? m.content_filter_last() : undefined}
      >
        <ContentRatingLabel label={CONTENT_RATING_LABELS[rating]()} rating={rating} />
      </MenuCheckboxItem>
    )
  })
}

export function ContentFilterEmpty({
  title,
  description,
  sx,
}: {
  title: string
  description: string
  sx?: Sx
}) {
  return (
    <Empty sx={sx}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Eye size={18} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Menu>
          <MenuTrigger render={<Button size="sm" variant="outline" />}>
            <Eye />
            {m.content_filter_edit()}
          </MenuTrigger>
          <MenuPopup sx={styles.popup}>
            <ContentFilterItems />
          </MenuPopup>
        </Menu>
      </EmptyContent>
    </Empty>
  )
}
