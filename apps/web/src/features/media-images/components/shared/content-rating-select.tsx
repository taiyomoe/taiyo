import type { ContentRating } from "@taiyomoe/db/constants"
import { OptionSelect } from "@/components/fields/option-select"
import { CONTENT_RATING_OPTIONS } from "@/features/media/lib/media-options"
import { m } from "@/paraglide/messages"

export function ContentRatingSelect({
  value,
  onChange,
}: {
  value: ContentRating
  onChange: (value: ContentRating) => void
}) {
  return (
    <OptionSelect
      label={m.media_images_content_rating()}
      onChange={onChange}
      options={CONTENT_RATING_OPTIONS}
      value={value}
    />
  )
}
