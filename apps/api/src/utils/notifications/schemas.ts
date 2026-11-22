import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_KEYS,
  COMMENT_TARGET_TYPES,
  COSMETIC_RARITIES,
  LIST_MODERATION_ACTIONS,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_NAMES,
  type NotificationPayload,
  PROFILE_MODERATION_FIELDS,
} from "@taiyomoe/db"
import z from "zod"
import { storedLanguageSchema, userSummarySchema } from "../schemas"

export const LATEST_ACTORS = 3

const notificationBaseSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the notification." }),
  lastEventAt: z.iso.datetime().meta({
    description: "When the latest event behind the notification happened.",
  }),
  readAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When you read the notification, if any." }),
})
const commentTargetSchema = z
  .object({
    type: z
      .enum(COMMENT_TARGET_TYPES)
      .meta({ description: "The kind of page the thread is on.", example: "CHAPTER" }),
    id: z.uuid().meta({ description: "The ID of the media, chapter, group or user." }),
    username: z.string().nullable().meta({
      description: "The username of the profile owner when the thread is on a profile, if any.",
      example: "kaito",
    }),
    title: z.string().nullable().meta({
      description:
        "What the thread is about: the main title of the media, the name of the group or the display name of the profile owner, if any.",
      example: "Solo Leveling",
    }),
    chapterNumber: z.number().nullable().meta({
      description: "The number of the chapter when the thread is on a chapter, if any.",
      example: 112,
    }),
  })
  .meta({ description: "What the comment thread is about." })
const deletedSchema = (subject: string) =>
  z.boolean().meta({ description: `Whether the ${subject} was deleted since.` })
const reportBaseSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the report." }),
  outcome: z.enum(["RESOLVED", "DISMISSED"]).meta({
    description:
      "How the moderation team closed the report: `RESOLVED` when they acted on it, `DISMISSED` when they found nothing wrong.",
    example: "RESOLVED",
  }),
  points: z.int().nonnegative().meta({
    description:
      "The number of points the report earned you: some when the moderation team acted on it, none when they dismissed it.",
    example: 10,
  }),
})
const reportSchema = z
  .discriminatedUnion("kind", [
    reportBaseSchema.extend({
      kind: z.literal("PAGE").meta({ description: "What you reported: a page of a chapter." }),
      chapter: z
        .object({
          id: z.uuid().meta({ description: "The ID of the chapter." }),
          number: z.number().meta({ description: "The number of the chapter.", example: 112 }),
          title: z
            .string()
            .nullable()
            .meta({ description: "The title of the chapter, if any.", example: "Arise" }),
          mediaId: z.uuid().meta({ description: "The ID of the media the chapter belongs to." }),
          mediaTitle: z.string().nullable().meta({
            description: "The main title of the media, if any.",
            example: "Solo Leveling",
          }),
          deleted: deletedSchema("chapter or its media"),
        })
        .nullable()
        .meta({ description: "The chapter of the reported page, if it still exists." }),
    }),
    reportBaseSchema.extend({
      kind: z.literal("COMMENT").meta({ description: "What you reported: a comment." }),
      comment: z
        .object({
          id: z.uuid().meta({ description: "The ID of the comment." }),
          excerpt: z.string().nullable().meta({
            description:
              "The start of the comment's text, without its images, if the comment is still up.",
          }),
          deleted: z.boolean().meta({ description: "Whether the comment was removed since." }),
          target: commentTargetSchema.nullable(),
        })
        .nullable()
        .meta({ description: "The reported comment, if it still exists." }),
    }),
    reportBaseSchema.extend({
      kind: z.literal("GROUP").meta({ description: "What you reported: a group." }),
      group: z
        .object({
          id: z.uuid().meta({ description: "The ID of the group." }),
          name: z.string().meta({ description: "The name of the group.", example: "Sunray Scans" }),
          deleted: deletedSchema("group"),
        })
        .nullable()
        .meta({ description: "The reported group, if it still exists." }),
    }),
    reportBaseSchema.extend({
      kind: z.literal("USER").meta({ description: "What you reported: a user's profile." }),
      user: z
        .object({
          id: z.uuid().meta({ description: "The ID of the user." }),
          username: z.string().meta({ description: "The username of the user.", example: "kaito" }),
          displayUsername: z
            .string()
            .meta({ description: "The display name of the user.", example: "Kaito" }),
        })
        .nullable()
        .meta({ description: "The reported user, if they still exist." }),
    }),
  ])
  .meta({ description: "Your report and what it was about." })

