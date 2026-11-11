import { config } from "@taiyomoe/config"
import {
  COMMENT_DELETIONS,
  COMMENT_TARGET_TYPES,
  type CommentTargetType,
  type DB,
  type Kysely,
  ROLES,
  sql,
} from "@taiyomoe/db"
import { getPublicImageUrl } from "@taiyomoe/s3"
import {
  getCommentImageIds,
  getCommentText,
  isBlankCommentText,
  normalizeCommentContent,
} from "@taiyomoe/schemas/comment-content"
import z from "zod"
import { userSummarySchema } from "./schemas"

export const THREAD_COLUMNS = {
  MEDIA: "mediaId",
  CHAPTER: "chapterId",
  GROUP: "groupId",
  USER: "profileId",
} as const satisfies Record<CommentTargetType, string>

export const COMMENT_SORTS = ["newest", "oldest", "top"] as const

export type CommentSort = (typeof COMMENT_SORTS)[number]

export type CommentTarget = { type: CommentTargetType; id: string }

export type CommentViewer = { id: string; canModerate: boolean } | null

export const commentTargetSchema = z.object({
  targetType: z
    .enum(COMMENT_TARGET_TYPES)
    .meta({ description: "What the comments are on.", example: "MEDIA" }),
  targetId: z.uuid().meta({ description: "The id of the media, chapter, group or user." }),
})

export const resolveCommentTarget = async (db: Kysely<DB>, { type, id }: CommentTarget) => {
  if (type === "MEDIA") {
    const media = await db
      .selectFrom("medias")
      .select("id")
      .where("id", "=", id)
      .where("deletedAt", "is", null)
      .executeTakeFirst()

    return media === undefined ? null : { type, id, ownerId: null }
  }

  if (type === "CHAPTER") {
    const chapter = await db
      .selectFrom("chapters")
      .select("id")
      .where("id", "=", id)
      .where("deletedAt", "is", null)
      .where("status", "=", "PUBLISHED")
      .executeTakeFirst()

    return chapter === undefined ? null : { type, id, ownerId: null }
  }

  if (type === "GROUP") {
    const group = await db
      .selectFrom("groups")
      .select("id")
      .where("id", "=", id)
      .where("deletedAt", "is", null)
      .executeTakeFirst()

    return group === undefined ? null : { type, id, ownerId: null }
  }

  const user = await db
    .selectFrom("users")
    .select("id")
    .where("id", "=", id)
    .where((eb) => eb.or([eb("banned", "is", null), eb("banned", "=", false)]))
    .executeTakeFirst()

  return user === undefined ? null : { type, id, ownerId: user.id }
}

export const findThreadId = async (db: Kysely<DB>, target: CommentTarget) => {
  const thread = await db
    .selectFrom("commentThreads")
    .select("id")
    .where(THREAD_COLUMNS[target.type], "=", target.id)
    .executeTakeFirst()

  return thread?.id ?? null
}

export const ensureThreadId = async (db: Kysely<DB>, target: CommentTarget) => {
  const column = THREAD_COLUMNS[target.type]
  const inserted = await db
    .insertInto("commentThreads")
    .values({ [column]: target.id })
    .onConflict((oc) => oc.column(column).doNothing())
    .returning("id")
    .executeTakeFirst()

  return inserted?.id ?? (await findThreadId(db, target)) ?? ""
}

export const getThreadTarget = async (db: Kysely<DB>, threadId: string) => {
  const thread = await db
    .selectFrom("commentThreads")
    .selectAll()
    .where("id", "=", threadId)
    .executeTakeFirstOrThrow()
  const type = COMMENT_TARGET_TYPES.find((key) => thread[THREAD_COLUMNS[key]] !== null)

  return {
    type: type ?? "MEDIA",
    id: (type === undefined ? null : thread[THREAD_COLUMNS[type]]) ?? "",
  }
}

const bannedSql = (alias: string) =>
  sql<boolean>`(coalesce(${sql.ref(`${alias}.banned`)}, false) and (${sql.ref(`${alias}.banExpires`)} is null or ${sql.ref(`${alias}.banExpires`)} > (CURRENT_TIMESTAMP at time zone 'UTC')))`

export const liveCommentSql = (comment: string, author: string) =>
  sql<boolean>`(${sql.ref(`${comment}.deletedAt`)} is null and ${sql.ref(`${author}.id`)} is not null and not ${bannedSql(author)})`

