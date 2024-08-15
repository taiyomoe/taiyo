import type { Languages } from "@taiyomoe/db"
import type {
  FeaturedMedia,
  LatestMedia,
  RawLatestRelease,
  RawLatestReleaseGrouped,
} from "@taiyomoe/types"
import DF from "ioredis"
import SuperJSON from "superjson"
import { env } from "../env"
import { parseCache } from "./utils"

const HOUR = 60 * 60
const DAY = 60 * 60 * 24
const client = new DF(env.DRAGONFLY_URL)

export const rawCacheClient = client

export const cacheClient = {
  medias: {
    latest: {
      get: () => parseCache<LatestMedia[]>(client.get("medias:latest")),
      set: (input: LatestMedia[]) =>
        client.setex("medias:latest", HOUR, SuperJSON.stringify(input)),
    },
    featured: (lang: Languages) => ({
      get: () =>
        parseCache<FeaturedMedia[]>(client.get(`medias:featured:${lang}`)),
      set: (input: FeaturedMedia[]) =>
        client.setex(
          `medias:featured:${lang}`,
          DAY,
          SuperJSON.stringify(input),
        ),
    }),
  },
  chapters: {
    latest: {
      get: () => parseCache<RawLatestRelease[]>(client.get("chapters:latest")),
      set: (input: RawLatestRelease[]) =>
        client.setex("chapters:latest", DAY, SuperJSON.stringify(input)),
    },
    latestGrouped: {
      get: () =>
        parseCache<RawLatestReleaseGrouped[]>(
          client.get("chapters:latest:grouped"),
        ),
      set: (input: RawLatestReleaseGrouped[]) =>
        client.setex(
          "chapters:latest:grouped",
          DAY,
          SuperJSON.stringify(input),
        ),
    },
  },
}
