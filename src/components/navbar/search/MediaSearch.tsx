import { MediaSearchAutocomplete } from "~/components/navbar/search/MediaSearchAutocomplete"
import { MediaSearchModal } from "~/components/navbar/search/MediaSearchModal"
import { useDevice } from "~/hooks/useDevice"

export const MediaSearch = () => {
  const { isAboveLaptop } = useDevice()

  if (isAboveLaptop) {
    return <MediaSearchAutocomplete itemsHrefPrefix={"/media"} />
  }

  return <MediaSearchModal />
}
