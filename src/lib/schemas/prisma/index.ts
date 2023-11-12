import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','name','email','emailVerified','image','role']);

export const UserSettingScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','birthDate','gender','city','country','about','contentRating','preferredTitleLanguage','userId']);

export const AccountScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','type','refresh_token','access_token','expires_at','token_type','scope','id_token','session_state','provider','providerAccountId','userId']);

export const SessionScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','sessionToken','expires','userId']);

export const VerificationTokenScalarFieldEnumSchema = z.enum(['identifier','token','expires']);

export const MediaScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','startDate','endDate','synopsis','contentRating','oneShot','trailer','type','status','source','demography','countryOfOrigin','flag','creatorId','deleterId']);

export const MediaCoverScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','volume','contentRating','mediaId','uploaderId','deleterId']);

export const MediaBannerScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','contentRating','mediaId','uploaderId','deleterId']);

export const MediaTitleScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','title','language','isAcronym','mediaId','creatorId','deleterId']);

export const MediaTagScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','isSpoiler','tagId','mediaId','creatorId','deleterId']);

export const MediaTrackerScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','tracker','externalId','mediaId','creatorId','deleterId']);

export const MediaChapterScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','title','number','volume','language','pages','contentRating','flag','mediaId','uploaderId','deleterId']);

export const MediaChapterCommentScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','content','attachments','parentId','mediaChapterId','userId','deleterId']);

export const TagScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','name','description','category','contentRating','alId','creatorId','deleterId']);

export const UploadSessionScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','status','type','userId','mediaId','mediaChapterId']);

export const ScanScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','name','description','logo','banner','website','discord','twitter','facebook','instagram','telegram','youtube','email','creatorId','deleterId']);

export const ScanMemberScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','roles','permissions','userId']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const RolesSchema = z.enum(['USER','MODERATOR','UPLOADER_INTERN','UPLOADER','ADMIN']);

export type RolesType = `${z.infer<typeof RolesSchema>}`

export const GendersSchema = z.enum(['MALE','FEMALE','OTHER']);

export type GendersType = `${z.infer<typeof GendersSchema>}`

export const ContentRatingSchema = z.enum(['NORMAL','SUGGESTIVE','NSFW','NSFL']);

export type ContentRatingType = `${z.infer<typeof ContentRatingSchema>}`

export const FlagSchema = z.enum(['OK','STAFF_ONLY','VIP_ONLY','LOCKED']);

export type FlagType = `${z.infer<typeof FlagSchema>}`

export const MediaTypeSchema = z.enum(['MANGA','MANHWA','MANHUA','LIGHT_NOVEL','OTHER']);

export type MediaTypeType = `${z.infer<typeof MediaTypeSchema>}`

export const MediaStatusSchema = z.enum(['RELEASING','FINISHED','NOT_YET_RELEASED','CANCELLED','HIATUS']);

export type MediaStatusType = `${z.infer<typeof MediaStatusSchema>}`

export const MediaSourceSchema = z.enum(['ORIGINAL','LIGHT_NOVEL','VISUAL_NOVEL','WEB_NOVEL','VIDEO_GAME']);

export type MediaSourceType = `${z.infer<typeof MediaSourceSchema>}`

export const MediaDemographySchema = z.enum(['SHOUNEN','SHOUJO','SEINEN','JOSEI']);

export type MediaDemographyType = `${z.infer<typeof MediaDemographySchema>}`

export const MediaCountryOfOriginSchema = z.enum(['JAPAN','KOREA','CHINA','USA','FRANCE','BRAZIL']);

export type MediaCountryOfOriginType = `${z.infer<typeof MediaCountryOfOriginSchema>}`

export const TrackersSchema = z.enum(['MANGADEX','MYANIMELIST','ANILIST']);

export type TrackersType = `${z.infer<typeof TrackersSchema>}`

export const ScanMemberRolesSchema = z.enum(['OWNER','ADMIN','TRANSLATOR','PROOFREADER','CLEANER','REDRAWER','TYPESETTER','QUALITY_CHECKER','RAW_PROVIDER','OTHER']);

export type ScanMemberRolesType = `${z.infer<typeof ScanMemberRolesSchema>}`

export const ScanMemberPermissionsSchema = z.enum(['UPLOAD','EDIT','DELETE']);

export type ScanMemberPermissionsType = `${z.infer<typeof ScanMemberPermissionsSchema>}`

