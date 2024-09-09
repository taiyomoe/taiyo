"use client"
import { useAtom } from "jotai"
import { BanIcon, LanguagesIcon, UserPenIcon } from "lucide-react"
import { userSettingsSelectedTabAtom } from "~/atoms/userSettings.atoms"
import { ResponsiveTabs } from "~/components/ui/responsive-tabs"

export const UserSettingsTabs = () => {
  const [selectedTab, setSelectedTab] = useAtom(userSettingsSelectedTabAtom)

  return (
    <ResponsiveTabs
      items={[
        {
          id: "profile",
          label: "Perfil",
          startContent: <UserPenIcon size={20} />,
        },
        {
          id: "language",
          label: "Idioma",
          startContent: <LanguagesIcon size={20} />,
        },
        {
          id: "blocks",
          label: "Bloqueios",
          startContent: <BanIcon size={20} />,
        },
      ]}
      onChange={(id) => setSelectedTab(id as typeof selectedTab)}
      classNames={{
        button: "md:min-w-40",
      }}
    />
  )
}
