// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Download, Package } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { useQuery } from "@tanstack/react-query"
import { Pill } from "@/components/badges/pill"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { TimeAgo } from "@/components/time/time-ago"
import {
  type DataExportState,
  myDataExportQueryOptions,
  useDownloadDataExport,
  useRequestDataExport,
} from "@/features/settings/api/data-export"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

type DataExport = NonNullable<DataExportState["latest"]>

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(getLocale(), { dateStyle: "long", timeStyle: "short" }).format(
    new Date(iso),
  )
const formatSize = (bytes: number) => {
  const [value, unit] =
    bytes < 1024 * 1024 ? [bytes / 1024, "kilobyte"] : [bytes / (1024 * 1024), "megabyte"]

  return new Intl.NumberFormat(getLocale(), {
    style: "unit",
    unit,
    unitDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value)
}

function ExportStatus({ latest }: { latest: DataExport }) {
  if (latest.status === "PENDING") {
    return (
      <li sx={settingsStyles.item}>
        <Spinner sx={settingsStyles.itemIcon} />
        <div sx={settingsStyles.itemMain}>
          <span sx={settingsStyles.itemTitle}>{m.user_settings_data_preparing_title()}</span>
          <span sx={settingsStyles.itemMeta}>{m.user_settings_data_preparing()}</span>
        </div>
      </li>
    )
  }

  if (latest.status === "READY") {
    return (
      <li sx={settingsStyles.item}>
        <Package size={20} sx={settingsStyles.itemIcon} />
        <div sx={settingsStyles.itemMain}>
          <span sx={settingsStyles.itemTitle}>
            {m.user_settings_data_ready_title()}
            <Pill variant="success">{m.user_settings_data_ready_badge()}</Pill>
          </span>
          <span sx={settingsStyles.itemMeta}>
            {latest.byteSize === null ? null : <span>{formatSize(latest.byteSize)}</span>}
            {latest.expiresAt === null ? null : (
              <span>
                {m.user_settings_data_available_until({ date: formatDate(latest.expiresAt) })}
              </span>
            )}
          </span>
        </div>
      </li>
    )
  }

  return (
    <li sx={settingsStyles.item}>
      <Package size={20} sx={settingsStyles.itemIcon} />
      <div sx={settingsStyles.itemMain}>
        <span sx={settingsStyles.itemTitle}>
          {latest.status === "FAILED"
            ? m.user_settings_data_failed_title()
            : m.user_settings_data_expired_title()}
        </span>
        <span sx={settingsStyles.itemMeta}>
          {latest.status === "FAILED" ? (
            m.user_settings_data_failed()
          ) : (
            <span>
              {m.user_settings_data_requested()} <TimeAgo date={latest.requestedAt} />
            </span>
          )}
        </span>
      </div>
    </li>
  )
}

export function DataExportSection() {
  const state = useQuery(myDataExportQueryOptions)
  const request = useRequestDataExport()
  const download = useDownloadDataExport()
  const latest = state.data?.latest ?? null
  const nextRequestAt = state.data?.nextRequestAt ?? null
  const error = state.error ?? request.error ?? download.error
  const canRequest =
    state.data !== undefined && latest?.status !== "PENDING" && nextRequestAt === null

  return (
    <SettingsSection
      description={m.user_settings_data_description({ days: config.dataExports.expiryDays })}
      footer={
        <div sx={settingsStyles.actions}>
          {latest?.status === "READY" && !canRequest ? null : (
            <Button
              disabled={!canRequest}
              loading={request.isPending}
              onClick={() => {
                request.mutate()
              }}
              variant={latest === null ? "default" : "outline"}
            >
              {latest?.status === "FAILED"
                ? m.user_settings_data_retry()
                : m.user_settings_data_request()}
            </Button>
          )}
          {latest?.status === "READY" ? (
            <Button
              loading={download.isPending}
              onClick={() => {
                download.mutate(latest.id)
              }}
            >
              <Download />
              {m.user_settings_data_download()}
            </Button>
          ) : null}
        </div>
      }
      title={m.user_settings_data_title()}
    >
      <div sx={settingsStyles.form}>
        <ErrorAlert message={error === null ? null : getErrorMessage(error)} />
        {state.data === undefined ? (
          <Skeleton sx={settingsStyles.itemSkeleton} />
        ) : (
          <>
            {latest === null ? (
              <p sx={settingsStyles.muted}>{m.user_settings_data_never()}</p>
            ) : (
              <ul aria-live="polite" sx={settingsStyles.list}>
                <ExportStatus latest={latest} />
              </ul>
            )}
            {nextRequestAt === null || latest?.status === "PENDING" ? null : (
              <p sx={settingsStyles.muted}>
                {m.user_settings_data_next()} <TimeAgo date={nextRequestAt} future length="long" />
              </p>
            )}
          </>
        )}
      </div>
    </SettingsSection>
  )
}
