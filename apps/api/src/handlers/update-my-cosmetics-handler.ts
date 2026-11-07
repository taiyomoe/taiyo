import { userAudit } from "@taiyomoe/audit"
import {
  type CosmeticKind,
  isCosmeticUnlocked,
  NAME_EFFECT_KEYS,
  NAME_EFFECTS,
  USER_TITLE_KEYS,
  USER_TITLES,
} from "@taiyomoe/db/cosmetics"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import { getCosmeticProgress } from "../utils/cosmetic-progress"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { refreshUserSessions } from "../utils/refresh-sessions"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = z.object({
  nameEffect: z
    .enum(NAME_EFFECT_KEYS)
    .nullable()
    .optional()
    .meta({ description: "The name effect to equip, or null to show your plain name." }),
  title: z
    .enum(USER_TITLE_KEYS)
    .nullable()
    .optional()
    .meta({ description: "The profile title to equip, or null for none." }),
})
const equippedSchema = z.object({
  nameEffect: z.enum(NAME_EFFECT_KEYS).nullable(),
  title: z.enum(USER_TITLE_KEYS).nullable(),
})

export const updateMyCosmeticsHandler = new Hono().patch(
  "/me/cosmetics",
  describeRoute({
    summary: "Equip cosmetics",
    description:
      "Equips a name effect and/or a profile title you have unlocked. A name effect shows wherever your name does.\n\n**Authentication:** signed-in user.",
    tags: ["Profile"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Cosmetics equipped.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(equippedSchema)) } },
      },
      ...getOpenApiResponses({
        403: "You haven't unlocked one of the requested cosmetics.",
        422: "The request data failed validation.",
      }),
    },
  }),
  audited(userAudit.COSMETICS_UPDATE, (c) => ({ id: c.var.user?.id })),
  withAuth(),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { auth, db, user, actor } = c.var
    const { nameEffect, title } = c.var.json
    const requested = [
      ...(nameEffect === undefined || nameEffect === null
        ? []
        : [
            { kind: "NAME_EFFECT" as CosmeticKind, key: nameEffect, def: NAME_EFFECTS[nameEffect] },
          ]),
      ...(title === undefined || title === null
        ? []
        : [{ kind: "TITLE" as CosmeticKind, key: title, def: USER_TITLES[title] }]),
    ]

    if (requested.length > 0) {
      const [progress, owned] = await Promise.all([
        getCosmeticProgress(db, user.id),
        db
          .selectFrom("userCosmetics")
          .select(["kind", "key"])
          .where("userId", "=", user.id)
          .execute(),
      ])
      const locked = requested.find(
        (item) =>
          !isCosmeticUnlocked(item.def.unlock, {
            role: actor.role,
            owned: owned.some((row) => row.kind === item.kind && row.key === item.key),
            progress,
          }),
      )

      if (locked !== undefined) {
        return c.fail("COSMETIC_LOCKED")
      }
    }

    const before = await db
      .selectFrom("users")
      .leftJoin("userProfiles", "userProfiles.userId", "users.id")
      .select(["users.nameEffect", "userProfiles.title"])
      .where("users.id", "=", user.id)
      .executeTakeFirstOrThrow()

    if (nameEffect !== undefined) {
      await db.updateTable("users").set({ nameEffect }).where("id", "=", user.id).execute()
    }

    if (title !== undefined) {
      await db
        .insertInto("userProfiles")
        .values({ userId: user.id, title })
        .onConflict((oc) => oc.column("userId").doUpdateSet({ title }))
        .execute()
    }

    const after = {
      nameEffect: nameEffect === undefined ? before.nameEffect : nameEffect,
      title: title === undefined ? before.title : title,
    }

    c.var.audit.set({
      changes: auditChanges(
        before,
        Object.fromEntries(
          Object.entries({ nameEffect, title }).filter(([, value]) => value !== undefined),
        ),
      ),
    })

    if (nameEffect !== undefined) {
      c.var.afterCommit(() => refreshUserSessions(auth, user.id))
    }

    return c.ok({
      nameEffect: NAME_EFFECT_KEYS.find((key) => key === after.nameEffect) ?? null,
      title: USER_TITLE_KEYS.find((key) => key === after.title) ?? null,
    })
  },
)
