"use client"

import { Divider } from "@nextui-org/divider"
import type { UpdateUserSettingsInput } from "@taiyomoe/schemas"
import { useAtomValue } from "jotai"
import { userSettingsSelectedTabAtom } from "~/atoms/userSettings.atoms"
import { UpdateUserSettingsForm } from "~/components/forms/users/update-settings/update-user-settings-form"
import { UserSettingsSessions } from "./sessions/user-settings-sessions"
import { UserSettingsTabs } from "./user-settings-tabs"

type Props = {
  user: UpdateUserSettingsInput
}

export const UserSettingsLayout = ({ user }: Props) => {
  const selectedTab = useAtomValue(userSettingsSelectedTabAtom)

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <UserSettingsTabs />
      <Divider className="hidden h-auto md:block" orientation="vertical" />
      {selectedTab === "sessions" && <UserSettingsSessions />}
      {["profile", "language", "blocks"].includes(selectedTab) && (
        <UpdateUserSettingsForm initialValues={user} />
      )}
    </div>
  )
}
