import { useAtomValue } from "jotai"
import { userSettingsSelectedTabAtom } from "~/atoms/userSettings.atoms"
import { UserSettingsFormBlocksCategory } from "./categories/user-settings-form-blocks-category"
import { UserSettingsFormLanguageCategory } from "./categories/user-settings-form-language-category"
import { UserSettingsFormProfileCategory } from "./categories/user-settings-form-profile-category"

export const UpdateUserSettingsFormFields = () => {
  const selectedTab = useAtomValue(userSettingsSelectedTabAtom)

  if (selectedTab === "profile") {
    return <UserSettingsFormProfileCategory />
  }

  if (selectedTab === "language") {
    return <UserSettingsFormLanguageCategory />
  }

  return <UserSettingsFormBlocksCategory />
}