export const visibleThreadTargetSql = (thread: string) => sql<boolean>`(
  exists (select 1 from "medias" as "m" where "m"."id" = ${sql.ref(`${thread}.mediaId`)} and "m"."deletedAt" is null)
  or exists (select 1 from "chapters" as "ch" where "ch"."id" = ${sql.ref(`${thread}.chapterId`)} and "ch"."deletedAt" is null and "ch"."status" = 'PUBLISHED')
  or exists (select 1 from "groups" as "g" where "g"."id" = ${sql.ref(`${thread}.groupId`)} and "g"."deletedAt" is null)
  or exists (select 1 from "users" as "pu" where "pu"."id" = ${sql.ref(`${thread}.profileId`)} and not coalesce("pu"."banned", false))
)`

const liveRepliesOf = (root: string) =>
  sql`from "comments" as "r" left join "users" as "ru" on "ru"."id" = "r"."authorId" where "r"."parentId" = ${sql.ref(`${root}.id`)} and ${liveCommentSql("r", "ru")}`
const timestampSql = (column: string) =>
  sql<string>`to_char(${sql.ref(column)}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`

export const selectComments = (db: Kysely<DB>, viewerId: string | null) =>
  db
    .selectFrom("comments as c")
    .leftJoin("users as u", "u.id", "c.authorId")
    .leftJoin("userProfiles as up", "up.userId", "u.id")
    .leftJoin("comments as rt", "rt.id", "c.replyToId")
    .leftJoin("users as rtu", "rtu.id", "rt.authorId")
    .select([
      "c.id",
      "c.threadId",
      "c.parentId",
      "c.replyToId",
      "c.content",
      "c.upvoteCount",
      "c.deletion",
      timestampSql("c.createdAt").as("createdAt"),
      timestampSql("c.editedAt").as("editedAt"),
      sql<string>`to_char("c"."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS')`.as("cursorAt"),
      liveCommentSql("c", "u").as("live"),
      bannedSql("u").as("authorBanned"),
      "u.id as authorId",
      "u.username as authorUsername",
      "u.displayUsername as authorDisplayUsername",
      "u.image as authorImage",
      "u.nameEffect as authorNameEffect",
      "u.avatarBorder as authorAvatarBorder",
      "u.role as authorRole",
      "up.title as authorTitle",
      liveCommentSql("rt", "rtu").as("replyToLive"),
      "rtu.username as replyToUsername",
      "rtu.displayUsername as replyToDisplayUsername",
      sql<string>`(select count(*) ${liveRepliesOf("c")})`.as("replyCount"),
      (viewerId === null
        ? sql<boolean>`false`
        : sql<boolean>`exists (select 1 from "commentVotes" as "v" where "v"."commentId" = "c"."id" and "v"."userId" = ${viewerId})`
      ).as("viewerVoted"),
    ])

export const visibleRootSql = sql<boolean>`(${liveCommentSql("c", "u")} or exists (select 1 ${liveRepliesOf("c")}))`

type CommentRow = Awaited<ReturnType<ReturnType<typeof selectComments>["executeTakeFirstOrThrow"]>>

const commentImageSchema = z.object({
  id: z.uuid(),
  url: z.url().nullable().meta({ description: "Null once a moderator removed the image." }),
  width: z.int(),
  height: z.int(),
  animated: z.boolean(),
  favorited: z.boolean().meta({ description: "Whether it is in your favorites." }),
})
const commentAuthorSchema = userSummarySchema.extend({
  title: z.string().nullable().meta({ description: "The author's equipped profile title." }),
  role: z.enum(ROLES),
})

export const commentSchema = z.object({
  id: z.uuid(),
  parentId: z.uuid().nullable().meta({ description: "The top-level comment of a reply." }),
  createdAt: z.iso.datetime(),
  editedAt: z.iso.datetime().nullable().meta({ description: "When the author last edited it." }),
  removal: z
    .enum([...COMMENT_DELETIONS, "ACCOUNT_DELETED", "HIDDEN"])
    .nullable()
    .meta({
      description:
        "Why the comment is gone, or null while it is visible. Removed comments only show up while they have visible replies.",
    }),
  content: z.string().nullable().meta({ description: "Rich text, or null once removed." }),
  author: commentAuthorSchema.nullable(),
  replyTo: z
    .object({
      id: z.uuid(),
      author: z.object({ username: z.string(), displayUsername: z.string() }).nullable(),
    })
    .nullable()
    .meta({
      description: "The reply this reply answers, if any. Its author is null once removed.",
    }),
  images: commentImageSchema.array(),
  upvoteCount: z.int(),
  viewerVoted: z.boolean(),
  replyCount: z.int().meta({ description: "How many visible replies a top-level comment has." }),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
  canReport: z.boolean(),
})

export type CommentResponse = z.infer<typeof commentSchema>

