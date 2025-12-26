/**
 * Prisma Zod Generator - Single File (inlined)
 * Auto-generated. Do not edit.
 */

import * as z from 'zod';
// File: TransactionIsolationLevel.schema.ts

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted', 'ReadCommitted', 'RepeatableRead', 'Serializable'])

export type TransactionIsolationLevel = z.infer<typeof TransactionIsolationLevelSchema>;

// File: GroupScalarFieldEnum.schema.ts

export const GroupScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'name', 'description', 'logo', 'banner', 'website', 'discord', 'x', 'facebook', 'instagram', 'telegram', 'youtube', 'email', 'creatorId', 'deleterId'])

export type GroupScalarFieldEnum = z.infer<typeof GroupScalarFieldEnumSchema>;

// File: RelationLoadStrategy.schema.ts

export const RelationLoadStrategySchema = z.enum(['query', 'join'])

export type RelationLoadStrategy = z.infer<typeof RelationLoadStrategySchema>;

// File: MediaScalarFieldEnum.schema.ts

export const MediaScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'startDate', 'endDate', 'synopsis', 'contentRating', 'type', 'status', 'source', 'demography', 'countryOfOrigin', 'tags', 'flag', 'links', 'creatorId', 'deleterId'])

export type MediaScalarFieldEnum = z.infer<typeof MediaScalarFieldEnumSchema>;

// File: CoverScalarFieldEnum.schema.ts

export const CoverScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'volume', 'contentRating', 'isMainCover', 'language', 'mediaId', 'uploaderId', 'deleterId'])

export type CoverScalarFieldEnum = z.infer<typeof CoverScalarFieldEnumSchema>;

// File: BannerScalarFieldEnum.schema.ts

export const BannerScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'contentRating', 'mediaId', 'uploaderId', 'deleterId'])

export type BannerScalarFieldEnum = z.infer<typeof BannerScalarFieldEnumSchema>;

// File: TitleScalarFieldEnum.schema.ts

export const TitleScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'title', 'language', 'priority', 'isAcronym', 'isMainTitle', 'mediaId', 'creatorId', 'deleterId'])

export type TitleScalarFieldEnum = z.infer<typeof TitleScalarFieldEnumSchema>;

// File: ChapterScalarFieldEnum.schema.ts

export const ChapterScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'title', 'number', 'volume', 'language', 'pages', 'contentRating', 'flag', 'mediaId', 'uploaderId', 'deleterId'])

export type ChapterScalarFieldEnum = z.infer<typeof ChapterScalarFieldEnumSchema>;

// File: StaffScalarFieldEnum.schema.ts

export const StaffScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'deletedAt', 'name', 'bio', 'links', 'image', 'creatorId', 'deleterId'])

export type StaffScalarFieldEnum = z.infer<typeof StaffScalarFieldEnumSchema>;

// File: StaffOnMediaScalarFieldEnum.schema.ts

export const StaffOnMediaScalarFieldEnumSchema = z.enum(['mediaId', 'staffId', 'role'])

export type StaffOnMediaScalarFieldEnum = z.infer<typeof StaffOnMediaScalarFieldEnumSchema>;

// File: TaskScalarFieldEnum.schema.ts

export const TaskScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'type', 'status', 'payload', 'sessionId'])

export type TaskScalarFieldEnum = z.infer<typeof TaskScalarFieldEnumSchema>;

// File: UserScalarFieldEnum.schema.ts

export const UserScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'name', 'username', 'displayUsername', 'email', 'emailVerified', 'normalizedEmail', 'image', 'banned', 'banReason', 'banExpires', 'role', 'settings'])

export type UserScalarFieldEnum = z.infer<typeof UserScalarFieldEnumSchema>;

// File: UserProfileScalarFieldEnum.schema.ts

export const UserProfileScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'banner', 'birthDate', 'gender', 'city', 'country', 'about', 'points', 'userId'])

export type UserProfileScalarFieldEnum = z.infer<typeof UserProfileScalarFieldEnumSchema>;

// File: UserLibraryScalarFieldEnum.schema.ts