export const UploadSessionStatusSchema = z.enum(['UPLOADING','PROCESSING','FINISHED','FAILED']);

export type UploadSessionStatusType = `${z.infer<typeof UploadSessionStatusSchema>}`

export const UploadSessionTypeSchema = z.enum(['COVER','BANNER','CHAPTER']);

export type UploadSessionTypeType = `${z.infer<typeof UploadSessionTypeSchema>}`

export const LanguagesSchema = z.enum(['ab','aa','af','ak','sq','am','ar','an','hy','as','av','ae','ay','az','bm','ba','eu','be','bn','bi','bs','br','bg','my','ca','ch','ce','ny','cu','cv','kw','co','cr','hr','cs','da','dv','nl','dz','en','eo','et','ee','fo','fj','fi','fr','fy','ff','gd','gl','lg','ka','de','el','kl','gn','gu','ht','ha','he','hz','hi','ho','hu','is','io','ig','id','ia','ie','iu','ik','ga','it','jv','kn','kr','ks','kk','km','ki','rw','ky','kv','kg','kj','ku','lo','la','lv','li','ln','lt','lu','lb','mk','mg','ms','ml','mt','gv','mi','mr','mh','mn','na','nv','nd','nr','ng','ne','no','nb','nn','ii','oc','oj','or','om','os','pi','ps','fa','pl','pa','qu','ro','rm','rn','ru','se','sm','sg','sa','sc','sr','sn','sd','si','sk','sl','so','st','su','sw','ss','sv','tl','ty','tg','ta','tt','te','th','bo','ti','to','ts','tn','tr','tk','tw','ug','uk','ur','uz','ve','vi','vo','wa','cy','wo','xh','yi','yo','za','zu','es','es_la','pt_br','pt_pt','ja','ja_ro','ko','ko_ro','zh','zh_hk']);