export const rootCommentSchema = commentSchema.extend({
  replies: commentSchema
    .array()
    .meta({ description: "The first few replies, oldest first. Load the rest from /replies." }),
})

export const loadCommentImages = async (
  db: Kysely<DB>,
  commentIds: string[],
  viewerId: string | null,
) => {
  const byComment = new Map<string, Array<z.infer<typeof commentImageSchema>>>()

  if (commentIds.length === 0) {
    return byComment
  }

  const rows = await db
    .selectFrom("commentImageUsages as cu")
    .innerJoin("commentImages as ci", "ci.id", "cu.imageId")
    .select([
      "cu.commentId",
      "ci.id",
      "ci.key",
      "ci.width",
      "ci.height",
      "ci.animated",
      "ci.removedAt",
      (viewerId === null
        ? sql<boolean>`false`
        : sql<boolean>`exists (select 1 from "commentImageFavorites" as "f" where "f"."imageId" = "ci"."id" and "f"."userId" = ${viewerId})`
      ).as("favorited"),
    ])
    .where("cu.commentId", "in", commentIds)
    .execute()

  for (const row of rows) {
    const list = byComment.get(row.commentId) ?? []

    list.push({
      id: row.id,
      url: row.removedAt === null ? getPublicImageUrl(row.key) : null,
      width: row.width,
      height: row.height,
      animated: row.animated,
      favorited: row.favorited,
    })
    byComment.set(row.commentId, list)
  }

  return byComment
}

export const toComment = (
  row: CommentRow,
  {
    viewer,
    ownerId,
    images,
  }: {
    viewer: CommentViewer
    ownerId: string | null
    images: Map<string, Array<z.infer<typeof commentImageSchema>>>
  },
): CommentResponse => {
  const isAuthor = viewer !== null && viewer.id === row.authorId
  let removal: CommentResponse["removal"] = null

  if (row.deletion !== null) {
    removal = row.deletion
  } else if (row.authorId === null) {
    removal = "ACCOUNT_DELETED"
  } else if (!row.live) {
    removal = "HIDDEN"
  }

  const visible = removal === null

  return {
    id: row.id,
    parentId: row.parentId,
    createdAt: row.createdAt,
    editedAt: visible ? row.editedAt : null,
    removal,
    content: visible ? row.content : null,
    author:
      visible && row.authorId !== null
        ? {
            id: row.authorId,
            username: row.authorUsername ?? "",
            displayUsername: row.authorDisplayUsername ?? "",
            image: row.authorImage ?? null,
            nameEffect: row.authorNameEffect ?? null,
            avatarBorder: row.authorAvatarBorder ?? null,
            title: row.authorTitle ?? null,
            role: row.authorRole ?? "USER",
          }
        : null,
    replyTo:
      row.replyToId === null
        ? null
        : {
            id: row.replyToId,
            author:
              row.replyToLive && row.replyToUsername !== null
                ? {
                    username: row.replyToUsername,
                    displayUsername: row.replyToDisplayUsername ?? row.replyToUsername,
                  }
                : null,
          },
    images: visible ? (images.get(row.id) ?? []) : [],
    upvoteCount: visible ? row.upvoteCount : 0,
    viewerVoted: visible && row.viewerVoted,
    replyCount: Number(row.replyCount),
    canEdit: visible && isAuthor,
    canDelete:
      visible &&
      viewer !== null &&
      (isAuthor || viewer.canModerate || (ownerId !== null && viewer.id === ownerId)),
    canReport: visible && viewer !== null && !isAuthor,
  }
}

const cursorSchema = z.tuple([z.number().int().nonnegative(), z.string(), z.uuid()])

export const encodeCursor = (row: CommentRow) =>
  Buffer.from(JSON.stringify([row.upvoteCount, row.cursorAt, row.id])).toString("base64url")

export const decodeCursor = (cursor: string | undefined) => {
  if (cursor === undefined) {
    return null
  }

  try {
    const parsed = cursorSchema.safeParse(JSON.parse(Buffer.from(cursor, "base64url").toString()))

    return parsed.success && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/.test(parsed.data[1])
      ? { upvoteCount: parsed.data[0], at: parsed.data[1], id: parsed.data[2] }
      : null
  } catch {
    return null
  }
}

export const cursorQuerySchema = z
  .string()
  .max(200)
  .optional()
  .meta({ description: "The `nextCursor` of the previous page." })

export const keysetAfter = (
  sort: CommentSort,
  cursor: NonNullable<ReturnType<typeof decodeCursor>>,
) => {
  if (sort === "top") {
    return sql<boolean>`("c"."upvoteCount", "c"."createdAt", "c"."id") < (${cursor.upvoteCount}, ${cursor.at}::timestamp, ${cursor.id}::uuid)`
  }

  return sort === "newest"
    ? sql<boolean>`("c"."createdAt", "c"."id") < (${cursor.at}::timestamp, ${cursor.id}::uuid)`
    : sql<boolean>`("c"."createdAt", "c"."id") > (${cursor.at}::timestamp, ${cursor.id}::uuid)`
}

