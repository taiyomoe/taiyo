import * as stylex from "@stylexjs/stylex"
import { Copy } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { AuditLogEntry } from "@/features/activity-log/api/audit-logs"
import { EntryChanges } from "@/features/activity-log/components/detail/entry-changes"
import { EntryFields } from "@/features/activity-log/components/detail/entry-fields"
import { EntrySummary } from "@/features/activity-log/components/detail/entry-summary"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  panel: {
    padding: "1rem",
    gap: "1rem",
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    insetInlineStart: 0,
    position: "sticky",
    whiteSpace: "normal",
    width: "100cqi",
  },
  header: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  json: {
    margin: 0,
    padding: "1rem",
    borderRadius: radius.lg,
    overflow: "auto",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
    maxHeight: "28rem",
  },
})

export function LogEntryDetail({
  entry,
  onFilter,
}: {
  entry: AuditLogEntry
  onFilter: (field: string, value: string, negate: boolean) => void
}) {
  const toRecord = (value: unknown) =>
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? Object.fromEntries<unknown>(Object.entries(value))
      : {}
  const previous = toRecord(entry.changes?.before)
  const next = toRecord(entry.changes?.after)
  const changes = [...new Set([...Object.keys(previous), ...Object.keys(next)])].map((field) => ({
    field,
    before: previous[field],
    after: next[field],
  }))
  const json = JSON.stringify(entry, null, 2)

  return (
    <div sx={styles.panel}>
      <EntrySummary entry={entry} />
      <Tabs defaultValue="fields">
        <div sx={styles.header}>
          <TabsList>
            <TabsTab value="fields">{m.activity_detail_fields()}</TabsTab>
            <TabsTab value="changes">
              {m.activity_detail_changes({ count: String(changes.length) })}
            </TabsTab>
            <TabsTab value="json">{m.activity_detail_json()}</TabsTab>
          </TabsList>
          <Button
            onClick={() => {
              void navigator.clipboard.writeText(json)
            }}
            size="sm"
            variant="outline"
          >
            <Copy />
            {m.activity_detail_copy_json()}
          </Button>
        </div>
        <TabsPanel value="fields">
          <EntryFields entry={entry} onFilter={onFilter} />
        </TabsPanel>
        <TabsPanel value="changes">
          <EntryChanges changes={changes} />
        </TabsPanel>
        <TabsPanel value="json">
          <pre sx={styles.json}>{json}</pre>
        </TabsPanel>
      </Tabs>
    </div>
  )
}