export const UserLibraryScalarFieldEnumSchema = z.enum(['reading', 'rereading', 'planToRead', 'completed', 'onHold', 'dropped', 'userId'])

export type UserLibraryScalarFieldEnum = z.infer<typeof UserLibraryScalarFieldEnumSchema>;

// File: UserHistoryScalarFieldEnum.schema.ts

export const UserHistoryScalarFieldEnumSchema = z.enum(['progression', 'mediaId', 'userId'])

export type UserHistoryScalarFieldEnum = z.infer<typeof UserHistoryScalarFieldEnumSchema>;

// File: AccountScalarFieldEnum.schema.ts

export const AccountScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'accessToken', 'refreshToken', 'accessTokenExpiresAt', 'refreshTokenExpiresAt', 'scope', 'password', 'idToken', 'accountId', 'providerId', 'userId'])

export type AccountScalarFieldEnum = z.infer<typeof AccountScalarFieldEnumSchema>;

// File: SessionScalarFieldEnum.schema.ts

export const SessionScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'expiresAt', 'token', 'ipAddress', 'userAgent', 'impersonatedBy', 'userId'])

export type SessionScalarFieldEnum = z.infer<typeof SessionScalarFieldEnumSchema>;

// File: VerificationScalarFieldEnum.schema.ts

export const VerificationScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'expiresAt', 'identifier', 'value'])

export type VerificationScalarFieldEnum = z.infer<typeof VerificationScalarFieldEnumSchema>;

// File: SortOrder.schema.ts

export const SortOrderSchema = z.enum(['asc', 'desc'])

export type SortOrder = z.infer<typeof SortOrderSchema>;

// File: JsonNullValueInput.schema.ts

export const JsonNullValueInputSchema = z.enum(['JsonNull'])

export type JsonNullValueInput = z.infer<typeof JsonNullValueInputSchema>;

// File: QueryMode.schema.ts

export const QueryModeSchema = z.enum(['default', 'insensitive'])

export type QueryMode = z.infer<typeof QueryModeSchema>;

// File: NullsOrder.schema.ts

export const NullsOrderSchema = z.enum(['first', 'last'])

export type NullsOrder = z.infer<typeof NullsOrderSchema>;

// File: JsonNullValueFilter.schema.ts

export const JsonNullValueFilterSchema = z.enum(['DbNull', 'JsonNull', 'AnyNull'])

export type JsonNullValueFilter = z.infer<typeof JsonNullValueFilterSchema>;

// File: ContentRating.schema.ts

export const ContentRatingSchema = z.enum(['NORMAL', 'SUGGESTIVE', 'NSFW', 'NSFL'])

export type ContentRating = z.infer<typeof ContentRatingSchema>;

// File: MediaType.schema.ts

export const MediaTypeSchema = z.enum(['MANGA', 'MANHWA', 'MANHUA', 'LIGHT_NOVEL', 'OTHER'])

export type MediaType = z.infer<typeof MediaTypeSchema>;

// File: MediaStatus.schema.ts

export const MediaStatusSchema = z.enum(['RELEASING', 'FINISHED', 'NOT_YET_RELEASED', 'CANCELLED', 'HIATUS'])

export type MediaStatus = z.infer<typeof MediaStatusSchema>;

// File: MediaSource.schema.ts

export const MediaSourceSchema = z.enum(['ORIGINAL', 'LIGHT_NOVEL', 'VISUAL_NOVEL', 'WEB_NOVEL', 'VIDEO_GAME'])

export type MediaSource = z.infer<typeof MediaSourceSchema>;

// File: MediaDemography.schema.ts

export const MediaDemographySchema = z.enum(['SHOUNEN', 'SHOUJO', 'SEINEN', 'JOSEI'])

export type MediaDemography = z.infer<typeof MediaDemographySchema>;

// File: MediaCountryOfOrigin.schema.ts

export const MediaCountryOfOriginSchema = z.enum(['JAPAN', 'KOREA', 'CHINA', 'USA', 'FRANCE', 'BRAZIL'])

export type MediaCountryOfOrigin = z.infer<typeof MediaCountryOfOriginSchema>;

