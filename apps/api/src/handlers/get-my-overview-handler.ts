import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { hasContent } from "../utils/chapter-release"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const countsSchema = z.object({
  pending: z.int().meta({ description: "The number still waiting for review.", example: 2 }),
  accepted: z.int().meta({ description: "The number accepted.", example: 14 }),
  rejected: z.int().meta({ description: "The number rejected.", example: 1 }),
})
const queueCount = (description: string) => z.int().nullable().meta({ description, example: 5 })
const overviewSchema = z.object({
  chapters: countsSchema.meta({ description: "Your chapters sent for review." }),
  suggestions: countsSchema.meta({ description: "Your media suggestions." }),
  groups: z.int().meta({ description: "The number of groups you belong to.", example: 2 }),
  invitations: z
    .int()
    .meta({ description: "The number of pending group invitations you received.", example: 1 }),
  queues: z
    .object({
      chapters: queueCount(
        "The number of chapters waiting for review, or null when you cannot review chapters.",
      ),
      suggestions: queueCount(
        "The number of media suggestions waiting for review, or null when you cannot review them.",
      ),
      groupRequests: queueCount(
        "The number of group ownership and creation requests waiting for review, or null when you cannot review both kinds.",
      ),
    })
    .meta({ description: "The number of items waiting in each review queue." }),
})
const count = (row: { count: string } | undefined) => Number(row?.count ?? 0)

export const getMyOverviewHandler = new Hono().get(
  "/me/overview",
  describeRoute({
    summary: "Get my dashboard overview",
    description:
      "Returns your chapters sent for review and your media suggestions counted by outcome, the number of groups you belong to and of your pending invitations, and the size of each review queue you can work on. A chapter counts as accepted once approved, even while it waits for its scheduled release.\n\n**Authentication:** signed-in user.",
    tags: ["Users"],
    responses: {
      200: {
        description: "The overview.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(overviewSchema)) },
        },
      },
      ...getOpenApiResponses({ 401: true, 403: true }),
    },
  }),
  withAuth(),
  async (c) => {
    const { can, db, user } = c.var
    const pending = sql<string>`count(*) filter (where "status" = 'PENDING')`.as("pending")
    const rejected = sql<string>`count(*) filter (where "status" = 'REJECTED')`.as("rejected")
    const total = sql<string>`count(*)`.as("count")
    const [
      chapters,
      suggestions,
      groups,
      invitations,
      chapterQueue,
      suggestionQueue,
      ownershipQueue,
      creationQueue,
    ] = await Promise.all([
      db
        .selectFrom("chapters")
        .select([
          pending,
          rejected,
          sql<string>`count(*) filter (where "status" in ('PUBLISHED', 'SCHEDULED') and "reviewerId" is not null)`.as(
            "accepted",
          ),
        ])
        .where("uploaderId", "=", user.id)
        .where("deletedAt", "is", null)
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("mediaSuggestions")
        .select([
          pending,
          rejected,
          sql<string>`count(*) filter (where "status" = 'ACCEPTED')`.as("accepted"),
        ])
        .where("authorId", "=", user.id)
        .executeTakeFirstOrThrow(),
      db
        .selectFrom("groupMemberships")
        .innerJoin("groups", "groups.id", "groupMemberships.groupId")
        .select(total)
        .where("groupMemberships.userId", "=", user.id)
        .where("groups.deletedAt", "is", null)
        .executeTakeFirst(),
      db
        .selectFrom("groupInvitations")
        .select(total)
        .where("inviteeId", "=", user.id)
        .where("status", "=", "PENDING")
        .where("expiresAt", ">", sql<Date>`CURRENT_TIMESTAMP`)
        .executeTakeFirst(),
      can("chapter.review")
        ? db
            .selectFrom("chapters")
            .innerJoin("medias", "medias.id", "chapters.mediaId")
            .select(total)
            .where("chapters.status", "=", "PENDING")
            .where(hasContent)
            .where("chapters.deletedAt", "is", null)
            .where("medias.deletedAt", "is", null)
            .executeTakeFirst()
        : null,
      can("mediaSuggestion.review")
        ? db
            .selectFrom("mediaSuggestions")
            .innerJoin("medias", "medias.id", "mediaSuggestions.mediaId")
            .select(total)
            .where("mediaSuggestions.status", "=", "PENDING")
            .where("medias.deletedAt", "is", null)
            .executeTakeFirst()
        : null,
      can("ownershipRequest.review")
        ? db
            .selectFrom("groupOwnershipRequests")
            .select(total)
            .where("status", "=", "PENDING")
            .executeTakeFirst()
        : null,
      can("groupCreationRequest.review")
        ? db
            .selectFrom("groupCreationRequests")
            .select(total)
            .where("status", "=", "PENDING")
            .executeTakeFirst()
        : null,
    ])
    const tally = (row: { pending: string; accepted: string; rejected: string }) => ({
      pending: Number(row.pending),
      accepted: Number(row.accepted),
      rejected: Number(row.rejected),
    })

    return c.ok({
      chapters: tally(chapters),
      suggestions: tally(suggestions),
      groups: count(groups),
      invitations: count(invitations),
      queues: {
        chapters: chapterQueue === null ? null : count(chapterQueue),
        suggestions: suggestionQueue === null ? null : count(suggestionQueue),
        groupRequests:
          ownershipQueue === null || creationQueue === null
            ? null
            : count(ownershipQueue) + count(creationQueue),
      },
    })
  },
)
