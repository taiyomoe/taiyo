"use client"

import { Tab, Tabs } from "@nextui-org/tabs"
import type { UserLimited } from "@taiyomoe/types"

type Props = {
  user: UserLimited
}

export const UserLayoutTabs = ({ user }: Props) => {
  return (
    <Tabs
      classNames={{
        base: "h-fit sm:h-[102px] items-end border-b border-b-content2",
        tabList:
          "p-0 scrollbar-default overflow-x-auto scrollbar-thin scrollbar-track-content2 scrollbar-thumb-content4",
        tab: "",
        panel:
          "p-0 pt-bodyPadding -ml-[calc(126px+var(--body-padding))] sm:-ml-[calc(206px+var(--body-padding))]",
        cursor: "",
      }}
      defaultSelectedKey="info"
      color="primary"
      variant="underlined"
      size="lg"
    >
      <Tab key="info" title="Informações" />
      <Tab key="uploads" title={`Uploads (${user.uploadsCount})`} />
      <Tab key="followers" title={`Seguidores (${user.followersCount})`} />
      <Tab
        key="following"
        title={`Seguindo (${user.followingCount})`}
        isDisabled={!user.settings.showFollowing}
      />
      <Tab key="stats" title="Estatísticas" isDisabled />
    </Tabs>
  )
}
