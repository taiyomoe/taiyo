import type { GroupPermission } from "@taiyomoe/db"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia, seedMembership } from "../helpers/seed"
import { test } from "../setup"

const setup = async (services: Services) => {
  const admin = await signInAs(services, { role: "ADMIN" })
  const mediaId = await seedMedia(services, admin.userId)
  const groupA = await seedGroup(services, admin.userId, `A ${randomUUID()}`)
  const groupB = await seedGroup(services, admin.userId, `B ${randomUUID()}`)

  return {
    admin,
    mediaId,
    groupA,
    groupB,
    chapterOf: (groupIds: string[]) =>
      seedChapter(services, {
        mediaId,
        uploaderId: admin.userId,
        number: Math.random() * 1000,
        groupIds,
      }),
    memberOf: async (groupId: string, permissions: GroupPermission[] = []) => {
      const user = await signInAs(services)

      await seedMembership(services, { groupId, userId: user.userId, permissions })

      return user
    },
    ownerOf: async (groupId: string) => {
      const user = await signInAs(services)

      await seedMembership(services, { groupId, userId: user.userId, role: "OWNER" })

      return user
    },
  }
}
const getCredits = async ({ db }: Services, chapterId: string) =>
  (
    await db
      .selectFrom("chapterGroups")
      .select("groupId")
      .where("chapterId", "=", chapterId)
      .execute()
  )
    .map((row) => row.groupId)
    .sort()
const isDeleted = async ({ db }: Services, chapterId: string) => {
  const row = await db
    .selectFrom("chapters")
    .select("deletedAt")
    .where("id", "=", chapterId)
    .executeTakeFirstOrThrow()

  return row.deletedAt !== null
}

