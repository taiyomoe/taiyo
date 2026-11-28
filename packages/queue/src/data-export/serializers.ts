import type {
  CommentDeletion,
  CosmeticKind,
  Json,
  LocalizedText,
  NotificationType,
  UserSettings,
} from "@taiyomoe/db"

type Row<T> = T & Record<string, unknown>

type Timestamp = Date | string

/** The archive paths of the user's own images, or null when there is none. */
export type ExportImages = {
  avatar: string | null
  banner: string | null
}

export const serializeAccount = (
  user: Row<{
    id: string
    username: string
    displayUsername: string
    email: string | null
    emailVerified: boolean
    role: string
    twoFactorEnabled: boolean
    banned: boolean | null
    banReason: string | null
    banExpires: Timestamp | null
    createdAt: Timestamp
  }>,
  providers: Array<Row<{ providerId: string; createdAt: Timestamp }>>,
  nameChanges: Array<Row<{ changedAt: Timestamp; before: Json; after: Json }>>,
) => ({
  id: user.id,
  username: user.username,
  displayName: user.displayUsername,
  email: user.email,
  emailVerified: user.emailVerified,
  role: user.role,
  twoFactorEnabled: user.twoFactorEnabled,
  banned: user.banned === true,
  banReason: user.banReason,
  banExpiresAt: user.banExpires,
  createdAt: user.createdAt,
  signInMethods: providers.map((provider) => ({
    method: provider.providerId === "credential" ? "password" : provider.providerId,
    addedAt: provider.createdAt,
  })),
  nameHistory: nameChanges.map((change) => ({
    changedAt: change.changedAt,
    before: change.before,
    after: change.after,
  })),
})

export const serializeProfile = (
  profile: Row<{
    about: LocalizedText
    city: string | null
    country: string | null
    gender: string
    birthDate: Timestamp | null
    title: string | null
    points: number
    nameEffect: string | null
    avatarBorder: string | null
    externalAvatarUrl: string | null
    updatedAt: Timestamp
  }>,
  images: ExportImages,
) => ({
  about: profile.about,
  city: profile.city,
  country: profile.country,
  gender: profile.gender,
  birthDate: profile.birthDate,
  title: profile.title,
  points: profile.points,
  nameEffect: profile.nameEffect,
  avatarBorder: profile.avatarBorder,
  avatar: images.avatar,
  avatarFromSignInProvider: profile.externalAvatarUrl,
  banner: images.banner,
  updatedAt: profile.updatedAt,
})

export const serializeSettings = (
  user: Row<{ settings: UserSettings; readerSettings: Record<string, unknown> | null }>,
) => ({
  settings: user.settings,
  readerSettings: user.readerSettings,
})

export const serializeLibraryEntry = (
  row: Row<{
    mediaId: string
    mediaTitle: string | null
    status: string
    notify: boolean
    createdAt: Timestamp
    updatedAt: Timestamp
  }>,
) => ({
  mediaId: row.mediaId,
  mediaTitle: row.mediaTitle,
  status: row.status,
  notifyNewChapters: row.notify,
  addedAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export const serializeHistoryEntry = (
  row: Row<{
    chapterId: string
    chapterNumber: number
    mediaId: string
    mediaTitle: string | null
    pageId: string | null
    completed: boolean
    createdAt: Timestamp
    updatedAt: Timestamp
  }>,
) => ({
  chapterId: row.chapterId,
  chapterNumber: row.chapterNumber,
  mediaId: row.mediaId,
  mediaTitle: row.mediaTitle,
  lastPageId: row.pageId,
  completed: row.completed,
  firstReadAt: row.createdAt,
  lastReadAt: row.updatedAt,
})

export const serializeBookmark = (
  row: Row<{
    id: string
    chapterId: string
    chapterNumber: number
    mediaId: string
    mediaTitle: string | null
    pageId: string
    createdAt: Timestamp
  }>,
) => ({
  id: row.id,
  chapterId: row.chapterId,
  chapterNumber: row.chapterNumber,
  mediaId: row.mediaId,
  mediaTitle: row.mediaTitle,
  pageId: row.pageId,
  createdAt: row.createdAt,
})

export const serializeList = (
  row: Row<{
    id: string
    name: string
    description: string | null
    visibility: string
    upvoteCount: number
    createdAt: Timestamp
    updatedAt: Timestamp
    deletedAt: Timestamp | null
    items: Array<{ mediaId: string; mediaTitle: string | null; position: number; addedAt: string }>
  }>,
) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  visibility: row.visibility,
  upvoteCount: row.upvoteCount,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  deletedAt: row.deletedAt,
  items: row.items.map((item) => ({
    mediaId: item.mediaId,
    mediaTitle: item.mediaTitle,
    position: item.position,
    addedAt: item.addedAt,
  })),
})

export const serializeListVote = (
  row: Row<{ listId: string; listName: string | null; createdAt: Timestamp }>,
) => ({
  listId: row.listId,
  listName: row.listName,
  votedAt: row.createdAt,
})

