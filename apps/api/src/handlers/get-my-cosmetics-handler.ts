import {
  ACHIEVEMENT_METRICS,
  COSMETIC_RARITIES,
  isCosmeticUnlocked,
  NAME_EFFECT_KEYS,
  NAME_EFFECTS,
  USER_TITLE_KEYS,
  USER_TITLES,
} from "@taiyomoe/db/cosmetics"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getCosmeticProgress } from "../utils/cosmetic-progress"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const unlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("free") }),
  z.object({ type: z.literal("role"), roles: z.string().array() }),
  z.object({
    type: z.literal("achievement"),
    metric: z.enum(ACHIEVEMENT_METRICS),
    threshold: z.number().int(),
  }),
  z.object({ type: z.literal("shop"), price: z.number().int() }),
])
const itemSchema = <T extends readonly [string, ...string[]]>(keys: T) =>
  z.object({
    key: z.enum(keys),
    rarity: z.enum(COSMETIC_RARITIES),
    unlock: unlockSchema,
    unlocked: z.boolean(),
  })
const cosmeticsSchema = z.object({
  nameEffect: z.enum(NAME_EFFECT_KEYS).nullable(),
  title: z.enum(USER_TITLE_KEYS).nullable(),
  progress: z.record(z.enum(ACHIEVEMENT_METRICS), z.number().int()),
  nameEffects: itemSchema(NAME_EFFECT_KEYS).array(),
  titles: itemSchema(USER_TITLE_KEYS).array(),
})

export const getMyCosmeticsHandler = new Hono().get(
  "/me/cosmetics",
  describeRoute({
    summary: "List my cosmetics",
    description:
      "Lists every name effect and profile title, whether you unlocked it and how it unlocks, along with what you have equipped and your progress towards achievement unlocks.\n\n**Authentication:** signed-in user.",
    tags: ["Profile"],
    responses: {
      200: {
        description: "Your cosmetics.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(cosmeticsSchema)) } },
      },
      ...getOpenApiResponses({}),
    },
  }),
  withAuth(),
  async (c) => {
    const { db, user, actor } = c.var
    const [progress, owned, profile] = await Promise.all([
      getCosmeticProgress(db, user.id),
      db
        .selectFrom("userCosmetics")
        .select(["kind", "key"])
        .where("userId", "=", user.id)
        .execute(),
      db
        .selectFrom("users")
        .leftJoin("userProfiles", "userProfiles.userId", "users.id")
        .select(["users.nameEffect", "userProfiles.title"])
        .where("users.id", "=", user.id)
        .executeTakeFirstOrThrow(),
    ])
    const ownedKeys = new Set(owned.map((row) => `${row.kind}:${row.key}`))
    const describe = <K extends string>(
      kind: "NAME_EFFECT" | "TITLE",
      key: K,
      definition: (typeof NAME_EFFECTS)[keyof typeof NAME_EFFECTS],
    ) => ({
      key,
      rarity: definition.rarity,
      unlock: definition.unlock,
      unlocked: isCosmeticUnlocked(definition.unlock, {
        role: actor.role,
        owned: ownedKeys.has(`${kind}:${key}`),
        progress,
      }),
    })

    return c.ok({
      nameEffect: NAME_EFFECT_KEYS.find((key) => key === profile.nameEffect) ?? null,
      title: USER_TITLE_KEYS.find((key) => key === profile.title) ?? null,
      progress,
      nameEffects: NAME_EFFECT_KEYS.map((key) => describe("NAME_EFFECT", key, NAME_EFFECTS[key])),
      titles: USER_TITLE_KEYS.map((key) => describe("TITLE", key, USER_TITLES[key])),
    })
  },
)