export type LanguagesType = `${z.infer<typeof LanguagesSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  role: RolesSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  emailVerified: z.coerce.date().nullable(),
  image: z.string().nullable(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// USER SETTING SCHEMA
/////////////////////////////////////////

export const UserSettingSchema = z.object({
  gender: GendersSchema,
  contentRating: ContentRatingSchema,
  preferredTitleLanguage: LanguagesSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  birthDate: z.coerce.date().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  about: z.string().nullable(),
  userId: z.string(),
})

export type UserSetting = z.infer<typeof UserSettingSchema>

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  type: z.string(),
  refresh_token: z.string().nullable(),
  access_token: z.string().nullable(),
  expires_at: z.number().int().nullable(),
  token_type: z.string().nullable(),
  scope: z.string().nullable(),
  id_token: z.string().nullable(),
  session_state: z.string().nullable(),
  provider: z.string(),
  providerAccountId: z.string(),
  userId: z.string(),
})

export type Account = z.infer<typeof AccountSchema>

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  sessionToken: z.string(),
  expires: z.coerce.date(),
  userId: z.string(),
})

export type Session = z.infer<typeof SessionSchema>

/////////////////////////////////////////
// VERIFICATION TOKEN SCHEMA
/////////////////////////////////////////

export const VerificationTokenSchema = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.coerce.date(),
})

export type VerificationToken = z.infer<typeof VerificationTokenSchema>

/////////////////////////////////////////
// MEDIA SCHEMA
/////////////////////////////////////////

export const MediaSchema = z.object({
  contentRating: ContentRatingSchema,
  type: MediaTypeSchema,
  status: MediaStatusSchema,
  source: MediaSourceSchema,
  demography: MediaDemographySchema,
  countryOfOrigin: MediaCountryOfOriginSchema,
  flag: FlagSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  startDate: z.coerce.date().nullable(),
  endDate: z.coerce.date().nullable(),
  synopsis: z.string().nullable(),
  oneShot: z.boolean(),
  trailer: z.string().nullable(),
  creatorId: z.string(),
  deleterId: z.string().nullable(),
})

export type Media = z.infer<typeof MediaSchema>

/////////////////////////////////////////
// MEDIA COVER SCHEMA
/////////////////////////////////////////

export const MediaCoverSchema = z.object({
  contentRating: ContentRatingSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  volume: z.number().int().nullable(),
  mediaId: z.string(),
  uploaderId: z.string(),
  deleterId: z.string().nullable(),
})

export type MediaCover = z.infer<typeof MediaCoverSchema>

/////////////////////////////////////////
// MEDIA BANNER SCHEMA
/////////////////////////////////////////

export const MediaBannerSchema = z.object({
  contentRating: ContentRatingSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  mediaId: z.string(),
  uploaderId: z.string(),
  deleterId: z.string().nullable(),
})

export type MediaBanner = z.infer<typeof MediaBannerSchema>

/////////////////////////////////////////
// MEDIA TITLE SCHEMA
/////////////////////////////////////////

export const MediaTitleSchema = z.object({
  language: LanguagesSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  title: z.string(),
  isAcronym: z.boolean(),
  mediaId: z.string(),
  creatorId: z.string(),
  deleterId: z.string().nullable(),
})

export type MediaTitle = z.infer<typeof MediaTitleSchema>

/////////////////////////////////////////
// MEDIA TAG SCHEMA
/////////////////////////////////////////

export const MediaTagSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  isSpoiler: z.boolean(),
  tagId: z.string(),
  mediaId: z.string(),
  creatorId: z.string(),
  deleterId: z.string().nullable(),
})

export type MediaTag = z.infer<typeof MediaTagSchema>

/////////////////////////////////////////
// MEDIA TRACKER SCHEMA
/////////////////////////////////////////

export const MediaTrackerSchema = z.object({
  tracker: TrackersSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  externalId: z.string(),
  mediaId: z.string(),
  creatorId: z.string(),
  deleterId: z.string().nullable(),
})

export type MediaTracker = z.infer<typeof MediaTrackerSchema>

/////////////////////////////////////////
// MEDIA CHAPTER SCHEMA
/////////////////////////////////////////

export const MediaChapterSchema = z.object({
  language: LanguagesSchema,
  contentRating: ContentRatingSchema,
  flag: FlagSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  title: z.string().nullable(),
  number: z.number().int(),
  volume: z.number().int().nullable(),
  /**
   * [MediaChapterPage]
   */
  pages: JsonValueSchema.array().nullable(),
  mediaId: z.string(),
  uploaderId: z.string(),
  deleterId: z.string().nullable(),
})

export type MediaChapter = z.infer<typeof MediaChapterSchema>

/////////////////////////////////////////
// MEDIA CHAPTER COMMENT SCHEMA
/////////////////////////////////////////

export const MediaChapterCommentSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  content: z.string(),
  /**
   * [MediaCommentAttachement]
   */
  attachments: JsonValueSchema.array().nullable(),
  parentId: z.string().nullable(),
  mediaChapterId: z.string(),
  userId: z.string(),
  deleterId: z.string().nullable(),
})

export type MediaChapterComment = z.infer<typeof MediaChapterCommentSchema>

/////////////////////////////////////////
// TAG SCHEMA
/////////////////////////////////////////

export const TagSchema = z.object({
  contentRating: ContentRatingSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  alId: z.number().int(),
  creatorId: z.string(),
  deleterId: z.string().nullable(),
})

export type Tag = z.infer<typeof TagSchema>

/////////////////////////////////////////
// UPLOAD SESSION SCHEMA
/////////////////////////////////////////

export const UploadSessionSchema = z.object({
  status: UploadSessionStatusSchema,
  type: UploadSessionTypeSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  userId: z.string(),
  mediaId: z.string(),
  mediaChapterId: z.string().nullable(),
})

export type UploadSession = z.infer<typeof UploadSessionSchema>

/////////////////////////////////////////
// SCAN SCHEMA
/////////////////////////////////////////

export const ScanSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  logo: z.string().nullable(),
  banner: z.string().nullable(),
  website: z.string().nullable(),
  discord: z.string().nullable(),
  twitter: z.string().nullable(),
  facebook: z.string().nullable(),
  instagram: z.string().nullable(),
  telegram: z.string().nullable(),
  youtube: z.string().nullable(),
  email: z.string().nullable(),
  creatorId: z.string(),
  deleterId: z.string().nullable(),
})

export type Scan = z.infer<typeof ScanSchema>

/////////////////////////////////////////
// SCAN MEMBER SCHEMA
/////////////////////////////////////////

export const ScanMemberSchema = z.object({
  roles: ScanMemberRolesSchema.array(),
  permissions: ScanMemberPermissionsSchema.array(),
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  userId: z.string(),
})

export type ScanMember = z.infer<typeof ScanMemberSchema>