// File: Flag.schema.ts

export const FlagSchema = z.enum(['OK', 'STAFF_ONLY', 'VIP_ONLY', 'LOCKED'])

export type Flag = z.infer<typeof FlagSchema>;

// File: Languages.schema.ts

export const LanguagesSchema = z.enum(['ab', 'aa', 'af', 'ak', 'sq', 'am', 'ar', 'an', 'hy', 'as', 'av', 'ae', 'ay', 'az', 'bm', 'ba', 'eu', 'be', 'bn', 'bi', 'bs', 'br', 'bg', 'my', 'ca', 'ch', 'ce', 'ny', 'cu', 'cv', 'kw', 'co', 'cr', 'hr', 'cs', 'da', 'dv', 'nl', 'dz', 'en', 'eo', 'et', 'ee', 'fo', 'fj', 'fi', 'fr', 'fy', 'ff', 'gd', 'gl', 'lg', 'ka', 'de', 'el', 'kl', 'gn', 'gu', 'ht', 'ha', 'he', 'hz', 'hi', 'ho', 'hu', 'is', 'io', 'ig', 'id', 'ia', 'ie', 'iu', 'ik', 'ga', 'it', 'jv', 'kn', 'kr', 'ks', 'kk', 'km', 'ki', 'rw', 'ky', 'kv', 'kg', 'kj', 'ku', 'lo', 'la', 'lv', 'li', 'ln', 'lt', 'lu', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'gv', 'mi', 'mr', 'mh', 'mn', 'na', 'nv', 'nd', 'nr', 'ng', 'ne', 'no', 'nb', 'nn', 'ii', 'oc', 'oj', 'or', 'om', 'os', 'pi', 'ps', 'fa', 'pl', 'pa', 'qu', 'ro', 'rm', 'rn', 'ru', 'se', 'sm', 'sg', 'sa', 'sc', 'sr', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'st', 'su', 'sw', 'ss', 'sv', 'tl', 'ty', 'tg', 'ta', 'tt', 'te', 'th', 'bo', 'ti', 'to', 'ts', 'tn', 'tr', 'tk', 'tw', 'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'cy', 'wo', 'xh', 'yi', 'yo', 'za', 'zu', 'es', 'es_la', 'pt_br', 'pt_pt', 'ja', 'ja_ro', 'ko', 'ko_ro', 'zh', 'zh_hk', 'zh_ro'])

export type Languages = z.infer<typeof LanguagesSchema>;

// File: StaffRole.schema.ts

export const StaffRoleSchema = z.enum(['AUTHOR', 'ARTIST'])

export type StaffRole = z.infer<typeof StaffRoleSchema>;

// File: TaskType.schema.ts

export const TaskTypeSchema = z.enum(['CREATE_MEDIA', 'IMPORT_MEDIA', 'IMPORT_COVER', 'IMPORT_CHAPTER', 'UPLOAD_CHAPTER', 'UPLOAD_COVER', 'UPLOAD_BANNER'])

export type TaskType = z.infer<typeof TaskTypeSchema>;

// File: TaskStatus.schema.ts

export const TaskStatusSchema = z.enum(['PENDING', 'DOWNLOADING', 'UPLOADING', 'FINISHED', 'FAILED'])

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// File: Roles.schema.ts

export const RolesSchema = z.enum(['USER', 'MODERATOR', 'UPLOADER_INTERN', 'UPLOADER', 'ADMIN'])

export type Roles = z.infer<typeof RolesSchema>;

// File: Genders.schema.ts

export const GendersSchema = z.enum(['MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED'])

export type Genders = z.infer<typeof GendersSchema>;

// File: Countries.schema.ts

export const CountriesSchema = z.enum(['ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'ao', 'aq', 'ar', 'as', 'at', 'au', 'aw', 'ax', 'az', 'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bl', 'bm', 'bn', 'bo', 'bq', 'br', 'bs', 'bt', 'bv', 'bw', 'by', 'bz', 'ca', 'cc', 'cd', 'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn', 'co', 'cr', 'cu', 'cv', 'cw', 'cx', 'cy', 'cz', 'de', 'dj', 'dk', 'dm', 'do', 'dz', 'ec', 'ee', 'eg', 'eh', 'er', 'es', 'et', 'fi', 'fj', 'fk', 'fm', 'fo', 'fr', 'ga', 'gb', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt', 'gu', 'gw', 'gy', 'hk', 'hm', 'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il', 'im', 'in', 'io', 'iq', 'ir', 'is', 'it', 'je', 'jm', 'jo', 'jp', 'ke', 'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc', 'li', 'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md', 'me', 'mf', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr', 'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne', 'nf', 'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu', 'nz', 'om', 'pa', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl', 'pm', 'pn', 'pr', 'ps', 'pt', 'pw', 'py', 'qa', 're', 'ro', 'rs', 'ru', 'rw', 'sa', 'sb', 'sc', 'sd', 'se', 'sg', 'sh', 'si', 'sj', 'sk', 'sl', 'sm', 'sn', 'so', 'sr', 'ss', 'st', 'sv', 'sx', 'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk', 'tl', 'tm', 'tn', 'to', 'tr', 'tt', 'tv', 'tw', 'tz', 'ua', 'ug', 'um', 'us', 'uy', 'uz', 'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu', 'wf', 'ws', 'xk', 'ye', 'yt', 'za', 'zm', 'zw'])

export type Countries = z.infer<typeof CountriesSchema>;

// File: GroupMemberRoles.schema.ts

export const GroupMemberRolesSchema = z.enum(['OWNER', 'ADMIN', 'TRANSLATOR', 'PROOFREADER', 'CLEANER', 'REDRAWER', 'TYPESETTER', 'QUALITY_CHECKER', 'RAW_PROVIDER', 'OTHER'])

export type GroupMemberRoles = z.infer<typeof GroupMemberRolesSchema>;

// File: GroupMemberPermissions.schema.ts

export const GroupMemberPermissionsSchema = z.enum(['UPLOAD', 'EDIT', 'DELETE'])

export type GroupMemberPermissions = z.infer<typeof GroupMemberPermissionsSchema>;

// File: Group.schema.ts

export const GroupSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  name: z.string(),
  description: z.string().nullish(),
  logo: z.string().nullish(),
  banner: z.string().nullish(),
  website: z.string().nullish(),
  discord: z.string().nullish(),
  x: z.string().nullish(),
  facebook: z.string().nullish(),
  instagram: z.string().nullish(),
  telegram: z.string().nullish(),
  youtube: z.string().nullish(),
  email: z.string().nullish(),
  creatorId: z.string(),
  deleterId: z.string().nullish(),
});

