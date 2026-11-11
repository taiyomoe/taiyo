import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Calendar, Check, Copy, Globe, Tag, Users } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Group } from "@/features/groups/api/groups"
import { getLanguageName } from "@/components/flags/flags"
import { formatNumber } from "@/features/dashboard/lib/format"
import { groupProfileStyles } from "@/features/groups/components/group/profile/group-profile-styles"
import { useCopy } from "@/hooks/use-copy"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  details: {
    margin: 0,
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  detail: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.9375rem",
    justifyContent: "space-between",
    minWidth: 0,
  },
  term: {
    gap: "0.625rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexShrink: 0,
  },
  value: {
    margin: 0,
    gap: "0.25rem",
    alignItems: "center",
    display: "flex",
    flexBasis: "0%",
    flexGrow: 1,
    fontWeight: 500,
    justifyContent: "flex-end",
    minWidth: 0,
  },
  id: {
    overflow: "hidden",
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
})

function Detail({
  icon: Icon,
  term,
  children,
}: {
  icon: (props: IconProps) => ReactElement
  term: string
  children: ReactNode
}) {
  return (
    <div sx={styles.detail}>
      <dt sx={styles.term}>
        <Icon size={16} />
        {term}
      </dt>
      <dd sx={styles.value}>{children}</dd>
    </div>
  )
}

export function GroupDetails({ group }: { group: Group }) {
  return (
    <section sx={groupProfileStyles.section}>
      <h2 sx={groupProfileStyles.sectionTitle}>{m.group_details()}</h2>
      <dl sx={styles.details}>
        <Detail icon={Calendar} term={m.group_detail_founded()}>
          {new Intl.DateTimeFormat(getLocale(), { dateStyle: "long" }).format(
            new Date(group.createdAt),
          )}
        </Detail>
        {group.languages.length === 0 ? null : (
          <Detail icon={Globe} term={m.group_detail_languages()}>
            {group.languages.map((language) => getLanguageName(language)).join(", ")}
          </Detail>
        )}
        <Detail icon={Users} term={m.group_detail_members()}>
          {formatNumber(group.memberCount)}
        </Detail>
        <Detail icon={Tag} term={m.group_detail_id()}>
          <span sx={styles.id} title={group.id}>
            {group.id}
          </span>
          <CopyButton value={group.id} />
        </Detail>
      </dl>
    </section>
  )
}

function CopyButton({ value }: { value: string }) {
  const { copied, copy } = useCopy()
  const label = copied ? m.group_id_copied() : m.group_id_copy()

  return (
    <Button
      aria-label={label}
      onClick={() => {
        copy(value)
      }}
      size="icon-xs"
      title={label}
      variant="ghost"
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}