export const serializeComment = (
  row: Row<{
    id: string
    parentId: string | null
    replyToId: string | null
    mediaId: string | null
    chapterId: string | null
    groupId: string | null
    profileUserId: string | null
    content: string
    upvoteCount: number
    createdAt: Timestamp
    editedAt: Timestamp | null
    deletedAt: Timestamp | null
    deletion: CommentDeletion | null
    revisions: Array<{ content: string; createdAt: string }>
  }>,
) => ({
  id: row.id,
  postedOn: {
    mediaId: row.mediaId,
    chapterId: row.chapterId,
    groupId: row.groupId,
    profileUserId: row.profileUserId,
  },
  parentId: row.parentId,
  replyToId: row.replyToId,
  content: row.content,
  upvoteCount: row.upvoteCount,
  createdAt: row.createdAt,
  editedAt: row.editedAt,
  deletedAt: row.deletedAt,
  deletedBy: row.deletion,
  previousVersions: row.revisions.map((revision) => ({
    content: revision.content,
    replacedAt: revision.createdAt,
  })),
})

export const serializeCommentVote = (row: Row<{ commentId: string; createdAt: Timestamp }>) => ({
  commentId: row.commentId,
  votedAt: row.createdAt,
})

export const serializeCommentImage = (
  row: Row<{
    id: string
    width: number
    height: number
    animated: boolean
    byteSize: number
    createdAt: Timestamp
    removedAt: Timestamp | null
  }>,
  file: string | null,
) => ({
  id: row.id,
  file,
  width: row.width,
  height: row.height,
  animated: row.animated,
  byteSize: row.byteSize,
  uploadedAt: row.createdAt,
  removedAt: row.removedAt,
})

export const serializeFavoriteImage = (row: Row<{ imageId: string; createdAt: Timestamp }>) => ({
  imageId: row.imageId,
  favoritedAt: row.createdAt,
})

export const serializeMangaDexSync = (
  row: Row<{
    id: string
    mediaId: string
    mangaDexId: string
    status: string
    summary: Json
    createdAt: Timestamp
    finishedAt: Timestamp | null
  }>,
) => ({
  id: row.id,
  mediaId: row.mediaId,
  mangaDexId: row.mangaDexId,
  status: row.status,
  summary: row.summary,
  startedAt: row.createdAt,
  finishedAt: row.finishedAt,
})

export const serializeFollowedUser = (
  row: Row<{ followingId: string; username: string; displayUsername: string }>,
) => ({
  userId: row.followingId,
  username: row.username,
  displayName: row.displayUsername,
})

export const serializeFollowedGroup = (
  row: Row<{ groupId: string; groupName: string; createdAt: Timestamp }>,
) => ({
  groupId: row.groupId,
  groupName: row.groupName,
  followedAt: row.createdAt,
})

export const serializeGroupMembership = (
  row: Row<{
    groupId: string
    groupName: string
    role: string
    permissions: string[]
    createdAt: Timestamp
  }>,
) => ({
  groupId: row.groupId,
  groupName: row.groupName,
  role: row.role,
  permissions: row.permissions,
  joinedAt: row.createdAt,
})

export const serializeGroupInvitation = (
  row: Row<{
    id: string
    groupId: string
    groupName: string
    status: string
    permissions: string[]
    createdAt: Timestamp
    expiresAt: Timestamp
  }>,
) => ({
  id: row.id,
  groupId: row.groupId,
  groupName: row.groupName,
  status: row.status,
  permissions: row.permissions,
  receivedAt: row.createdAt,
  expiresAt: row.expiresAt,
})

type ReportBase = {
  id: string
  reason: string
  details: string | null
  status: string
  createdAt: Timestamp
}

export const serializeReport = (
  row: Row<
    ReportBase &
      (
        | { kind: "COMMENT"; commentId: string }
        | { kind: "PAGE"; chapterId: string; pageId: string }
        | { kind: "GROUP"; groupId: string }
        | { kind: "USER"; reportedUserId: string; reportedUsername: string }
      )
  >,
) => {
  const base = {
    id: row.id,
    kind: row.kind,
    reason: row.reason,
    details: row.details,
    status: row.status,
    createdAt: row.createdAt,
  }

  if (row.kind === "COMMENT") {
    return { ...base, commentId: row.commentId }
  }

  if (row.kind === "PAGE") {
    return { ...base, chapterId: row.chapterId, pageId: row.pageId }
  }

  if (row.kind === "GROUP") {
    return { ...base, groupId: row.groupId }
  }

  return { ...base, reportedUserId: row.reportedUserId, reportedUsername: row.reportedUsername }
}

