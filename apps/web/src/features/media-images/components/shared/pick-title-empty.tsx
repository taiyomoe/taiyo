import { Library } from "@taiyomoe/ui/components/icons"
import { MediaImagesEmpty } from "@/features/media/components/media-images-empty"
import { m } from "@/paraglide/messages"

export function PickTitleEmpty({ description }: { description: string }) {
  return (
    <MediaImagesEmpty
      description={description}
      icon={<Library />}
      title={m.media_images_pick_title()}
    />
  )
}
