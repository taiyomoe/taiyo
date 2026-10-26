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
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
import {
  ContentRatingLabel,
  contentRatingItemSx,
} from "@/features/settings/components/content-rating-label"
import { type ContentRating, useSettings, useUpdateSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const CONTENT_RATINGS = ["NORMAL", "SUGGESTIVE", "NSFW", "NSFL"] as const satisfies ContentRating[]
const styles = stylex.create({
  popup: {
    minWidth: "12.5rem",
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
        sx={contentRatingItemSx(rating)}
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
