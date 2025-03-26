import { useTranslations } from "next-intl"
import { GaugeIcon } from "~/components/icons/gauge-icon"
import { HomeIcon } from "~/components/icons/home-icon"
import { SettingsGearIcon } from "~/components/icons/settings-gear-icon"
import { SidebarButton } from "./sidebar-button"

export const SidebarContent = () => {
  const t = useTranslations("global")

  return (
    <div className="max-h-[calc(100vh-202px)] overflow-y-auto overflow-x-hidden p-4 transition-[padding] duration-300 group-data-[state=collapsed]:p-2">
      <SidebarButton href="/" label={t("home")} icon={HomeIcon} />
      <SidebarButton
        href="/dashboard"
        label={t("dashboard")}
        icon={GaugeIcon}
        color="warning"
      />
      <SidebarButton
        href="/settings"
        label={t("settings")}
        icon={SettingsGearIcon}
      />
    </div>
  )
}
