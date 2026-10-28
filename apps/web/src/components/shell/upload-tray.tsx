import * as stylex from "@stylexjs/stylex"
import { Progress } from "@taiyomoe/ui/components/ui/progress"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useSyncExternalStore } from "react"
import { UploadTrayBatch } from "@/components/shell/upload-tray-batch"
import { UploadTrayHeader } from "@/components/shell/upload-tray-header"
import { summarize, uploadStore } from "@/features/uploads/lib/chapter-batch/upload-store"
import { m } from "@/paraglide/messages"

let expanded = false
const expandedListeners = new Set<() => void>()
const expandedStore = {
  subscribe: (listener: () => void) => {
    expandedListeners.add(listener)

    return () => {
      expandedListeners.delete(listener)
    }
  },
  get: () => expanded,
  toggle: () => {
    expanded = !expanded

    for (const listener of expandedListeners) {
      listener()
    }
  },
}
const styles = stylex.create({
  tray: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.popover,
    boxShadow: shadows.overlay,
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    zIndex: 40,
    bottom: "1rem",
    right: "1rem",
    width: "min(26rem, calc(100vw - 2rem))",
  },
  progress: {
    paddingInline: "1rem",
    paddingBottom: "0.875rem",
  },
  body: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    maxHeight: "min(26rem, 55vh)",
    overflowY: "auto",
  },
})

export function UploadTray() {
  const batches = useSyncExternalStore(
    uploadStore.subscribe,
    uploadStore.getSnapshot,
    uploadStore.getServerSnapshot,
  )
  const open = useSyncExternalStore(expandedStore.subscribe, expandedStore.get, () => false)
  const queryClient = useQueryClient()

  useEffect(() => {
    uploadStore.connect(queryClient)
  }, [queryClient])
  const jobs = batches.flatMap((batch) => batch.jobs)
  const summary = summarize(jobs)
  const progress =
    (jobs.reduce((sum, { state }) => {
      if (state.kind === "uploading") {
        return sum + (state.total === 0 ? 0 : state.done / state.total)
      }

      return sum + (state.kind === "queued" ? 0 : 1)
    }, 0) /
      Math.max(jobs.length, 1)) *
    100

  if (batches.length === 0) {
    return null
  }

  return (
    <aside aria-label={m.uploads_title_active()} sx={styles.tray}>
      <UploadTrayHeader
        onDismiss={() => {
          for (const batch of batches) {
            uploadStore.dismiss(batch.id)
          }
        }}
        onToggle={expandedStore.toggle}
        open={open}
        summary={summary}
      />
      {summary.busy ? (
        <div sx={styles.progress}>
          <Progress value={Math.round(progress)} />
        </div>
      ) : null}
      {open ? (
        <div sx={styles.body}>
          {batches.map((batch) => (
            <UploadTrayBatch batch={batch} key={batch.id} />
          ))}
        </div>
      ) : null}
    </aside>
  )
}
