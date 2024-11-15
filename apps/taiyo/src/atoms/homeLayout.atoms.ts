import { atom } from "jotai"
import type { SiteConfig } from "~/lib/config"

export const releasesLayoutAtom = atom<SiteConfig["home"]["releasesLayout"]>()
