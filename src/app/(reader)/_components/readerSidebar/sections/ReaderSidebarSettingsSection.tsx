import { tv } from "tailwind-variants";

import { ReaderSidebarSettingsBrightness } from "../ui/ReaderSidebarSettingsBrightness";
import { ReaderSidebarSettingsNavbarMode } from "../ui/ReaderSidebarSettingsNavbarMode";
import { ReaderSidebarSettingsOpenMode } from "../ui/ReaderSidebarSettingsOpenMode";
import { ReaderSidebarSettingsPageHeight } from "../ui/ReaderSidebarSettingsPageHeight";
import { ReaderSidebarSettingsPageMode } from "../ui/ReaderSidebarSettingsPageMode";
import { ReaderSidebarSettingsPageWidth } from "../ui/ReaderSidebarSettingsPageWidth";
import { ReaderSidebarSettingsSide } from "../ui/ReaderSidebarSettingsSide";

const readerSidebarSettingsSection = tv({
  slots: {
    container: "flex flex-col gap-6",
  },
});

export const ReaderSidebarSettingsSection = () => {
  const { container } = readerSidebarSettingsSection();

  return (
    <div className={container()}>
      <ReaderSidebarSettingsSide />
      <ReaderSidebarSettingsOpenMode />
      <ReaderSidebarSettingsNavbarMode />
      <ReaderSidebarSettingsPageMode />
      <ReaderSidebarSettingsPageHeight />
      <ReaderSidebarSettingsPageWidth />
      <ReaderSidebarSettingsBrightness />
    </div>
  );
};
