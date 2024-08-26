"use client"

import { useAtomValue } from "jotai"
import { userSettingsSelectedTabAtom } from "~/atoms/userSettings.atoms"

export const UserSettingsDisplayTab = () => {
  const selectedTab = useAtomValue(userSettingsSelectedTabAtom)

  if (selectedTab === "profile") {
    return <div>Profile</div>
  }
}
