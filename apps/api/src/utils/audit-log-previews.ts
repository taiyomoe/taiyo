import type { DB, Kysely } from "@taiyomoe/db"
import type { AuditTarget } from "evlog"
import { getGroupImageUrl, getStaffImageUrl } from "@taiyomoe/s3"
import { getMainCoverUrls, getMainTitles } from "./latest-chapters"

type Reference = { kind: "media" | "group" | "staff" | "user" | "chapter"; id: string }

export type AuditLogPreview = {
  kind: "media" | "group" | "staff" | "user"
  id: string
  label: string | null
  image: string | null
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

export const withPreviews = async <T extends { target: AuditTarget | null }>(
  db: Kysely<DB>,
  logs: readonly T[],
) => {
  const references = logs.map((log) => getReference(log.target))
  const chapterIds = idsOf(references, "chapter")
  const groupIds = idsOf(references, "group")
  const staffIds = idsOf(references, "staff")
  const userIds = idsOf(references, "user")
  const chapters =
    chapterIds.length === 0
      ? []
      : await db
          .selectFrom("chapters")
          .select(["id", "mediaId"])
          .where("id", "in", chapterIds)
          .execute()
  const chapterMedias = new Map(chapters.map((chapter) => [chapter.id, chapter.mediaId]))
  const mediaIds = [...new Set([...idsOf(references, "media"), ...chapterMedias.values()])]
  const [titles, covers, groups, staffs, users] = await Promise.all([
    getMainTitles(db, mediaIds),
    getMainCoverUrls(db, mediaIds),
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
          .select(["id", "displayUsername", "image"])
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
        image: group.logo === null ? null : getGroupImageUrl(group.logo),
      },
    ]),
    ...staffs.map((staff): [string, AuditLogPreview] => [
      `staff:${staff.id}`,
      {
        kind: "staff",
        id: staff.id,
        label: staff.name,
        image: staff.image === null ? null : getStaffImageUrl(staff.image),
      },
    ]),
    ...users.map((user): [string, AuditLogPreview] => [
      `user:${user.id}`,
      { kind: "user", id: user.id, label: user.displayUsername, image: user.image },
    ]),
  ])
  const mediaPreview = (id: string): AuditLogPreview => ({
    kind: "media",
    id,
    label: titles.get(id) ?? null,
    image: covers.get(id) ?? null,
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

  return logs.map((log, index) => ({ ...log, preview: previewOf(references[index] ?? null) }))
}
