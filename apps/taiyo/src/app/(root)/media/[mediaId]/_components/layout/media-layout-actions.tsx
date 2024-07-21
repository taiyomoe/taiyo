import type { MediaLimited } from "@taiyomoe/types"
import { SignedIn } from "~/components/utils/signed-in/server"
import { MediaLayoutActionsLibraryButton } from "../ui/media-layout-actions-library-button"
import { MediaLayoutActionsUpdateButton } from "../ui/media-layout-actions-update-button"
import { MediaLayoutActionsUploadButton } from "../ui/media-layout-actions-upload-button"

type Props = {
  media: MediaLimited
}

export const MediaLayoutActions = ({ media }: Props) => (
  <div className="flex h-28 flex-col justify-end gap-2 py-3 xl:h-36">
    <p className="media-title line-clamp-1 pb-1 text-center font-bold text-2xl drop-shadow-accent md:text-left md:text-4xl xl:text-5xl">
      {media.mainTitle}
    </p>
    <div className="flex gap-4">
      <MediaLayoutActionsLibraryButton media={media} />
      <SignedIn requiredPermissions={["medias:update:any"]}>
        <MediaLayoutActionsUpdateButton media={media} />
      </SignedIn>
      <SignedIn requiredPermissions={["mediaChapters:create"]}>
        <MediaLayoutActionsUploadButton media={media} />
      </SignedIn>
    </div>
  </div>
)
