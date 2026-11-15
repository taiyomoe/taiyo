import { CONTENT_RATINGS, type ContentRating } from "@taiyomoe/db/constants"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

export function ContentRatingSelect({
  value,
  onChange,
}: {
  value: ContentRating
  onChange: (value: ContentRating) => void
}) {
  return (
    <Select
      onValueChange={(next: ContentRating | null) => {
        if (next !== null) {
          onChange(next)
        }
      }}
      value={value}
    >
      <SelectTrigger aria-label={m.media_images_content_rating()}>
        <SelectValue>{(current: ContentRating) => CONTENT_RATING_LABELS[current]()}</SelectValue>
      </SelectTrigger>
      <SelectPopup>
        {CONTENT_RATINGS.map((rating) => (
          <SelectItem key={rating} value={rating}>
            {CONTENT_RATING_LABELS[rating]()}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}
