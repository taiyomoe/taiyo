import type { UserLimited } from "@taiyomoe/types"
import { UserLayoutAvatar } from "./user-layout-avatar"
import { UserLayoutBanner } from "./user-layout-banner"
import { UserLayoutFollow } from "./user-layout-follow"
import { UserLayoutTabs } from "./user-layout-tabs"
import { UserLayoutUsername } from "./user-layout-username"

type Props = {
  user: UserLimited
}

export const UserLayout = ({ user }: Props) => {
  return (
    <main className="h-full">
      <UserLayoutBanner user={user} />
      <div className="-mt-[61px] sm:-mt-[101px] relative z-10 p-bodyPadding pt-0">
        <div className="mx-auto flex w-full max-w-screen-3xl flex-col items-center gap-bodyPadding sm:flex-row sm:items-start">
          <UserLayoutAvatar user={user} />
          <div className="flex w-full max-w-full flex-col gap-bodyPadding sm:max-w-[calc(100vw-206px-(var(--body-padding)*3))] sm:gap-0.5">
            <div className="flex h-auto w-full flex-col items-center justify-between gap-bodyPadding sm:h-[102px] sm:flex-row">
              <UserLayoutUsername user={user} />
              <UserLayoutFollow user={user} />
            </div>
            <UserLayoutTabs user={user} />
          </div>
        </div>
      </div>
    </main>
  )
}
