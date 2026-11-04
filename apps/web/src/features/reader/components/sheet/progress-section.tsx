import type { ReaderSettingsControls } from "@/features/reader/hooks/use-reader-settings"
import { SettingChoice, SettingSection } from "@/features/reader/components/sheet/setting-controls"
import { m } from "@/paraglide/messages"

export function ProgressSection({
  settings,
  update,
}: Pick<ReaderSettingsControls, "settings" | "update">) {
  return (
    <SettingSection title={m.reader_section_progress()}>
      <SettingChoice
        label={m.reader_progress_style()}
        onChange={(progressStyle) => {
          update({ progressStyle })
        }}
        options={[
          { value: "segments", label: m.reader_progress_segments() },
          { value: "bar", label: m.reader_progress_bar() },
          { value: "counter", label: m.reader_progress_counter() },
          { value: "percent", label: m.reader_progress_percent() },
          { value: "hidden", label: m.reader_progress_hidden() },
        ]}
        value={settings.progressStyle}
      />
    </SettingSection>
  )
}
