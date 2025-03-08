import { getTranslations } from "next-intl/server"
import { GaugeIcon } from "~/components/icons/gauge-icon"
import { HomeIcon } from "~/components/icons/home-icon"
import { SettingsGearIcon } from "~/components/icons/settings-gear-icon"
import { SidebarButton } from "./sidebar-button"

export const SidebarContent = async () => {
  const t = await getTranslations("global")

  return (
    <div className="p-4">
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
