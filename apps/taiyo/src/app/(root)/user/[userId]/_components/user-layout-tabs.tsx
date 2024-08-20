"use client"

import { Tab, Tabs } from "@nextui-org/tabs"
import type { UserLimited } from "@taiyomoe/types"
import { useAtomValue } from "jotai"
import { useHydrateAtoms } from "jotai/utils"
import { userProfileFollowersCountAtom } from "~/atoms/userProfile.atoms"
import { UserLayoutInfoTab } from "./tabs/user-layout-info-tab"

type Props = {
  user: UserLimited
}

export const UserLayoutTabs = ({ user }: Props) => {
  useHydrateAtoms([[userProfileFollowersCountAtom, user.followersCount]])

  const followersCount = useAtomValue(userProfileFollowersCountAtom)

  return (
    <Tabs
      classNames={{
        base: "h-fit sm:h-[102px] items-end border-b border-b-content2",
        tabList:
          "p-0 scrollbar-default overflow-x-auto scrollbar-thin scrollbar-track-content2 scrollbar-thumb-content4",
        tab: "",
        panel:
          "p-0 pt-bodyPadding sm:pt-[calc(var(--body-padding)*2)] sm:-ml-[calc(206px+var(--body-padding))]",
        cursor: "",
      }}
      defaultSelectedKey="info"
      color="primary"
      variant="underlined"
      size="lg"
    >
      <Tab key="info" title="Informações">
        <UserLayoutInfoTab user={user} />
      </Tab>
      <Tab key="uploads" title={`Uploads (${user.uploadsCount})`} />
      <Tab key="followers" title={`Seguidores (${followersCount})`} />
      <Tab
        key="following"
        title={`Seguindo (${user.followingCount})`}
        isDisabled={!user.settings.showFollowing}
      />
      <Tab key="stats" title="Estatísticas" isDisabled />
    </Tabs>
  )
}
