import * as stylex from "@stylexjs/stylex"
import { Globe } from "@taiyomoe/ui/components/icons"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ReaderChapter } from "@/features/reader/api/reader"
import { LanguageFlag } from "@/components/flags/flags"
import { getLanguageName } from "@/components/flags/language-flags"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  option: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
    width: "100%",
  },
  label: {
    overflow: "hidden",
    flexGrow: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  meta: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontSize: "0.75rem",
  },
  static: {
    paddingBlock: "0.5rem",
    fontSize: "0.875rem",
  },
})
const groupNames = (chapter: ReaderChapter) =>
  chapter.groups.length === 0
    ? m.chapter_no_group()
    : chapter.groups.map((group) => group.name).join(", ")

function VersionLabel({ chapter }: { chapter: ReaderChapter }) {
  return (
    <span sx={styles.option}>
      <LanguageFlag language={chapter.language} />
      <span sx={styles.label}>{groupNames(chapter)}</span>
      {chapter.isExternal ? (
        <span sx={styles.meta} title={m.reader_chapter_external()}>
          <Globe size={14} />
        </span>
      ) : (
        <span sx={styles.meta}>{getLanguageName(chapter.language)}</span>
      )}
    </span>
  )
}

export function VersionSelect({
  current,
  versions,
  onSelect,
}: {
  current: ReaderChapter
  versions: readonly ReaderChapter[]
  onSelect: (chapter: ReaderChapter) => void
}) {
  if (versions.length < 2) {
    return (
      <div sx={styles.static}>
        <VersionLabel chapter={current} />
      </div>
    )
  }

  return (
    <Select
      onValueChange={(id) => {
        const chapter = versions.find((version) => version.id === id)

        if (chapter !== undefined && chapter.id !== current.id) {
          onSelect(chapter)
        }
      }}
      value={current.id}
    >
      <SelectTrigger aria-label={m.reader_version()}>
        <SelectValue>{() => <VersionLabel chapter={current} />}</SelectValue>
      </SelectTrigger>
      <SelectPopup>
        {versions.map((version) => (
          <SelectItem key={version.id} value={version.id}>
            <VersionLabel chapter={version} />
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}