export const countThreadComments = async (db: Kysely<DB>, threadId: string | null) => {
  if (threadId === null) {
    return 0
  }

  const row = await db
    .selectFrom("comments as c")
    .leftJoin("users as u", "u.id", "c.authorId")
    .select(sql<string>`count(*)`.as("count"))
    .where("c.threadId", "=", threadId)
    .where(liveCommentSql("c", "u"))
    .executeTakeFirstOrThrow()

  return Number(row.count)
}

export const loadPreviewReplies = async (
  db: Kysely<DB>,
  rootIds: string[],
  viewerId: string | null,
) => {
  if (rootIds.length === 0) {
    return []
  }

  const ranked = selectComments(db, viewerId)
    .select(
      sql<string>`row_number() over (partition by "c"."parentId" order by "c"."createdAt", "c"."id")`.as(
        "rank",
      ),
    )
    .where("c.parentId", "in", rootIds)
    .where(liveCommentSql("c", "u"))

  return db
    .selectFrom(ranked.as("ranked"))
    .selectAll()
    .where("ranked.rank", "<=", String(config.comments.previewReplies))
    .orderBy("ranked.createdAt")
    .orderBy("ranked.id")
    .execute()
}

export const contentSchema = z
  .string()
  .max(4000)
  .transform(normalizeCommentContent)
  .meta({
    description: `Rich text, up to ${config.comments.maxTextLength} characters. Put an image on its own line as \`![](image:<id>)\`, or \`||![](image:<id>)||\` to hide it behind a spoiler; up to ${config.comments.maxImages} images.`,
    example: "Bla bla bla\n![](image:7f0c6a8e-0000-4000-8000-000000000000)\nBla bla bla",
  })

export const checkContent = async (
  db: Kysely<DB>,
  content: string,
  { userId, commentId }: { userId: string; commentId?: string },
) => {
  const imageIds = getCommentImageIds(content)
  const distinct = [...new Set(imageIds)]

  if (imageIds.length === 0 && isBlankCommentText(content)) {
    return { error: "COMMENT_EMPTY" as const }
  }

  if (getCommentText(content).length > config.comments.maxTextLength || content.length > 2400) {
    return { error: "COMMENT_TOO_LONG" as const }
  }

  if (imageIds.length > config.comments.maxImages) {
    return { error: "COMMENT_TOO_MANY_IMAGES" as const }
  }

  if (distinct.length > 0) {
    const allowed = await db
      .selectFrom("commentImages as ci")
      .select("ci.id")
      .where("ci.id", "in", distinct)
      .where((eb) =>
        eb.or([
          eb.and([
            eb("ci.removedAt", "is", null),
            eb.or([
              eb("ci.uploaderId", "=", userId),
              eb.exists(
                eb
                  .selectFrom("commentImageFavorites as f")
                  .select("f.imageId")
                  .whereRef("f.imageId", "=", "ci.id")
                  .where("f.userId", "=", userId),
              ),
            ]),
          ]),
          ...(commentId === undefined
            ? []
            : [
                eb.exists(
                  eb
                    .selectFrom("commentImageUsages as cu")
                    .select("cu.imageId")
                    .whereRef("cu.imageId", "=", "ci.id")
                    .where("cu.commentId", "=", commentId),
                ),
              ]),
        ]),
      )
      .execute()

    if (allowed.length !== distinct.length) {
      return { error: "COMMENT_IMAGE_UNAVAILABLE" as const }
    }
  }

  return { imageIds: distinct }
}

export const saveImageUsages = async (db: Kysely<DB>, commentId: string, imageIds: string[]) => {
  await db.deleteFrom("commentImageUsages").where("commentId", "=", commentId).execute()

  if (imageIds.length > 0) {
    await db
      .insertInto("commentImageUsages")
      .values(imageIds.map((imageId) => ({ commentId, imageId })))
      .execute()
  }
}

export const loadComment = async (
  db: Kysely<DB>,
  commentId: string,
  { viewer, ownerId }: { viewer: CommentViewer; ownerId: string | null },
) => {
  const row = await selectComments(db, viewer?.id ?? null)
    .where("c.id", "=", commentId)
    .executeTakeFirstOrThrow()
  const images = await loadCommentImages(db, [row.id], viewer?.id ?? null)

  return toComment(row, { viewer, ownerId, images })
}
