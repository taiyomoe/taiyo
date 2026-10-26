import { SignedInActions } from "@/features/media/components/media-sidebar/signed-in-actions"
import { SignedOutActions } from "@/features/media/components/media-sidebar/signed-out-actions"

type ReadingActionsProps = {
  mediaId: string
  signedIn: boolean
  canEdit: boolean
}

export function ReadingActions({ mediaId, signedIn, canEdit }: ReadingActionsProps) {
  return signedIn ? <SignedInActions canEdit={canEdit} mediaId={mediaId} /> : <SignedOutActions />
}
