"use client"

import { Tab, Tabs } from "@nextui-org/tabs"
import type { UserLimited } from "@taiyomoe/types"
import { useAtom } from "jotai"
import { useHydrateAtoms } from "jotai/utils"
import { useEffect } from "react"
import { userProfileFollowersCountAtom } from "~/atoms/userProfile.atoms"
import { useUserNavigation } from "~/hooks/useUserNavigation"
import { UserLayoutFollowsTab } from "./tabs/follows/user-layout-follows-tab"
import { UserLayoutUploadsTab } from "./tabs/uploads/user-layout-uploads.tab"
import { UserLayoutInfoTab } from "./tabs/user-layout-info-tab"

type Props = {
  user: UserLimited
}

export const UserLayoutTabs = ({ user }: Props) => {
  useHydrateAtoms([[userProfileFollowersCountAtom, user.followersCount]])

  const { tab, handleTabChange } = useUserNavigation()
  const [followersCount, setFollowersCount] = useAtom(
    userProfileFollowersCountAtom,
  )

  useEffect(() => {
    setFollowersCount(user.followersCount)
  }, [user.followersCount, setFollowersCount])

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
      selectedKey={tab}
      onSelectionChange={handleTabChange}
      color="primary"
      variant="underlined"
      size="lg"
    >
      <Tab key="info" title="Informações">
        <UserLayoutInfoTab user={user} />
      </Tab>
      {user.uploadsCount > 0 && (
        <Tab key="uploads" title={`Uploads (${user.uploadsCount})`}>
          <UserLayoutUploadsTab user={user} />
        </Tab>
      )}
      <Tab key="followers" title={`Seguidores (${followersCount})`}>
        <UserLayoutFollowsTab user={user} type="followers" />
      </Tab>
      <Tab
        key="following"
        title={`Seguindo (${user.followingCount})`}
        isDisabled={!user.settings.showFollowing}
      >
        <UserLayoutFollowsTab user={user} type="following" />
      </Tab>
      <Tab key="stats" title="Estatísticas" isDisabled />
    </Tabs>
  )
}
