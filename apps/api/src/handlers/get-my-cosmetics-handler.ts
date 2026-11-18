import { ACHIEVEMENT_METRICS } from "@taiyomoe/db/achievements"
import {
  AVATAR_BORDER_KEYS,
  AVATAR_BORDERS,
  COSMETIC_RARITIES,
  type CosmeticDefinition,
  type CosmeticKind,
  isCosmeticUnlocked,
  NAME_EFFECT_KEYS,
  NAME_EFFECTS,
  USER_TITLE_KEYS,
  USER_TITLES,
} from "@taiyomoe/db/cosmetics"
import { getAchievementProgress } from "@taiyomoe/queue"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getHeldAchievements } from "../utils/achievements"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"
import { cosmeticUnlockSchema as unlockSchema } from "../utils/shop"

const itemSchema = <T extends readonly [string, ...string[]]>(keys: T) =>
  z.object({
    key: z.enum(keys).meta({ description: "The key of the cosmetic.", example: keys[0] }),
    rarity: z
      .enum(COSMETIC_RARITIES)
      .meta({ description: "The rarity of the cosmetic.", example: "rare" }),
    unlock: unlockSchema.meta({ description: "How the cosmetic unlocks." }),
    unlocked: z.boolean().meta({ description: "Whether you unlocked the cosmetic." }),
  })
const cosmeticsSchema = z.object({
  nameEffect: z
    .enum(NAME_EFFECT_KEYS)
    .nullable()
    .meta({ description: "The name effect you have equipped, if any." }),
  title: z
    .enum(USER_TITLE_KEYS)
    .nullable()
    .meta({ description: "The profile title you have equipped, if any." }),
  avatarBorder: z
    .enum(AVATAR_BORDER_KEYS)
    .nullable()
    .meta({ description: "The avatar border you have equipped, if any." }),
  progress: z
    .record(z.enum(ACHIEVEMENT_METRICS), z.int())
    .meta({ description: "Your current value for each achievement metric." }),
  nameEffects: itemSchema(NAME_EFFECT_KEYS).array().meta({ description: "Every name effect." }),
  titles: itemSchema(USER_TITLE_KEYS).array().meta({ description: "Every profile title." }),
  avatarBorders: itemSchema(AVATAR_BORDER_KEYS)
    .array()
    .meta({ description: "Every avatar border." }),
})

export const getMyCosmeticsHandler = new Hono().get(
  "/me/cosmetics",
  describeRoute({
    summary: "Get my cosmetics",
    description:
      "Returns every name effect, profile title and avatar border, whether you unlocked each one and how it unlocks, along with what you have equipped and your progress towards the achievements that unlock some of them.\n\n**Authentication:** signed-in user.",
    tags: ["Profile"],
    responses: {
      200: {
        description: "Your cosmetics.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(cosmeticsSchema)) } },
      },
      ...getOpenApiResponses({ 401: true, 403: true }),
    },
  }),
  withAuth(),
  async (c) => {
    const { db, user, actor } = c.var
    const [progress, achievements, owned, profile] = await Promise.all([
      getAchievementProgress(db, user.id),
      getHeldAchievements(db, user.id),
      db
        .selectFrom("userCosmetics")
        .select(["kind", "key"])
        .where("userId", "=", user.id)
        .execute(),
      db
        .selectFrom("users")
        .leftJoin("userProfiles", "userProfiles.userId", "users.id")
        .select(["users.nameEffect", "users.avatarBorder", "userProfiles.title"])
        .where("users.id", "=", user.id)
        .executeTakeFirstOrThrow(),
    ])
    const ownedKeys = new Set(owned.map((row) => `${row.kind}:${row.key}`))
    const describe = <K extends string>(
      kind: CosmeticKind,
      key: K,
      definition: CosmeticDefinition,
    ) => ({
      key,
      rarity: definition.rarity,
      unlock: definition.unlock,
      unlocked: isCosmeticUnlocked(definition.unlock, {
        role: actor.role,
        owned: ownedKeys.has(`${kind}:${key}`),
        achievements,
      }),
    })

    return c.ok({
      nameEffect: NAME_EFFECT_KEYS.find((key) => key === profile.nameEffect) ?? null,
      title: USER_TITLE_KEYS.find((key) => key === profile.title) ?? null,
      avatarBorder: AVATAR_BORDER_KEYS.find((key) => key === profile.avatarBorder) ?? null,
      progress,
      nameEffects: NAME_EFFECT_KEYS.map((key) => describe("NAME_EFFECT", key, NAME_EFFECTS[key])),
      titles: USER_TITLE_KEYS.map((key) => describe("TITLE", key, USER_TITLES[key])),
      avatarBorders: AVATAR_BORDER_KEYS.map((key) =>
        describe("AVATAR_BORDER", key, AVATAR_BORDERS[key]),
      ),
    })
  },
)
