import { MediaSearchAutocomplete } from "~/components/navbar/search/MediaSearchAutocomplete"
import { MediaSearchModal } from "~/components/navbar/search/MediaSearchModal"
import { useDevice } from "~/hooks/useDevice"

export const MediaSearch = () => {
  const device = useDevice()

  if (device?.isAboveTablet) {
    return <MediaSearchAutocomplete href={(mediaId) => `/media/${mediaId}`} />
  }

  return <MediaSearchModal />
}
