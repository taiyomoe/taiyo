import { describe, expect, it } from "vitest"
import {
  serializeAccount,
  serializeComment,
  serializeCommentImage,
  serializeGroupCreationRequest,
  serializeGroupMembership,
  serializeGroupOwnershipRequest,
  serializeMangaDexSync,
  serializeMediaSuggestion,
  serializeProfile,
  serializePushDevice,
  serializeReport,
  serializeSession,
  serializeSettings,
} from "../data-export/serializers"

const SECRET = "do-not-export"
const at = new Date("2026-01-02T03:04:05.000Z")
const expectNoSecret = (value: unknown) => {
  expect(JSON.stringify(value)).not.toContain(SECRET)
}

describe("serializeAccount", () => {
  const account = serializeAccount(
    {
      id: "user-1",
      username: "reader",
      displayUsername: "Reader",
      email: "reader@example.com",
      normalizedEmail: SECRET,
      emailVerified: true,
      role: "USER",
      twoFactorEnabled: true,
      banned: null,
      banReason: null,
      banExpires: null,
      createdAt: at,
      password: SECRET,
    },
    [
      { providerId: "credential", createdAt: at, password: SECRET, accountId: SECRET },
      {
        providerId: "discord",
        createdAt: at,
        accessToken: SECRET,
        refreshToken: SECRET,
        idToken: SECRET,
      },
    ],
    [
      {
        changedAt: at,
        before: { username: "old" },
        after: { username: "reader" },
        ipAddress: SECRET,
      },
    ],
  )

  it("keeps the account fields and nothing else", () => {
    expect(Object.keys(account)).toEqual([
      "id",
      "username",
      "displayName",
      "email",
      "emailVerified",
      "role",
      "twoFactorEnabled",
      "banned",
      "banReason",
      "banExpiresAt",
      "createdAt",
      "signInMethods",
      "nameHistory",
    ])
    expectNoSecret(account)
  })

  it("names sign-in methods without their tokens", () => {
    expect(account.signInMethods).toEqual([
      { method: "password", addedAt: at },
      { method: "discord", addedAt: at },
    ])
  })

  it("lists the name changes", () => {
    expect(account.nameHistory).toEqual([
      { changedAt: at, before: { username: "old" }, after: { username: "reader" } },
    ])
  })
})

describe("serializeProfile", () => {
  it("points at the images in the archive instead of their storage keys", () => {
    const profile = serializeProfile(
      {
        about: { en: "Hello" },
        city: null,
        country: "BR",
        gender: "UNKNOWN",
        birthDate: null,
        title: null,
        points: 12,
        nameEffect: null,
        avatarBorder: null,
        externalAvatarUrl: null,
        updatedAt: at,
        banner: SECRET,
        userId: SECRET,
      },
      { avatar: "images/avatar.webp", banner: null },
    )

    expect(Object.keys(profile)).toEqual([
      "about",
      "city",
      "country",
      "gender",
      "birthDate",
      "title",
      "points",
      "nameEffect",
      "avatarBorder",
      "avatar",
      "avatarFromSignInProvider",
      "banner",
      "updatedAt",
    ])
    expect(profile.avatar).toBe("images/avatar.webp")
    expectNoSecret(profile)
  })
})

describe("serializeSettings", () => {
  it("keeps the site and reader settings only", () => {
    const settings = serializeSettings({
      settings: { showLibrary: false },
      readerSettings: { mode: "vertical" },
      password: SECRET,
    })

    expect(settings).toEqual({
      settings: { showLibrary: false },
      readerSettings: { mode: "vertical" },
    })
  })
})

describe("serializeComment", () => {
  it("keeps the comment and its earlier versions but not who removed it", () => {
    const comment = serializeComment({
      id: "comment-1",
      parentId: null,
      replyToId: null,
      mediaId: "media-1",
      chapterId: null,
      groupId: null,
      profileUserId: null,
      content: "Great chapter",
      upvoteCount: 3,
      createdAt: at,
      editedAt: at,
      deletedAt: at,
      deletion: "MODERATOR",
      deleterId: SECRET,
      revisions: [{ content: "Good chapter", createdAt: "2026-01-02T03:04:05.000Z" }],
    })

    expect(Object.keys(comment)).toEqual([
      "id",
      "postedOn",
      "parentId",
      "replyToId",
      "content",
      "upvoteCount",
      "createdAt",
      "editedAt",
      "deletedAt",
      "deletedBy",
      "previousVersions",
    ])
    expect(comment.previousVersions).toEqual([
      { content: "Good chapter", replacedAt: "2026-01-02T03:04:05.000Z" },
    ])
    expectNoSecret(comment)
  })
})

describe("serializeCommentImage", () => {
  it("leaves out the storage key, hashes and remover", () => {
    const image = serializeCommentImage(
      {
        id: "image-1",
        width: 100,
        height: 80,
        animated: false,
        byteSize: 2048,
        createdAt: at,
        removedAt: null,
        key: SECRET,
        sha256: SECRET,
        dhash: SECRET,
        removerId: SECRET,
      },
      "images/comments/image-1.webp",
    )

    expect(Object.keys(image)).toEqual([
      "id",
      "file",
      "width",
      "height",
      "animated",
      "byteSize",
      "uploadedAt",
      "removedAt",
    ])
    expectNoSecret(image)
  })
})