describe("group chapter access", () => {
  describe("creating chapters", () => {
    test("a member with UPLOAD_CHAPTERS publishes when crediting their group, alongside any other", async ({
      app,
      services,
    }) => {
      const { mediaId, groupA, groupB, memberOf } = await setup(services)
      const { headers } = await memberOf(groupA, ["UPLOAD_CHAPTERS"])
      const res = await api<{ id: string }>(app, `/medias/${mediaId}/chapters`, {
        method: "POST",
        headers,
        json: { number: 1, language: "en", groupIds: [groupA, groupB, groupA] },
      })

      expect(res.status).toBe(201)

      if (!res.body.success) {
        throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
      }

      expect(await getCredits(services, res.body.data.id)).toEqual([groupA, groupB].sort())
    })

    test("a group owner can publish for their group", async ({ app, services }) => {
      const { mediaId, groupA, ownerOf } = await setup(services)
      const { headers } = await ownerOf(groupA)
      const res = await api(app, `/medias/${mediaId}/chapters`, {
        method: "POST",
        headers,
        json: { number: 1, language: "en", groupIds: [groupA] },
      })

      expect(res.status).toBe(201)
    })

    test("crediting only groups the uploader cannot publish for sends the chapter to review", async ({
      app,
      services,
    }) => {
      const { mediaId, groupA, groupB, memberOf } = await setup(services)
      const uploader = await memberOf(groupA, ["UPLOAD_CHAPTERS"])
      const editor = await memberOf(groupB, ["EDIT_CHAPTERS", "DELETE_CHAPTERS", "EDIT_GROUP"])

      for (const [headers, groupIds] of [
        [uploader.headers, [groupB]],
        [uploader.headers, []],
        [editor.headers, [groupB]],
      ] as const) {
        const res = await api(app, `/medias/${mediaId}/chapters`, {
          method: "POST",
          headers,
          json: { number: 1, language: "en", groupIds },
        })

        expect(res.body).toMatchObject({ data: { status: "PENDING" } })
      }
    })

    test("a deleted group cannot be credited", async ({ app, services }) => {
      const { mediaId, groupA, memberOf } = await setup(services)
      const { headers } = await memberOf(groupA, ["UPLOAD_CHAPTERS"])

      await services.db
        .updateTable("groups")
        .set({ deletedAt: new Date() })
        .where("id", "=", groupA)
        .execute()

      const res = await api(app, `/medias/${mediaId}/chapters`, {
        method: "POST",
        headers,
        json: { number: 1, language: "en", groupIds: [groupA] },
      })

      expect(res.body).toMatchObject({ code: "GROUP_NOT_FOUND" })
    })

    test("uploaders and admins publish with any groups or none", async ({ app, services }) => {
      const { mediaId, groupA } = await setup(services)

      for (const role of ["UPLOADER", "ADMIN"] as const) {
        const { headers } = await signInAs(services, { role })

        for (const groupIds of [[], [groupA]]) {
          const res = await api(app, `/medias/${mediaId}/chapters`, {
            method: "POST",
            headers,
            json: { number: 1, language: "en", groupIds },
          })

          expect(res.status).toBe(201)
        }
      }
    })

    test("moderators, interns and users send chapters without a group to review", async ({
      app,
      services,
    }) => {
      const { mediaId } = await setup(services)

      for (const role of ["MODERATOR", "UPLOADER_INTERN", "USER"] as const) {
        const { headers } = await signInAs(services, { role })
        const res = await api(app, `/medias/${mediaId}/chapters`, {
          method: "POST",
          headers,
          json: { number: 1, language: "en" },
        })

        expect(res.body).toMatchObject({ data: { status: "PENDING" } })
      }
    })

    test("an unknown or deleted group is refused", async ({ app, services }) => {
      const { admin, mediaId, groupB } = await setup(services)

      await services.db
        .updateTable("groups")
        .set({ deletedAt: new Date() })
        .where("id", "=", groupB)
        .execute()

      for (const groupId of [randomUUID(), groupB]) {
        const res = await api(app, `/medias/${mediaId}/chapters`, {
          method: "POST",
          headers: admin.headers,
          json: { number: 1, language: "en", groupIds: [groupId] },
        })

        expect(res.status).toBe(404)
        expect(res.body).toMatchObject({ success: false, code: "GROUP_NOT_FOUND" })
      }
    })

    test("only uploaders, moderators and admins can set the flag", async ({ app, services }) => {
      const { mediaId, groupA, ownerOf } = await setup(services)
      const owner = await ownerOf(groupA)
      const uploader = await signInAs(services, { role: "UPLOADER" })
      const create = (headers: Record<string, string>) =>
        api(app, `/medias/${mediaId}/chapters`, {
          method: "POST",
          headers,
          json: { number: 1, language: "en", groupIds: [groupA], flag: "STAFF_ONLY" },
        })

      expect((await create(owner.headers)).status).toBe(403)
      expect((await create(uploader.headers)).status).toBe(201)
    })
  })

  describe("editing and deleting chapters", () => {
    test("a group owner can edit and delete chapters credited to the group, whoever uploaded them", async ({
      app,
      services,
    }) => {
      const { groupA, chapterOf, ownerOf } = await setup(services)
      const chapterId = await chapterOf([groupA])
      const { headers } = await ownerOf(groupA)
      const update = await api(app, `/chapters/${chapterId}`, {
        method: "PATCH",
        headers,
        json: { title: "Fixed by the group" },
      })
      const remove = await api(app, `/chapters/${chapterId}`, { method: "DELETE", headers })

      expect(update.status).toBe(200)
      expect(remove.status).toBe(200)
      expect(await isDeleted(services, chapterId)).toBe(true)
    })

    test("members get exactly the chapter permissions they were granted", async ({
      app,
      services,
    }) => {
      const { groupA, chapterOf, memberOf } = await setup(services)
      const chapterId = await chapterOf([groupA])
      const editor = await memberOf(groupA, ["EDIT_CHAPTERS"])
      const deleter = await memberOf(groupA, ["DELETE_CHAPTERS"])
      const bare = await memberOf(groupA, ["UPLOAD_CHAPTERS", "EDIT_GROUP", "MANAGE_MEMBERS"])
      const update = (headers: Record<string, string>) =>
        api(app, `/chapters/${chapterId}`, { method: "PATCH", headers, json: { title: "x" } })
      const remove = (headers: Record<string, string>) =>
        api(app, `/chapters/${chapterId}`, { method: "DELETE", headers })

      expect((await update(editor.headers)).status).toBe(200)
      expect((await update(deleter.headers)).status).toBe(403)
      expect((await update(bare.headers)).status).toBe(403)
      expect((await remove(editor.headers)).status).toBe(403)
      expect((await remove(bare.headers)).status).toBe(403)
      expect(await isDeleted(services, chapterId)).toBe(false)
      expect((await remove(deleter.headers)).status).toBe(200)
    })

    test("permissions in another group grant nothing", async ({ app, services }) => {
      const { groupA, groupB, chapterOf, ownerOf, memberOf } = await setup(services)
      const chapterId = await chapterOf([groupA])
      const owner = await ownerOf(groupB)
      const member = await memberOf(groupB, ["EDIT_CHAPTERS", "DELETE_CHAPTERS"])

      for (const { headers } of [owner, member]) {
        const update = await api(app, `/chapters/${chapterId}`, {
          method: "PATCH",
          headers,
          json: { title: "x" },
        })
        const remove = await api(app, `/chapters/${chapterId}`, { method: "DELETE", headers })

        expect(update.status).toBe(403)
        expect(remove.status).toBe(403)
      }
    })

    test("delete rights in one credited group are enough to delete a joint chapter", async ({
      app,
      services,
    }) => {
      const { groupA, groupB, chapterOf, memberOf } = await setup(services)
      const chapterId = await chapterOf([groupA, groupB])
      const { headers } = await memberOf(groupB, ["DELETE_CHAPTERS"])
      const res = await api(app, `/chapters/${chapterId}`, { method: "DELETE", headers })

      expect(res.status).toBe(200)
    })

    test("group editors cannot change the flag", async ({ app, services }) => {
      const { groupA, chapterOf, ownerOf } = await setup(services)
      const chapterId = await chapterOf([groupA])
      const { headers } = await ownerOf(groupA)
      const res = await api(app, `/chapters/${chapterId}`, {
        method: "PATCH",
        headers,
        json: { flag: "OK" },
      })

      expect(res.status).toBe(403)
    })

    test("uploading a chapter grants no rights over it once published", async ({
      app,
      services,
    }) => {
      const { mediaId } = await setup(services)
      const { headers, userId } = await signInAs(services)
      const chapterId = await seedChapter(services, { mediaId, uploaderId: userId, number: 1 })
      const res = await api(app, `/chapters/${chapterId}`, {
        method: "PATCH",
        headers,
        json: { title: "x" },
      })

      expect(res.status).toBe(403)
    })

    test("interns cannot edit or delete chapters outside their groups", async ({
      app,
      services,
    }) => {
      const { groupA, chapterOf } = await setup(services)
      const chapterId = await chapterOf([groupA])
      const { headers } = await signInAs(services, { role: "UPLOADER_INTERN" })
      const update = await api(app, `/chapters/${chapterId}`, {
        method: "PATCH",
        headers,
        json: { title: "x" },
      })
      const remove = await api(app, `/chapters/${chapterId}`, { method: "DELETE", headers })

      expect(update.status).toBe(403)
      expect(remove.status).toBe(403)
    })

    test("moderators can edit and delete any chapter", async ({ app, services }) => {
      const { chapterOf } = await setup(services)
      const chapterId = await chapterOf([])
      const { headers } = await signInAs(services, { role: "MODERATOR" })
      const update = await api(app, `/chapters/${chapterId}`, {
        method: "PATCH",
        headers,
        json: { title: "x", flag: "STAFF_ONLY" },
      })
      const remove = await api(app, `/chapters/${chapterId}`, { method: "DELETE", headers })

      expect(update.status).toBe(200)
      expect(remove.status).toBe(200)
    })
  })

  describe("credits", () => {
    test("an editor can credit any group but only remove their own group's credit", async ({
      app,
      services,
    }) => {
      const { admin, groupA, groupB, chapterOf, memberOf } = await setup(services)
      const groupC = await seedGroup(services, admin.userId, `C ${randomUUID()}`)
      const chapterId = await chapterOf([groupA, groupB])
      const { headers } = await memberOf(groupA, ["EDIT_CHAPTERS"])
      const credit = await api(app, `/chapters/${chapterId}/groups`, {
        method: "POST",
        headers,
        json: { groupId: groupC },
      })
      const removeOther = await api(app, `/chapters/${chapterId}/groups/${groupB}`, {
        method: "DELETE",
        headers,
      })

      expect(credit.status).toBe(201)
      expect(removeOther.status).toBe(403)
      expect(await getCredits(services, chapterId)).toEqual([groupA, groupB, groupC].sort())

      const removeOwn = await api(app, `/chapters/${chapterId}/groups/${groupA}`, {
        method: "DELETE",
        headers,
      })

      expect(removeOwn.status).toBe(200)
      expect(await getCredits(services, chapterId)).toEqual([groupB, groupC].sort())
    })

    test("members without EDIT_CHAPTERS cannot change credits", async ({ app, services }) => {
      const { groupA, groupB, chapterOf, memberOf } = await setup(services)
      const chapterId = await chapterOf([groupA])
      const { headers } = await memberOf(groupA, ["UPLOAD_CHAPTERS", "DELETE_CHAPTERS"])
      const credit = await api(app, `/chapters/${chapterId}/groups`, {
        method: "POST",
        headers,
        json: { groupId: groupB },
      })
      const remove = await api(app, `/chapters/${chapterId}/groups/${groupA}`, {
        method: "DELETE",
        headers,
      })

      expect(credit.status).toBe(403)
      expect(remove.status).toBe(403)
      expect(await getCredits(services, chapterId)).toEqual([groupA])
    })
  })

  describe("pages", () => {
    test("only editors of a credited group can open an upload session", async ({
      app,
      services,
    }) => {
      const { groupA, chapterOf, memberOf } = await setup(services)
      const chapterId = await chapterOf([groupA])
      const editor = await memberOf(groupA, ["EDIT_CHAPTERS"])
      const uploader = await memberOf(groupA, ["UPLOAD_CHAPTERS"])
      const open = (headers: Record<string, string>) =>
        api(app, `/chapters/${chapterId}/pages/upload-session`, {
          method: "POST",
          headers,
          json: { pages: [{ contentType: "image/png", size: 1024 }] },
        })

      expect((await open(uploader.headers)).status).toBe(403)
      expect((await open(editor.headers)).status).toBe(201)
    })
  })
})
