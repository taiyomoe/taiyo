import { MediaSearchAutocomplete } from "~/components/navbar/search/MediaSearchAutocomplete"
import { MediaSearchModal } from "~/components/navbar/search/MediaSearchModal"

export const MediaSearch = () => (
  <>
    <MediaSearchAutocomplete
      className="hidden md:block"
      href={(mediaId) => `/media/${mediaId}`}
    />
    <MediaSearchModal className="block md:hidden" />
  </>
)