describe("serializeGroupMembership", () => {
  it("leaves out who added the member", () => {
    const membership = serializeGroupMembership({
      groupId: "group-1",
      groupName: "Scans",
      role: "MEMBER",
      permissions: ["UPLOAD_CHAPTERS"],
      createdAt: at,
      addedBy: SECRET,
    })

    expect(Object.keys(membership)).toEqual([
      "groupId",
      "groupName",
      "role",
      "permissions",
      "joinedAt",
    ])
    expectNoSecret(membership)
  })
})

describe("serializeReport", () => {
  const base = {
    id: "report-1",
    reason: "SPAM",
    details: "It is spam",
    status: "OPEN",
    createdAt: at,
    reviewerId: SECRET,
    reviewerNote: SECRET,
    resolverId: SECRET,
  }

  it.each([
    { row: { ...base, kind: "COMMENT" as const, commentId: "comment-1" }, extra: ["commentId"] },
    {
      row: { ...base, kind: "PAGE" as const, chapterId: "chapter-1", pageId: "page-1" },
      extra: ["chapterId", "pageId"],
    },
    { row: { ...base, kind: "GROUP" as const, groupId: "group-1" }, extra: ["groupId"] },
    {
      row: { ...base, kind: "USER" as const, reportedUserId: "user-2", reportedUsername: "other" },
      extra: ["reportedUserId", "reportedUsername"],
    },
  ])("keeps a $row.kind report without the moderators' notes", ({ row, extra }) => {
    const report = serializeReport(row)

    expect(Object.keys(report)).toEqual([
      "id",
      "kind",
      "reason",
      "details",
      "status",
      "createdAt",
      ...extra,
    ])
    expectNoSecret(report)
  })
})

describe("requests", () => {
  it("leave out the reviewers and their notes", () => {
    const reviewer = { reviewerId: SECRET, reviewerNote: SECRET }
    const suggestion = serializeMediaSuggestion({
      id: "suggestion-1",
      mediaId: "media-1",
      status: "PENDING",
      changes: { synopsis: "New" },
      note: "Typo",
      acceptedFields: [],
      reviewedAt: null,
      createdAt: at,
      updatedAt: at,
      ...reviewer,
    })
    const creation = serializeGroupCreationRequest({
      id: "request-1",
      name: "Scans",
      description: null,
      proofLinks: [],
      message: "Please",
      status: "PENDING",
      groupId: null,
      createdAt: at,
      updatedAt: at,
      ...reviewer,
    })
    const ownership = serializeGroupOwnershipRequest({
      id: "request-2",
      groupId: "group-1",
      groupName: "Scans",
      message: null,
      proofLinks: [],
      status: "PENDING",
      createdAt: at,
      updatedAt: at,
      ...reviewer,
    })

    expect(Object.keys(suggestion)).toEqual([
      "id",
      "kind",
      "mediaId",
      "status",
      "changes",
      "note",
      "acceptedFields",
      "reviewedAt",
      "createdAt",
      "updatedAt",
    ])
    expect(Object.keys(creation)).toEqual([
      "id",
      "kind",
      "groupName",
      "groupDescription",
      "proofLinks",
      "message",
      "status",
      "groupId",
      "createdAt",
      "updatedAt",
    ])
    expect(Object.keys(ownership)).toEqual([
      "id",
      "kind",
      "groupId",
      "groupName",
      "message",
      "proofLinks",
      "status",
      "createdAt",
      "updatedAt",
    ])
    expectNoSecret([suggestion, creation, ownership])
  })
})

describe("serializeSession", () => {
  it("keeps the IP address, browser and dates but not the token or the staff member", () => {
    const session = serializeSession({
      id: SECRET,
      token: SECRET,
      ipAddress: "203.0.113.7",
      userAgent: "Firefox",
      impersonatedBy: SECRET,
      createdAt: at,
      updatedAt: at,
      expiresAt: at,
    })

    expect(session).toEqual({
      ipAddress: "203.0.113.7",
      userAgent: "Firefox",
      openedByStaff: true,
      signedInAt: at,
      lastActiveAt: at,
      expiresAt: at,
    })
  })
})

describe("serializePushDevice", () => {
  it("leaves out the delivery address and keys", () => {
    const device = serializePushDevice({
      endpoint: SECRET,
      p256dh: SECRET,
      auth: SECRET,
      userAgent: "Chrome",
      locale: "fr",
      createdAt: at,
      updatedAt: at,
    })

    expect(device).toEqual({ userAgent: "Chrome", locale: "fr", subscribedAt: at, updatedAt: at })
  })
})

describe("serializeMangaDexSync", () => {
  it("leaves out the internal error", () => {
    const sync = serializeMangaDexSync({
      id: "sync-1",
      mediaId: "media-1",
      mangaDexId: "md-1",
      status: "FAILED",
      summary: { imported: 0 },
      error: SECRET,
      createdAt: at,
      finishedAt: at,
      updatedAt: at,
    })

    expect(Object.keys(sync)).toEqual([
      "id",
      "mediaId",
      "mangaDexId",
      "status",
      "summary",
      "startedAt",
      "finishedAt",
    ])
    expectNoSecret(sync)
  })
})
