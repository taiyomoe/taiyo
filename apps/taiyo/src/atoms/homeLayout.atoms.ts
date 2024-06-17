import { atom } from "jotai"
import { type SiteConfig, siteConfig } from "~/lib/config"

export const releasesLayoutAtom = atom<SiteConfig["home"]["releasesLayout"]>(
  siteConfig.home.releasesLayout,
)
export const displayFollowingReleasesAtom = atom(
  siteConfig.home.displayFollowingReleases,
)
