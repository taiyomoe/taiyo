import { Divider } from "@nextui-org/react"
import type { UpdateUserSettingsInput } from "@taiyomoe/schemas"
import { UpdateUserSettingsForm } from "~/components/forms/users/update-settings/update-user-settings-form"
import { UserSettingsTabs } from "./user-settings-tabs"

type Props = {
  user: UpdateUserSettingsInput
}

export const UserSettingsLayout = ({ user }: Props) => {
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <UserSettingsTabs />
      <Divider className="hidden h-auto md:block" orientation="vertical" />
      <UpdateUserSettingsForm initialValues={user} />
    </div>
  )
}
