import type { Languages } from "@taiyomoe/db"
import type {
  CreateMediaMessageInput,
  FeaturedMedia,
  LatestMedia,
  LatestReleaseGroupedLite,
  RawLatestRelease,
  UploadChapterMessageInput,
  UploadCoverMessageInput,
  UserSettings,
} from "@taiyomoe/types"
import DF from "ioredis"
import SuperJSON from "superjson"
import { env } from "./env"
import { parseCache } from "./utils"

const HOUR = 60 * 60
const DAY = 60 * 60 * 24
const client = new DF(env.DRAGONFLY_URL)

export const rawCacheClient = client

export const cacheClient = {
  medias: {
    /**
     * Mutations
     */
    create: {
      set: (input: Omit<CreateMediaMessageInput, "taskId">) =>
        client.setex(
          `medias:create:${input.id}`,
          HOUR,
          SuperJSON.stringify(input),
        ),
      get: (id: string) =>
        parseCache<Omit<CreateMediaMessageInput, "taskId">>(
          client.get(`medias:create:${id}`),
        ),
    },
    /**
     * Queries
     */
    latest: {
      set: (input: LatestMedia[]) =>
        client.setex("medias:latest", HOUR, SuperJSON.stringify(input)),
      get: () => parseCache<LatestMedia[]>(client.get("medias:latest")),
      invalidate: () => client.del("medias:latest"),
    },
    featured: (lang: Languages | "main") => ({
      set: (input: FeaturedMedia[]) =>
        client.setex(
          `medias:featured:${lang}`,
          DAY,
          SuperJSON.stringify(input),
        ),
      get: () =>
        parseCache<FeaturedMedia[]>(client.get(`medias:featured:${lang}`)),
      invalidate: () => client.del(`medias:featured:${lang}`),
    }),
    invalidateAll: async () => {
      const featuredMediasKeys = await client.keys("medias:featured:*")

      for (const key of featuredMediasKeys) {
        await client.del(key)
      }

      await client.del("medias:latest")
      await client.del("chapters:latest")
      await client.del("chapters:latest:grouped")
    },
  },

  covers: {
    /**
     * Mutations
     */
    upload: {
      set: (input: Omit<UploadCoverMessageInput, "taskId">) =>
        client.setex(
          `covers:upload:${input.id}`,
          HOUR,
          SuperJSON.stringify(input),
        ),
      get: (id: string) =>
        parseCache<Omit<UploadCoverMessageInput, "taskId">>(
          client.get(`covers:upload:${id}`),
        ),
    },
  },

  chapters: {
    /**
     * Mutations
     */
    uploads: {
      set: (input: Omit<UploadChapterMessageInput, "taskId">) =>
        client.setex(
          `chapters:uploads:${input.id}`,
          HOUR,
          SuperJSON.stringify(input),
        ),
      get: (id: string) =>
        parseCache<Omit<UploadChapterMessageInput, "taskId">>(
          client.get(`chapters:uploads:${id}`),
        ),
    },
    /**
     * Queries
     */
    latest: {
      set: (input: RawLatestRelease[]) =>
        client.setex("chapters:latest", DAY, SuperJSON.stringify(input)),
      get: () => parseCache<RawLatestRelease[]>(client.get("chapters:latest")),
    },
    latestGroupedLite: {
      set: (input: LatestReleaseGroupedLite[]) =>
        client.setex(
          "chapters:latest:grouped-lite",
          DAY,
          SuperJSON.stringify(input),
        ),
      get: () =>
        parseCache<LatestReleaseGroupedLite[]>(
          client.get("chapters:latest:grouped-lite"),
        ),
    },
    invalidateAll: async () => {
      await client.del("chapters:latest")
      await client.del("chapters:latest:grouped-lite")
    },
  },

  users: {
    /**
     * Queries
     */
    auth: {
      set: (id: string, value: string, ttl = 60) =>
        client.setex(`users:auth:${id}`, ttl, value),
      get: (id: string) => client.get(`users:auth:${id}`),
      invalidate: (id: string) =>
        client.del(`users:auth:${id}`).then(() => null),
    },
    settings: {
      set: (id: string, value: UserSettings) =>
        client.setex(`users:settings:${id}`, DAY, SuperJSON.stringify(value)),
      get: (id: string) =>
        parseCache<UserSettings>(client.get(`users:settings:${id}`)),
    },
  },
  clear: () => client.flushdb(),
}
