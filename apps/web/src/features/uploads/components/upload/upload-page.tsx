import type { Language } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { CheckCircle } from "@taiyomoe/ui/components/icons"
import { Alert, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { getRouteApi } from "@tanstack/react-router"
import { useState } from "react"
import type { GroupOption } from "@/features/groups/components/group-picker"
import type { MediaOption } from "@/features/uploads/components/upload/media-field"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { ChapterTable } from "@/features/uploads/components/upload/chapter-table"
import { DropZone } from "@/features/uploads/components/upload/drop-zone"
import { PagesDialog } from "@/features/uploads/components/upload/pages-dialog"
import { UploadFooter } from "@/features/uploads/components/upload/upload-footer"
import { UploadSettings } from "@/features/uploads/components/upload/upload-settings"
import { useChapterIssues } from "@/features/uploads/hooks/use-chapter-issues"
import { useChapterRows } from "@/features/uploads/hooks/use-chapter-rows"
import { useSubmissionQuota } from "@/features/uploads/hooks/use-submission-quota"
import { isWebUrl, resolveLink } from "@/features/uploads/lib/chapter-batch/links"
import {
  DEFAULT_RELEASE,
  planRelease,
  type ReleaseSettings,
} from "@/features/uploads/lib/chapter-batch/release"
import { byNumber, linkNumber, parseNumber } from "@/features/uploads/lib/chapter-batch/upload-rows"
import { uploadStore } from "@/features/uploads/lib/chapter-batch/upload-store"
import { useNow } from "@/hooks/use-now"
import { usePermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/upload")
const styles = stylex.create({
  layout: {
    gap: "1.5rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (width >= 64rem)": "22rem minmax(0, 1fr)",
    },
  },
  column: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
})

export function UploadPage() {
  const { session } = routeApi.useRouteContext()
  const { user } = session
  const can = usePermissions(user)
  const [media, setMedia] = useState<MediaOption | null>(null)
  const [language, setLanguage] = useState<Language>("en")
  const [groups, setGroups] = useState<GroupOption[]>([])
  const [attempted, setAttempted] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [release, setRelease] = useState<ReleaseSettings>(DEFAULT_RELEASE)
  const [template, setTemplate] = useState("")
  const {
    rows,
    reading,
    unsupported,
    started,
    updateRow,
    addFiles,
    addLinkRow,
    removeRow,
    clearRows,
    markStarted,
  } = useChapterRows()
  const now = useNow()
  const plan = planRelease(release, now)
  const templateLink = resolveLink("", template, "1")
  const templateInvalid = templateLink !== null && !isWebUrl(templateLink)
  const { publishes, pendingCount, slotsLeft, overCap } = useSubmissionQuota(
    can,
    groups,
    rows.length,
  )
  const { existingNumbers, issues } = useChapterIssues({
    mediaId: media?.id,
    language,
    rows,
    template,
  })
  const order = new Map([...rows].sort(byNumber).map((row, index) => [row.key, index]))
  const blocked =
    [...issues.values()].some((issue) => issue.errors.length > 0) ||
    plan.error !== null ||
    templateInvalid

  return (
    <DashboardPage subtitle={m.upload_subtitle()} title={m.upload_title()}>
      <div sx={styles.layout}>
        <UploadSettings
          attempted={attempted}
          can={can}
          groups={groups}
          language={language}
          media={media}
          onGroupsChange={setGroups}
          onLanguageChange={setLanguage}
          onMediaChange={setMedia}
          onReleaseChange={(patch) => {
            setRelease((current) => ({ ...current, ...patch }))
          }}
          onTemplateChange={setTemplate}
          pendingCount={pendingCount}
          publishes={publishes}
          release={release}
          planError={plan.error}
          rowCount={rows.length}
          slotsLeft={slotsLeft}
          template={template}
          templateInvalid={templateInvalid}
        />
        <div sx={styles.column}>
          {started ? (
            <Alert variant="success">
              <CheckCircle />
              <AlertTitle>{m.upload_started()}</AlertTitle>
            </Alert>
          ) : null}
          <DropZone
            onAddLinkOnly={() => {
              addLinkRow(existingNumbers)
            }}
            onFiles={addFiles}
            reading={reading}
            unsupported={unsupported}
          />
          {rows.length === 0 ? null : (
            <ChapterTable
              attempted={attempted}
              issues={issues}
              onClear={() => {
                clearRows()
                setAttempted(false)
              }}
              onEditPages={setEditing}
              onRemove={removeRow}
              onRowChange={updateRow}
              order={order}
              plan={plan}
              rows={rows}
              template={template}
            />
          )}
          {rows.length === 0 ? null : (
            <UploadFooter
              attempted={attempted}
              blocked={blocked}
              onStart={() => {
                setAttempted(true)

                const startPlan = planRelease(release, Date.now())

                if (media === null || blocked || overCap || startPlan.error !== null) {
                  return
                }

                uploadStore.start({
                  mediaId: media.id,
                  mediaTitle: media.title,
                  language,
                  groupIds: groups.map((group) => group.id),
                  jobs: rows.map((row) => ({
                    key: row.key,
                    number: parseNumber(row.number) ?? 0,
                    volume: row.volume.trim() === "" ? null : row.volume.trim(),
                    title: row.title.trim() === "" ? null : row.title.trim(),
                    source: row.source,
                    pageKeys: row.pageKeys,
                    publishAt: startPlan.at(order.get(row.key) ?? 0)?.toISOString() ?? null,
                    externalUrl: resolveLink(row.link, template, linkNumber(row)),
                  })),
                })
                markStarted()
                setAttempted(false)
              }}
              overCap={overCap}
              reading={reading}
              rows={rows}
            />
          )}
        </div>
      </div>
      <PagesDialog
        onClose={() => {
          setEditing(null)
        }}
        onRowChange={updateRow}
        row={rows.find((row) => row.key === editing)}
      />
    </DashboardPage>
  )
}
