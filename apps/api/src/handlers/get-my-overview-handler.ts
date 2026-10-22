import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { hasContent } from "../utils/chapter-release"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const countsSchema = z.object({
  pending: z.int(),
  accepted: z.int(),
  rejected: z.int(),
})
const overviewSchema = z.object({
  chapters: countsSchema.meta({ description: "The user's chapters sent for review." }),
  suggestions: countsSchema.meta({ description: "The user's media suggestions." }),
  groups: z.int().meta({ description: "How many groups the user belongs to." }),
  invitations: z.int().meta({ description: "Pending group invitations for the user." }),
  queues: z
    .object({
      chapters: z.int().nullable(),
      suggestions: z.int().nullable(),
      groupRequests: z.int().nullable(),
    })
    .meta({
      description:
        "How much is waiting in each review queue the user can work on, or null for the queues they can't.",
    }),
})
const count = (row: { count: string } | undefined) => Number(row?.count ?? 0)

export const getMyOverviewHandler = new Hono().get(
  "/me/overview",
  describeRoute({
    summary: "Get my dashboard overview",
    description:
      "Counts what the current user has waiting or decided: chapters sent for review, media suggestions, groups and invitations, plus the review queues they can work on.\n\n**Authentication:** signed-in user.",
    tags: ["Users"],
    responses: {
      200: {
        description: "The overview.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(overviewSchema)) },
        },
      },
      ...getOpenApiResponses({}),
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
          sql<string>`count(*) filter (where "status" = 'PUBLISHED' and "reviewerId" is not null)`.as(
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
