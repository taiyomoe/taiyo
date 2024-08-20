import type { User } from "@taiyomoe/db"
import { UserLayoutAvatar } from "./user-layout-avatar"
import { UserLayoutBanner } from "./user-layout-banner"
import { UserLayoutFollow } from "./user-layout-follow"
import { UserLayoutTabs } from "./user-layout-tabs"
import { UserLayoutUsername } from "./user-layout-username"

type Props = {
  user: User
}

export const UserLayout = ({ user }: Props) => {
  return (
    <main className="h-full">
      <UserLayoutBanner user={user} />
      <div className="-mt-[61px] sm:-mt-[101px] relative z-10 flex flex-col items-center gap-bodyPadding p-bodyPadding pt-0 sm:flex-row sm:items-start">
        <UserLayoutAvatar user={user} />
        <div className="flex w-full max-w-full flex-col gap-0.5 sm:max-w-[calc(100vw-206px-(var(--body-padding)*3))]">
          <div className="flex h-auto w-full flex-col items-center justify-between gap-bodyPadding sm:h-[102px] sm:flex-row">
            <UserLayoutUsername user={user} />
            <UserLayoutFollow user={user} />
          </div>
          <UserLayoutTabs user={user} />
        </div>
      </div>
    </main>
  )
}