export type GroupType = z.infer<typeof GroupSchema>;


// File: Media.schema.ts

export const MediaSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  startDate: z.date().nullish(),
  endDate: z.date().nullish(),
  synopsis: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("{}"),
  contentRating: ContentRatingSchema.default("NORMAL"),
  type: MediaTypeSchema,
  status: MediaStatusSchema,
  source: MediaSourceSchema,
  demography: MediaDemographySchema,
  countryOfOrigin: MediaCountryOfOriginSchema,
  tags: z.array(z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10")),
  flag: FlagSchema.default("OK"),
  links: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("{}"),
  creatorId: z.string(),
  deleterId: z.string().nullish(),
});

export type MediaModel = z.infer<typeof MediaSchema>;

// File: Cover.schema.ts

export const CoverSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  volume: z.string().nullish(),
  contentRating: ContentRatingSchema.default("NORMAL"),
  isMainCover: z.boolean(),
  language: LanguagesSchema,
  mediaId: z.string(),
  uploaderId: z.string(),
  deleterId: z.string().nullish(),
});

export type CoverType = z.infer<typeof CoverSchema>;


// File: Banner.schema.ts

export const BannerSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  contentRating: ContentRatingSchema.default("NORMAL"),
  mediaId: z.string(),
  uploaderId: z.string(),
  deleterId: z.string().nullish(),
});

export type BannerType = z.infer<typeof BannerSchema>;


// File: Title.schema.ts

