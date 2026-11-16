import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { type LibraryEntry, useSetLibraryStatus } from "@/features/library/api/library"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const onError = (error: unknown) => {
  toastManager.add({ title: getErrorMessage(error), type: "error" })
}

/** Removes an entry and offers to undo it. Promises, not mutate callbacks: the row unmounts as soon as it is removed. */
export function useRemoveFromLibrary() {
  const setStatus = useSetLibraryStatus()

  return (entry: LibraryEntry) => {
    setStatus.mutateAsync({ mediaId: entry.mediaId, status: null }).then(() => {
      const id = toastManager.add({
        title: m.library_removed({ title: entry.media.title ?? m.media_untitled() }),
        type: "success",
        actionProps: {
          children: m.library_undo(),
          onClick: () => {
            toastManager.close(id)
            setStatus
              .mutateAsync({ mediaId: entry.mediaId, status: entry.status, notify: entry.notify })
              .catch(onError)
          },
        },
      })
    }, onError)
  }
}
