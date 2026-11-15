import type { DB, Kysely } from "@taiyomoe/db"
import type { AuditTarget } from "evlog"
import { getPublicImageUrl } from "@taiyomoe/s3"
import { getMainCoverUrls, getMainTitles } from "./latest-chapters"

type Reference = { kind: "media" | "group" | "staff" | "user" | "chapter"; id: string }

type AuditLogPreview = {
  kind: "media" | "group" | "staff" | "user"
  id: string
  label: string | null
  image: string | null
  nameEffect: string | null
  avatarBorder: string | null
  username: string | null
}

const UUID = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i
const uuidOf = (value: unknown) => (typeof value === "string" && UUID.test(value) ? value : null)
const getReference = (target: AuditTarget | null): Reference | null => {
  if (target === null) {
    return null
  }

  const id = uuidOf(target.id)
  const mediaId = target.type === "media" ? id : uuidOf(target.mediaId)
  const groupId = target.type === "group" ? id : uuidOf(target.groupId)
  const chapterId = target.type === "chapter" ? id : uuidOf(target.chapterId)

  if (mediaId !== null) {
    return { kind: "media", id: mediaId }
  }

  if (groupId !== null) {
    return { kind: "group", id: groupId }
  }

  if (chapterId !== null) {
    return { kind: "chapter", id: chapterId }
  }

  if (id !== null && (target.type === "staff" || target.type === "user")) {
    return { kind: target.type, id }
  }

  return null
}
const idsOf = (references: ReadonlyArray<Reference | null>, kind: Reference["kind"]) => [
  ...new Set(references.flatMap((reference) => (reference?.kind === kind ? [reference.id] : []))),
]

type Previewable = { target: AuditTarget | null }

const getPreviewer = async (db: Kysely<DB>, logs: readonly Previewable[]) => {
  const references = logs.map((log) => getReference(log.target))
  const chapterIds = idsOf(references, "chapter")
  const groupIds = idsOf(references, "group")
  const staffIds = idsOf(references, "staff")
  const userIds = idsOf(references, "user")
  // Titles and covers wait for the chapters' medias; groups, staffs and users do not.
  const medias = (
    chapterIds.length === 0
      ? Promise.resolve([])
      : db.selectFrom("chapters").select(["id", "mediaId"]).where("id", "in", chapterIds).execute()
  ).then(async (chapters) => {
    const chapterMedias = new Map(chapters.map((chapter) => [chapter.id, chapter.mediaId]))
    const mediaIds = [...new Set([...idsOf(references, "media"), ...chapterMedias.values()])]
    const [titles, covers] = await Promise.all([
      getMainTitles(db, mediaIds),
      getMainCoverUrls(db, mediaIds),
    ])

    return { chapterMedias, titles, covers }
  })
  const [{ chapterMedias, titles, covers }, groups, staffs, users] = await Promise.all([
    medias,
    groupIds.length === 0
      ? []
      : db
          .selectFrom("groups")
          .select(["id", "name", "logo"])
          .where("id", "in", groupIds)
          .execute(),
    staffIds.length === 0
      ? []
      : db
          .selectFrom("staffs")
          .select(["id", "name", "image"])
          .where("id", "in", staffIds)
          .execute(),
    userIds.length === 0
      ? []
      : db
          .selectFrom("users")
          .select(["id", "username", "displayUsername", "image", "nameEffect", "avatarBorder"])
          .where("id", "in", userIds)
          .execute(),
  ])
  const previews = new Map<string, AuditLogPreview>([
    ...groups.map((group): [string, AuditLogPreview] => [
      `group:${group.id}`,
      {
        kind: "group",
        id: group.id,
        label: group.name,
        nameEffect: null,
        avatarBorder: null,
        username: null,
        image:
          group.logo === null || /^https?:\/\//.test(group.logo)
            ? group.logo
            : getPublicImageUrl(group.logo),
      },
    ]),
    ...staffs.map((staff): [string, AuditLogPreview] => [
      `staff:${staff.id}`,
      {
        kind: "staff",
        id: staff.id,
        label: staff.name,
        image: staff.image === null ? null : getPublicImageUrl(staff.image),
        nameEffect: null,
        avatarBorder: null,
        username: null,
      },
    ]),
    ...users.map((user): [string, AuditLogPreview] => [
      `user:${user.id}`,
      {
        kind: "user",
        id: user.id,
        label: user.displayUsername,
        image: user.image,
        nameEffect: user.nameEffect,
        avatarBorder: user.avatarBorder,
        username: user.username,
      },
    ]),
  ])
  const mediaPreview = (id: string): AuditLogPreview => ({
    kind: "media",
    id,
    label: titles.get(id) ?? null,
    image: covers.get(id) ?? null,
    nameEffect: null,
    avatarBorder: null,
    username: null,
  })
  const previewOf = (reference: Reference | null): AuditLogPreview | null => {
    if (reference === null) {
      return null
    }

    if (reference.kind === "media") {
      return mediaPreview(reference.id)
    }

    if (reference.kind === "chapter") {
      const mediaId = chapterMedias.get(reference.id)

      return mediaId === undefined ? null : mediaPreview(mediaId)
    }

    return previews.get(`${reference.kind}:${reference.id}`) ?? null
  }

  return <T extends Previewable>(log: T) => ({
    ...log,
    preview: previewOf(getReference(log.target)),
  })
}

export const withPreviews = async <T extends Previewable>(db: Kysely<DB>, logs: readonly T[]) =>
  logs.map(await getPreviewer(db, logs))

export const withPreview = async <T extends Previewable>(db: Kysely<DB>, log: T) =>
  (await getPreviewer(db, [log]))(log)
