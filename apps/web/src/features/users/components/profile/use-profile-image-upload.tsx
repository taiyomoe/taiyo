import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { lazy, Suspense, useRef, useState } from "react"
import {
  type ProfileImageKind,
  type UserProfile,
  useProfileImage,
} from "@/features/users/api/profile"
import { m } from "@/paraglide/messages"

// The editor is only for the profile's owner and only once they pick a file.
const ImageEditorDialog = lazy(async () => ({
  default: (await import("@/features/users/components/image-editor/image-editor-dialog"))
    .ImageEditorDialog,
}))
const ACCEPT = "image/png,image/jpeg,image/gif,image/webp"

/**
 * Everything to change one profile image: a hidden file picker, the editor
 * that places the picked file, and the remove action.
 */
export function useProfileImageUpload(profile: UserProfile, kind: ProfileImageKind) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const { upload, remove } = useProfileImage(profile.username, kind)

  return {
    pick: () => inputRef.current?.click(),
    remove: () => {
      remove.mutate(undefined, {
        onSuccess: () => {
          toastManager.add({
            title: kind === "avatar" ? m.profile_avatar_removed() : m.profile_banner_removed(),
            type: "success",
          })
        },
        onError: () => {
          toastManager.add({ title: m.profile_image_failed(), type: "error" })
        },
      })
    },
    removing: remove.isPending,
    element: (
      <>
        <input
          ref={inputRef}
          accept={ACCEPT}
          hidden
          onChange={(event) => {
            const picked = event.target.files?.[0]

            event.target.value = ""

            if (picked !== undefined) {
              setFile(picked)
            }
          }}
          type="file"
        />
        {file === null ? null : (
          <Suspense>
            <ImageEditorDialog
              file={file}
              kind={kind}
              onClose={() => {
                setFile(null)
              }}
              onConfirm={async (source, crop) => {
                await upload.mutateAsync({ file: source, crop })
                toastManager.add({
                  title:
                    kind === "avatar" ? m.profile_avatar_updated() : m.profile_banner_updated(),
                  type: "success",
                })
              }}
              onReplaceFile={setFile}
              previewName={{ name: profile.displayUsername, nameEffect: profile.nameEffect }}
            />
          </Suspense>
        )}
      </>
    ),
  }
}
