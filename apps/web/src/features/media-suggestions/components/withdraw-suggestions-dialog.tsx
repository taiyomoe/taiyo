import type { MediaSuggestion } from "@/features/media-suggestions/api/media-suggestions"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { useWithdrawSuggestions } from "@/features/media-suggestions/api/media-suggestions"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

/** Withdraws one of your pending suggestions or the selected ones. */
export function WithdrawSuggestionsDialog({
  suggestions,
  onClose,
  onDone,
}: {
  suggestions: readonly MediaSuggestion[] | null
  onClose: () => void
  onDone?: (() => void) | undefined
}) {
  const withdraw = useWithdrawSuggestions()
  const [only] = suggestions ?? []

  return (
    <ConfirmDialog
      confirmation={
        suggestions === null
          ? null
          : {
              title:
                suggestions.length === 1 && only !== undefined
                  ? m.my_suggestions_withdraw_title_one({
                      title: only.media.title ?? m.media_untitled(),
                    })
                  : m.my_suggestions_withdraw_title({ count: suggestions.length }),
              description: m.my_suggestions_withdraw_description(),
              confirmLabel: m.my_suggestions_withdraw(),
              destructive: true,
              run: async () => {
                toastBulkResult(
                  await withdraw.mutateAsync(suggestions.map((suggestion) => suggestion.id)),
                  m.my_suggestions_withdrawn,
                )
                onDone?.()
              },
            }
      }
      error={withdraw.isError ? getErrorMessage(withdraw.error) : null}
      onClose={() => {
        withdraw.reset()
        onClose()
      }}
      pending={withdraw.isPending}
    />
  )
}
