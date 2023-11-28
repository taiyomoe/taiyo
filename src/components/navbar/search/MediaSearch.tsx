import { MediaSearchAutocomplete } from "~/components/navbar/search/MediaSearchAutocomplete";
import { MediaSearchModal } from "~/components/navbar/search/MediaSearchModal";
import { useDevice } from "~/hooks/useDevice";

export const MediaSearch = () => {
  const { isMobile } = useDevice();

  return isMobile ? <MediaSearchModal /> : <MediaSearchAutocomplete />;
};
