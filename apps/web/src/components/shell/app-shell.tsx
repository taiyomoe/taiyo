import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Close,
  CloudUpload,
} from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Progress } from "@taiyomoe/ui/components/ui/progress"
import { SidebarInset, SidebarProvider } from "@taiyomoe/ui/components/ui/sidebar"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQueryClient } from "@tanstack/react-query"
import { useRouteContext } from "@tanstack/react-router"
import { useEffect, useSyncExternalStore } from "react"
import type { Session } from "@/lib/queries/session"
import { ChapterNumber } from "@/components/chapters/chapter-meta"
import { LanguageFlag } from "@/components/chapters/flags"
import { AppNavbar } from "@/components/shell/app-navbar"
import { type AppSidebarSection, AppSidebar } from "@/components/shell/app-sidebar"
import {
  type JobOutcome,
  type JobState,
  summarize,
  uploadStore,
} from "@/lib/chapter-batch/upload-store"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  provider: {
    "--navbar-height": "4.5rem",
    flexDirection: "column",
  },
  body: {
    flex: "1",
    display: "flex",
    minHeight: 0,
    paddingTop: "var(--navbar-height)",
  },
  inset: {
    minWidth: 0,
  },
})
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
const trayStyles = stylex.create({
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
  header: {
    gap: "0.75rem",
    paddingBlock: "0.875rem",
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
  },
  headerIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  headerIconDone: {
    color: colors.success,
  },
  headerText: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: "0.9375rem",
    fontWeight: 600,
  },
  headerMeta: {
    gap: "0.625rem",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
  },
  failed: {
    color: colors.destructive,
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
  batch: {
    paddingBlock: "0.75rem",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: { default: 1, ":first-child": 0 },
  },
  batchHeader: {
    gap: "0.5rem",
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    marginBottom: "0.375rem",
  },
  batchTitle: {
    overflow: "hidden",
    flexGrow: 1,
    fontSize: "0.875rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  jobs: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  job: {
    gap: "0.625rem",
    paddingBlock: "0.3125rem",
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.8125rem",
  },
  jobTitle: {
    overflow: "hidden",
    color: colors.mutedForeground,
    flexGrow: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  jobState: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontVariantNumeric: "tabular-nums",
  },
  jobStateDone: {
    color: colors.success,
  },
  jobStateFailed: {
    color: colors.destructive,
  },
})
const STATE_STYLES: Partial<Record<JobState["kind"], stylex.StyleXStyles>> = {
  done: trayStyles.jobStateDone,
  failed: trayStyles.jobStateFailed,
}
const SIMPLE_LABELS: Record<Exclude<JobState["kind"], "uploading" | "done">, () => string> = {
  queued: m.uploads_state_queued,
  processing: m.uploads_state_processing,
  failed: m.uploads_state_failed,
  cancelled: m.uploads_state_cancelled,
}
const OUTCOME_LABELS: Record<JobOutcome, () => string> = {
  published: m.uploads_state_published,
  scheduled: m.uploads_state_scheduled,
  review: m.uploads_state_review,
}

type AppShellProps = {
  user: Session["user"] | null
  overlayNavbar?: boolean
  sections?: readonly AppSidebarSection[]
  children: ReactNode
}

