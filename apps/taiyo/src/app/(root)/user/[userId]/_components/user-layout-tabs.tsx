"use client"

import type { Selection } from "@nextui-org/react"
import { Tab, Tabs } from "@nextui-org/tabs"
import type { User } from "@taiyomoe/db"
import { useState } from "react"

type Props = {
  user: User
}

export const UserLayoutTabs = ({ user }: Props) => {
  const [selectedKey, setSelectedKey] = useState<Selection>(new Set(["info"]))

  return (
    <Tabs
      classNames={{
        // base: "z-10 rounded-small",
        // tabList: "p-0 rounded-b-none",
        // tab: "rounded-small",
        // cursor: "rounded-small rounded-b-none",
        base: "",
        tabList: "!bg-content1 p-0 rounded-small rounded-b-none",
        tab: "",
        cursor: "rounded-b-none",
      }}
      defaultSelectedKey="info"
      color="primary"
      variant="light"
    >
      <Tab key="info">Infooo</Tab>
      <Tab key="followers">Followers</Tab>
      <Tab key="following">Following</Tab>
      <Tab key="stats">Estatisticas</Tab>
    </Tabs>
  )
}
