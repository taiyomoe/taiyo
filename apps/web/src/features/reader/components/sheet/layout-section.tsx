import type { ReaderSettingsControls } from "@/features/reader/hooks/use-reader-settings"
import {
  SettingChoice,
  SettingSection,
  SettingSlider,
  SettingSwitch,
} from "@/features/reader/components/sheet/setting-controls"
import { m } from "@/paraglide/messages"

export function LayoutSection({
  settings,
  update,
  longStrip,
}: Omit<ReaderSettingsControls, "reset">) {
  const strip = settings.mode === "strip"

  return (
    <SettingSection title={m.reader_section_layout()}>
      <SettingChoice
        hint={longStrip ? m.reader_mode_long_strip_hint() : undefined}
        label={m.reader_mode()}
        onChange={(mode) => {
          update({ mode })
        }}
        options={[
          { value: "single", label: m.reader_mode_single() },
          { value: "double", label: m.reader_mode_double() },
          { value: "strip", label: m.reader_mode_strip() },
        ]}
        value={settings.mode}
      />
      {strip ? null : (
        <>
          <SettingChoice
            label={m.reader_direction()}
            onChange={(direction) => {
              update({ direction })
            }}
            options={[
              { value: "ltr", label: m.reader_direction_ltr() },
              { value: "rtl", label: m.reader_direction_rtl() },
            ]}
            value={settings.direction}
          />
          <SettingChoice
            label={m.reader_fit()}
            onChange={(fit) => {
              update({ fit })
            }}
            options={[
              { value: "screen", label: m.reader_fit_screen() },
              { value: "height", label: m.reader_fit_height() },
              { value: "width", label: m.reader_fit_width() },
              { value: "original", label: m.reader_fit_original() },
            ]}
            value={settings.fit}
          />
          {settings.fit === "original" ? null : (
            <SettingSwitch
              checked={settings.stretchSmall}
              label={m.reader_stretch_small()}
              onChange={(stretchSmall) => {
                update({ stretchSmall })
              }}
            />
          )}
        </>
      )}
      {settings.mode === "double" ? (
        <SettingSwitch
          checked={settings.firstPageAlone}
          hint={m.reader_first_page_alone_hint()}
          label={m.reader_first_page_alone()}
          onChange={(firstPageAlone) => {
            update({ firstPageAlone })
          }}
        />
      ) : null}
      {strip || settings.fit === "width" ? (
        <SettingSlider
          format={(value) => m.reader_pixels({ value })}
          label={m.reader_page_width()}
          max={2400}
          min={320}
          onChange={(pageWidth) => {
            update({ pageWidth })
          }}
          step={20}
          value={settings.pageWidth}
        />
      ) : null}
      {strip ? (
        <SettingSwitch
          checked={settings.continuous}
          hint={m.reader_continuous_hint()}
          label={m.reader_continuous()}
          onChange={(continuous) => {
            update({ continuous })
          }}
        />
      ) : null}
      {strip ? (
        <SettingSlider
          format={(value) => m.reader_pixels({ value })}
          label={m.reader_page_gap()}
          max={64}
          min={0}
          onChange={(pageGap) => {
            update({ pageGap })
          }}
          step={2}
          value={settings.pageGap}
        />
      ) : null}
    </SettingSection>
  )
}