export function AppShell({ user, overlayNavbar = false, sections, children }: AppShellProps) {
  const { sidebarPrefs } = useRouteContext({ from: "__root__" })
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

  return (
    <SidebarProvider
      data-app-shell=""
      defaultOpen={sidebarPrefs.defaultOpen}
      defaultWidth={sidebarPrefs.defaultWidth ?? 248}
      sx={styles.provider}
    >
      <AppNavbar overlay={overlayNavbar} user={user} />
      <div sx={styles.body}>
        <AppSidebar sections={sections} />
        <SidebarInset sx={styles.inset}>{children}</SidebarInset>
      </div>
      {batches.length === 0 ? null : (
        <aside aria-label={m.uploads_title_active()} sx={trayStyles.tray}>
          <div sx={trayStyles.header}>
            {summary.busy ? (
              <CloudUpload {...stylex.props(trayStyles.headerIcon)} />
            ) : (
              <CheckCircle {...stylex.props(trayStyles.headerIcon, trayStyles.headerIconDone)} />
            )}
            <div sx={trayStyles.headerText}>
              <span sx={trayStyles.headerTitle}>
                {summary.busy ? m.uploads_title_active() : m.uploads_title_done()}
              </span>
              <span sx={trayStyles.headerMeta}>
                <span>{m.uploads_progress({ done: summary.done, total: summary.total })}</span>
                {summary.failed > 0 ? (
                  <span sx={trayStyles.failed}>
                    <AlertCircle size={12} /> {m.uploads_failed({ count: summary.failed })}
                  </span>
                ) : null}
              </span>
            </div>
            <Button
              aria-expanded={open}
              aria-label={open ? m.uploads_collapse() : m.uploads_expand()}
              onClick={expandedStore.toggle}
              size="icon-sm"
              variant="ghost"
            >
              {open ? <ChevronDown /> : <ChevronUp />}
            </Button>
            {summary.busy ? null : (
              <Button
                aria-label={m.uploads_dismiss()}
                onClick={() => {
                  for (const batch of batches) {
                    uploadStore.dismiss(batch.id)
                  }
                }}
                size="icon-sm"
                variant="ghost"
              >
                <Close />
              </Button>
            )}
          </div>
          {summary.busy ? (
            <div sx={trayStyles.progress}>
              <Progress value={Math.round(progress)} />
            </div>
          ) : null}
          {open ? (
            <div sx={trayStyles.body}>
              {batches.map((batch) => {
                const batchSummary = summarize(batch.jobs)
                const batchActive = batchSummary.queued + batchSummary.uploading > 0

                return (
                  <section key={batch.id} sx={trayStyles.batch}>
                    <div sx={trayStyles.batchHeader}>
                      <LanguageFlag language={batch.language} />
                      <span sx={trayStyles.batchTitle} title={batch.mediaTitle}>
                        {batch.mediaTitle}
                      </span>
                      {batchSummary.failed + batchSummary.cancelled > 0 && !batchActive ? (
                        <Button
                          onClick={() => {
                            uploadStore.retry(batch.id)
                          }}
                          size="xs"
                          variant="outline"
                        >
                          {m.uploads_retry()}
                        </Button>
                      ) : null}
                      {batchActive ? (
                        <Button
                          onClick={() => {
                            uploadStore.cancel(batch.id)
                          }}
                          size="xs"
                          variant="ghost"
                        >
                          {m.uploads_cancel()}
                        </Button>
                      ) : null}
                      {batchSummary.busy ? null : (
                        <Button
                          onClick={() => {
                            uploadStore.dismiss(batch.id)
                          }}
                          size="xs"
                          variant="ghost"
                        >
                          {m.uploads_dismiss()}
                        </Button>
                      )}
                    </div>
                    <ul sx={trayStyles.jobs}>
                      {batch.jobs.map((job) => {
                        const { state } = job
                        let label: string

                        if (state.kind === "uploading") {
                          label = m.uploads_state_uploading({
                            done: state.done,
                            total: state.total,
                          })
                        } else if (state.kind === "done") {
                          label = OUTCOME_LABELS[state.outcome]()
                        } else {
                          label = SIMPLE_LABELS[state.kind]()
                        }

                        return (
                          <li
                            key={job.key}
                            sx={trayStyles.job}
                            title={state.kind === "failed" ? state.message : undefined}
                          >
                            <ChapterNumber number={job.number} />
                            <span sx={trayStyles.jobTitle}>{job.title ?? ""}</span>
                            <span sx={[trayStyles.jobState, STATE_STYLES[state.kind]]}>
                              {label}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              })}
            </div>
          ) : null}
        </aside>
      )}
    </SidebarProvider>
  )
}