export const serializeMediaSuggestion = (
  row: Row<{
    id: string
    mediaId: string
    status: string
    changes: Json
    note: string | null
    acceptedFields: string[]
    reviewedAt: Timestamp | null
    createdAt: Timestamp
    updatedAt: Timestamp
  }>,
) => ({
  id: row.id,
  kind: "MEDIA_SUGGESTION",
  mediaId: row.mediaId,
  status: row.status,
  changes: row.changes,
  note: row.note,
  acceptedFields: row.acceptedFields,
  reviewedAt: row.reviewedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export const serializeGroupCreationRequest = (
  row: Row<{
    id: string
    name: string
    description: string | null
    proofLinks: string[]
    message: string
    status: string
    groupId: string | null
    createdAt: Timestamp
    updatedAt: Timestamp
  }>,
) => ({
  id: row.id,
  kind: "GROUP_CREATION",
  groupName: row.name,
  groupDescription: row.description,
  proofLinks: row.proofLinks,
  message: row.message,
  status: row.status,
  groupId: row.groupId,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export const serializeGroupOwnershipRequest = (
  row: Row<{
    id: string
    groupId: string
    groupName: string
    message: string | null
    proofLinks: string[]
    status: string
    createdAt: Timestamp
    updatedAt: Timestamp
  }>,
) => ({
  id: row.id,
  kind: "GROUP_OWNERSHIP",
  groupId: row.groupId,
  groupName: row.groupName,
  message: row.message,
  proofLinks: row.proofLinks,
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export const serializeNotification = (
  row: Row<{
    id: string
    type: NotificationType
    chapterId: string | null
    commentId: string | null
    achievement: string | null
    payload: Json | null
    createdAt: Timestamp
    lastEventAt: Timestamp
    readAt: Timestamp | null
  }>,
) => ({
  id: row.id,
  type: row.type,
  chapterId: row.chapterId,
  commentId: row.commentId,
  achievement: row.achievement,
  details: row.payload,
  createdAt: row.createdAt,
  lastEventAt: row.lastEventAt,
  readAt: row.readAt,
})

export const serializeAchievement = (
  row: Row<{ key: string; count: number; firstEarnedAt: Timestamp; lastEarnedAt: Timestamp }>,
) => ({
  key: row.key,
  timesEarned: row.count,
  firstEarnedAt: row.firstEarnedAt,
  lastEarnedAt: row.lastEarnedAt,
})

export const serializeReadingReward = (
  row: Row<{
    chapterId: string
    mediaId: string
    number: number
    pages: number
    points: number
    createdAt: Timestamp
  }>,
) => ({
  chapterId: row.chapterId,
  mediaId: row.mediaId,
  chapterNumber: row.number,
  pages: row.pages,
  points: row.points,
  creditedAt: row.createdAt,
})

export const serializeRankingResult = (
  row: Row<{
    kind: string
    startsAt: Timestamp
    endsAt: Timestamp
    rank: number
    chapters: number
    pages: number
    points: number
  }>,
) => ({
  period: row.kind,
  startsAt: row.startsAt,
  endsAt: row.endsAt,
  rank: row.rank,
  chapters: row.chapters,
  pages: row.pages,
  points: row.points,
})

export const serializeCosmetic = (
  row: Row<{ kind: CosmeticKind; key: string; acquiredAt: Timestamp }>,
) => ({
  kind: row.kind,
  key: row.key,
  acquiredAt: row.acquiredAt,
})

export const serializeShopPurchase = (
  row: Row<{
    id: string
    type: string
    lootBox: string | null
    cosmeticKind: CosmeticKind
    cosmeticKey: string
    price: number
    refund: number
    duplicate: boolean
    createdAt: Timestamp
  }>,
) => ({
  id: row.id,
  type: row.type,
  lootBox: row.lootBox,
  cosmeticKind: row.cosmeticKind,
  cosmeticKey: row.cosmeticKey,
  price: row.price,
  refund: row.refund,
  duplicate: row.duplicate,
  purchasedAt: row.createdAt,
})

export const serializeSession = (
  row: Row<{
    ipAddress: string | null
    userAgent: string | null
    impersonatedBy: string | null
    createdAt: Timestamp
    updatedAt: Timestamp
    expiresAt: Timestamp
  }>,
) => ({
  ipAddress: row.ipAddress,
  userAgent: row.userAgent,
  openedByStaff: row.impersonatedBy !== null,
  signedInAt: row.createdAt,
  lastActiveAt: row.updatedAt,
  expiresAt: row.expiresAt,
})

export const serializePushDevice = (
  row: Row<{
    userAgent: string | null
    locale: string
    createdAt: Timestamp
    updatedAt: Timestamp
  }>,
) => ({
  userAgent: row.userAgent,
  locale: row.locale,
  subscribedAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export const serializeUploadedChapter = (
  row: Row<{
    id: string
    mediaId: string
    mediaTitle: string | null
    number: number
    volume: string | null
    title: string | null
    language: string
    status: string
    createdAt: Timestamp
    deletedAt: Timestamp | null
  }>,
) => ({
  id: row.id,
  mediaId: row.mediaId,
  mediaTitle: row.mediaTitle,
  number: row.number,
  volume: row.volume,
  title: row.title,
  language: row.language,
  status: row.status,
  uploadedAt: row.createdAt,
  deletedAt: row.deletedAt,
})
