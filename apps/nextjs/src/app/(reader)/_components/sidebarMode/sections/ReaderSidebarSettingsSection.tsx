import { tv } from "tailwind-variants";

import { ReaderSidebarSettingsNavbarMode } from "../ui/ReaderSidebarSettingsNavbarMode";
import { ReaderSidebarSettingsOpenMode } from "../ui/ReaderSidebarSettingsOpenMode";
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
    </div>
  );
};
