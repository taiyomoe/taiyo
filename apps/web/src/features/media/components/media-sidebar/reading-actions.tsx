import { SignedInActions } from "@/features/media/components/media-sidebar/signed-in-actions"
import { SignedOutActions } from "@/features/media/components/media-sidebar/signed-out-actions"

export function ReadingActions({
  mediaId,
  signedIn,
  canEdit,
}: {
  mediaId: string
  signedIn: boolean
  canEdit: boolean
}) {
  return signedIn ? <SignedInActions canEdit={canEdit} mediaId={mediaId} /> : <SignedOutActions />
}