export const TitleSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  title: z.string(),
  language: LanguagesSchema,
  priority: z.number().int(),
  isAcronym: z.boolean(),
  isMainTitle: z.boolean(),
  mediaId: z.string(),
  creatorId: z.string(),
  deleterId: z.string().nullish(),
});

export type TitleType = z.infer<typeof TitleSchema>;


// File: Chapter.schema.ts

export const ChapterSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  title: z.string().nullish(),
  number: z.number(),
  volume: z.string().nullish(),
  language: LanguagesSchema,
  pages: z.array(z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10")),
  contentRating: ContentRatingSchema.default("NORMAL"),
  flag: FlagSchema.default("OK"),
  mediaId: z.string(),
  uploaderId: z.string(),
  deleterId: z.string().nullish(),
});

export type ChapterType = z.infer<typeof ChapterSchema>;


// File: Staff.schema.ts

export const StaffSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  name: z.string(),
  bio: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("{}"),
  links: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("{}"),
  image: z.string().nullish(),
  creatorId: z.string(),
  deleterId: z.string().nullish(),
});

export type StaffType = z.infer<typeof StaffSchema>;


// File: StaffOnMedia.schema.ts

export const StaffOnMediaSchema = z.object({
  mediaId: z.string(),
  staffId: z.string(),
  role: StaffRoleSchema,
});

export type StaffOnMediaType = z.infer<typeof StaffOnMediaSchema>;


// File: Task.schema.ts

export const TaskSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  type: TaskTypeSchema,
  status: TaskStatusSchema,
  payload: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  sessionId: z.string(),
});

export type TaskModel = z.infer<typeof TaskSchema>;

// File: User.schema.ts

export const UserSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  username: z.string(),
  displayUsername: z.string(),
  email: z.string().nullish(),
  emailVerified: z.boolean(),
  normalizedEmail: z.string().nullish(),
  image: z.string().nullish(),
  banned: z.boolean().nullish(),
  banReason: z.string().nullish(),
  banExpires: z.date().nullish(),
  role: RolesSchema.default("USER"),
  settings: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("{}"),
});

export type UserType = z.infer<typeof UserSchema>;


// File: UserProfile.schema.ts

export const UserProfileSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  banner: z.string().nullish(),
  birthDate: z.date().nullish(),
  gender: GendersSchema.default("NOT_SPECIFIED"),
  city: z.string().nullish(),
  country: CountriesSchema.nullish(),
  about: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("{}"),
  points: z.number().int(),
  userId: z.string(),
});

export type UserProfileType = z.infer<typeof UserProfileSchema>;


// File: UserLibrary.schema.ts

export const UserLibrarySchema = z.object({
  reading: z.array(z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10")),
  rereading: z.array(z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10")),
  planToRead: z.array(z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10")),
  completed: z.array(z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10")),
  onHold: z.array(z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10")),
  dropped: z.array(z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10")),
  userId: z.string(),
});

export type UserLibraryType = z.infer<typeof UserLibrarySchema>;


// File: UserHistory.schema.ts

export const UserHistorySchema = z.object({
  progression: z.array(z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10")),
  mediaId: z.string(),
  userId: z.string(),
});

export type UserHistoryType = z.infer<typeof UserHistorySchema>;


// File: Account.schema.ts

export const AccountSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  accessToken: z.string().nullish(),
  refreshToken: z.string().nullish(),
  accessTokenExpiresAt: z.date().nullish(),
  refreshTokenExpiresAt: z.date().nullish(),
  scope: z.string().nullish(),
  password: z.string().nullish(),
  idToken: z.string().nullish(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
});

export type AccountType = z.infer<typeof AccountSchema>;


// File: Session.schema.ts

export const SessionSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date(),
  token: z.string(),
  ipAddress: z.string().nullish(),
  userAgent: z.string().nullish(),
  impersonatedBy: z.string().nullish(),
  userId: z.string(),
});

export type SessionType = z.infer<typeof SessionSchema>;


// File: Verification.schema.ts

export const VerificationSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date(),
  identifier: z.string(),
  value: z.string(),
});

export type VerificationType = z.infer<typeof VerificationSchema>;

