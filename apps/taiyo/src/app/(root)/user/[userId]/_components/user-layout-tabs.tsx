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
        base: "h-[102px] items-end border-b border-b-content3",
        tabList: "p-",
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
      <Tab key="followers" title="Seguidores" />
      <Tab key="following" title="Seguindo" />
      <Tab key="uploads" title="Uploads" />
      <Tab key="stats" title="Estatísticas" isDisabled />
    </Tabs>
  )
}