export const actorsSchema = z.object({
  count: z.int().positive().meta({
    description:
      "The number of people behind the notification, leaving out those who took it back.",
  }),
  latest: userSummarySchema
    .array()
    .meta({ description: `The ${LATEST_ACTORS} most recent of them, newest first.` }),
})

export const notificationSchema = z.discriminatedUnion("type", [
  notificationBaseSchema.extend({
    type: z.literal("CHAPTER_PUBLISHED").meta({ description: "The kind of notification." }),
    chapter: z
      .object({
        id: z.uuid().meta({ description: "The ID of the chapter." }),
        title: z
          .string()
          .nullable()
          .meta({ description: "The title of the chapter, if any.", example: "Arise" }),
        number: z.number().meta({ description: "The number of the chapter.", example: 112 }),
        volume: z
          .string()
          .nullable()
          .meta({ description: "The volume of the chapter, if any.", example: "12" }),
        language: storedLanguageSchema("The language of the chapter."),
        mediaId: z.uuid().meta({ description: "The ID of the media the chapter belongs to." }),
        mediaTitle: z
          .string()
          .nullable()
          .meta({ description: "The main title of the media, if any.", example: "Solo Leveling" }),
        mediaCoverUrl: z
          .url()
          .nullable()
          .meta({ description: "The URL of the main cover of the media, if any." }),
        groups: z
          .object({
            id: z.uuid().meta({ description: "The ID of the group." }),
            name: z
              .string()
              .meta({ description: "The name of the group.", example: "Sunray Scans" }),
          })
          .array()
          .meta({ description: "The groups credited on the chapter, alphabetically by name." }),
      })
      .meta({ description: "The chapter that came out." }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("COMMENT_REPLY").meta({ description: "The kind of notification." }),
    comment: z
      .object({
        id: z.uuid().meta({ description: "The ID of the reply." }),
        rootId: z.uuid().meta({ description: "The ID of the comment that opens the thread." }),
        excerpt: z
          .string()
          .meta({ description: "The start of the reply's text, without its images." }),
        viewerVoted: z.boolean().meta({ description: "Whether you upvoted the reply." }),
        target: commentTargetSchema,
        author: userSummarySchema.meta({ description: "The user who replied." }),
      })
      .meta({ description: "The reply to your comment." }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("COMMENT_LIKE").meta({ description: "The kind of notification." }),
    comment: z
      .object({
        id: z.uuid().meta({ description: "The ID of your comment." }),
        excerpt: z
          .string()
          .meta({ description: "The start of your comment's text, without its images." }),
        target: commentTargetSchema,
      })
      .meta({ description: "Your upvoted comment." }),
    upvoteCount: z.int().positive().meta({
      description:
        "The number of people who upvoted your comment since the notification opened, leaving out those who took it back. Upvotes stay anonymous.",
    }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("FOLLOW").meta({ description: "The kind of notification." }),
    actors: actorsSchema.meta({ description: "Who started following you." }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("RANKING_REWARD").meta({ description: "The kind of notification." }),
    ranking: z
      .object({
        period: z
          .enum(["WEEK", "MONTH"])
          .meta({ description: "The kind of period that closed.", example: "WEEK" }),
        startsAt: z.iso.datetime().meta({ description: "When the period started, in UTC." }),
        endsAt: z.iso.datetime().meta({ description: "When the period ended, in UTC." }),
        rank: z.int().positive().meta({ description: "Your final rank.", example: 2 }),
        chapters: z.int().positive().meta({
          description: "The number of chapters you read and got credit for in the period.",
          example: 87,
        }),
        points: z.int().positive().meta({
          description: "The number of points added to your balance.",
          example: 150,
        }),
      })
      .meta({ description: "Your result in the readers ranking of a period that closed." }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("ACHIEVEMENT_EARNED").meta({ description: "The kind of notification." }),
    achievement: z
      .object({
        key: z
          .enum(ACHIEVEMENT_KEYS)
          .meta({ description: "The key of the achievement.", example: "weeklyChampion" }),
        category: z
          .enum(ACHIEVEMENT_CATEGORIES)
          .meta({ description: "The category of the achievement.", example: "ranking" }),
        rarity: z
          .enum(COSMETIC_RARITIES)
          .meta({ description: "The rarity of the achievement.", example: "epic" }),
        points: z.int().nonnegative().meta({
          description: "The number of points the achievement added to your balance.",
          example: 0,
        }),
      })
      .meta({ description: "The achievement you earned." }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("LIST_MODERATED").meta({ description: "The kind of notification." }),
    action: z.enum(LIST_MODERATION_ACTIONS).meta({
      description: "What the moderation team did to your list: `UPDATED` or `DELETED`.",
      example: "UPDATED",
    }),
    list: z
      .object({
        id: z.uuid().meta({ description: "The ID of the list." }),
        name: z.string().meta({ description: "The name of the list.", example: "Best shounen" }),
        deleted: deletedSchema("list"),
      })
      .meta({ description: "Your list." }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("PROFILE_MODERATED").meta({ description: "The kind of notification." }),
    fields: z
      .enum(PROFILE_MODERATION_FIELDS)
      .meta({
        description:
          "A part of your profile: `displayUsername`, `about`, `city`, `avatar` or `banner`.",
        example: "avatar",
      })
      .array()
      .meta({
        description: "The parts of your profile the moderation team changed.",
        examples: [["displayUsername", "about"], ["avatar"]],
      }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("REPORT_REVIEWED").meta({ description: "The kind of notification." }),
    report: reportSchema,
  }),
])

export const notificationFiltersSchema = z.object({
  category: z.enum(NOTIFICATION_CATEGORY_NAMES).optional().meta({
    description:
      "Only list this kind: new chapters, replies to your comments, activity (upvotes and follows), rewards (ranking rewards and achievements), or moderation (changes the moderation team made to your lists or profile, and the outcome of your reports).",
    example: "chapters",
  }),
  unread: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
    .meta({
      description: "Whether to only list the notifications you have not read.",
      example: "true",
    }),
  q: z.string().trim().max(100).optional().meta({
    description:
      "Only list the notifications whose media titles, chapter titles, groups, repliers, followers, comment text, list names or reported users contain this text.",
    example: "solo",
  }),
})

export type NotificationFilters = z.infer<typeof notificationFiltersSchema>

const MODERATION_TYPES = NOTIFICATION_CATEGORIES.moderation
const storedReportSchema = z.object({
  reportId: z.guid(),
  outcome: z.enum(["RESOLVED", "DISMISSED"]),
  points: z.int().nonnegative().optional(),
})

/** What each moderation notification stores, checked again when it is read. */
export const moderationPayloadSchemas = {
  LIST_MODERATED: z.object({ listId: z.guid(), action: z.enum(LIST_MODERATION_ACTIONS) }),
  PROFILE_MODERATED: z.object({ fields: z.enum(PROFILE_MODERATION_FIELDS).array().min(1) }),
  REPORT_REVIEWED: z.discriminatedUnion("kind", [
    storedReportSchema.extend({ kind: z.literal("PAGE"), chapterId: z.guid() }),
    storedReportSchema.extend({ kind: z.literal("COMMENT"), commentId: z.guid() }),
    storedReportSchema.extend({ kind: z.literal("GROUP"), groupId: z.guid() }),
    storedReportSchema.extend({ kind: z.literal("USER"), userId: z.guid() }),
  ]),
} satisfies Record<(typeof MODERATION_TYPES)[number], z.ZodType<NotificationPayload>>
