import type { ReaderSettingsControls } from "@/features/reader/hooks/use-reader-settings"
import {
  SettingChoice,
  SettingSection,
  SettingSlider,
  SettingSwitch,
} from "@/features/reader/components/sheet/setting-controls"
import { m } from "@/paraglide/messages"

export function ControlsSection({
  settings,
  update,
  signedIn,
}: Pick<ReaderSettingsControls, "settings" | "update"> & { signedIn: boolean }) {
  return (
    <SettingSection title={m.reader_section_controls()}>
      <SettingChoice
        hint={m.reader_click_zones_hint()}
        label={m.reader_click_zones()}
        onChange={(clickZones) => {
          update({ clickZones })
        }}
        options={[
          { value: "sides", label: m.reader_click_zones_sides() },
          { value: "thirds", label: m.reader_click_zones_thirds() },
          { value: "off", label: m.reader_click_zones_off() },
        ]}
        value={settings.clickZones}
      />
      <SettingSwitch
        checked={settings.swipe}
        label={m.reader_swipe()}
        onChange={(swipe) => {
          update({ swipe })
        }}
      />
      <SettingSwitch
        checked={settings.cursorHints}
        label={m.reader_cursor_hints()}
        onChange={(cursorHints) => {
          update({ cursorHints })
        }}
      />
      <SettingSwitch
        checked={settings.autoHideControls}
        label={m.reader_auto_hide()}
        onChange={(autoHideControls) => {
          update({ autoHideControls })
        }}
      />
      <SettingSwitch
        checked={settings.confirmChapterChange}
        label={m.reader_confirm_chapter()}
        onChange={(confirmChapterChange) => {
          update({ confirmChapterChange })
        }}
      />
      <SettingSwitch
        checked={settings.warnChapterGap}
        label={m.reader_warn_gap()}
        onChange={(warnChapterGap) => {
          update({ warnChapterGap })
        }}
      />
      {signedIn ? (
        <SettingSwitch
          checked={settings.resume}
          hint={m.reader_resume_hint()}
          label={m.reader_resume()}
          onChange={(resume) => {
            update({ resume })
          }}
        />
      ) : null}
      <SettingSlider
        format={(value) => m.reader_preload_value({ value })}
        hint={m.reader_preload_hint()}
        label={m.reader_preload()}
        max={10}
        min={0}
        onChange={(preload) => {
          update({ preload })
        }}
        value={settings.preload}
      />
      {settings.mode === "strip" ? (
        <SettingSlider
          format={(value) => m.reader_speed_value({ value })}
          label={m.reader_auto_scroll_speed()}
          max={600}
          min={10}
          onChange={(autoScrollSpeed) => {
            update({ autoScrollSpeed })
          }}
          step={10}
          value={settings.autoScrollSpeed}
        />
      ) : null}
    </SettingSection>
  )
}
