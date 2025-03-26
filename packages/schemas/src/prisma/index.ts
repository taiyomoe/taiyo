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

export const UserScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','name','username','displayUsername','email','emailVerified','normalizedEmail','image','banned','banReason','banExpires','role','settings']);

export const RelationLoadStrategySchema = z.enum(['query','join']);

export const UserProfileScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','banner','birthDate','gender','city','country','about','points','userId']);

export const UserLibraryScalarFieldEnumSchema = z.enum(['reading','rereading','planToRead','completed','onHold','dropped','userId']);

export const UserHistoryScalarFieldEnumSchema = z.enum(['progression','mediaId','userId']);

export const AccountScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','accessToken','refreshToken','accessTokenExpiresAt','refreshTokenExpiresAt','scope','password','idToken','accountId','providerId','userId']);

export const SessionScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','expiresAt','token','ipAddress','userAgent','impersonatedBy','userId']);

export const VerificationScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','expiresAt','identifier','value']);

export const MediaScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','startDate','endDate','synopsis','contentRating','oneShot','trailer','type','status','source','demography','countryOfOrigin','genres','tags','flag','creatorId','deleterId']);

export const CoverScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','volume','contentRating','isMainCover','language','mediaId','uploaderId','deleterId']);

export const BannerScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','contentRating','mediaId','uploaderId','deleterId']);

export const TitleScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','title','language','priority','isAcronym','isMainTitle','mediaId','creatorId','deleterId']);

export const TrackerScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','tracker','externalId','mediaId','creatorId','deleterId']);

export const ChapterScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','title','number','volume','language','pages','contentRating','flag','mediaId','uploaderId','deleterId']);

export const GroupScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','name','description','logo','banner','website','discord','x','facebook','instagram','telegram','youtube','email','creatorId','deleterId']);

export const TaskScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','type','status','payload','sessionId']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const JsonNullValueInputSchema = z.enum(['JsonNull',]).transform((value) => (value === 'JsonNull' ? Prisma.JsonNull : value));

export const QueryModeSchema = z.enum(['default','insensitive']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.JsonNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const NullsOrderSchema = z.enum(['first','last']);

export const RolesSchema = z.enum(['USER','MODERATOR','UPLOADER_INTERN','UPLOADER','ADMIN']);

export type RolesType = `${z.infer<typeof RolesSchema>}`

export const GendersSchema = z.enum(['MALE','FEMALE','OTHER','NOT_SPECIFIED']);

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

export const MediaGenresSchema = z.enum(['ACTION','ADVENTURE','COMEDY','DRAMA','ECCHI','FANTASY','HENTAI','HORROR','MAHOU_SHOUJO','MECHA','MUSIC','MYSTERY','PSYCHOLOGICAL','ROMANCE','SCI_FI','SLICE_OF_LIFE','SPORTS','SUPERNATURAL','THRILLER']);

export type MediaGenresType = `${z.infer<typeof MediaGenresSchema>}`

export const TrackersSchema = z.enum(['MANGADEX','MYANIMELIST','ANILIST']);

export type TrackersType = `${z.infer<typeof TrackersSchema>}`

export const GroupMemberRolesSchema = z.enum(['OWNER','ADMIN','TRANSLATOR','PROOFREADER','CLEANER','REDRAWER','TYPESETTER','QUALITY_CHECKER','RAW_PROVIDER','OTHER']);

export type GroupMemberRolesType = `${z.infer<typeof GroupMemberRolesSchema>}`

export const GroupMemberPermissionsSchema = z.enum(['UPLOAD','EDIT','DELETE']);

export type GroupMemberPermissionsType = `${z.infer<typeof GroupMemberPermissionsSchema>}`

export const TaskTypeSchema = z.enum(['CREATE_MEDIA','IMPORT_MEDIA','IMPORT_COVER','IMPORT_CHAPTER','UPLOAD_CHAPTER','UPLOAD_COVER','UPLOAD_BANNER']);

export type TaskTypeType = `${z.infer<typeof TaskTypeSchema>}`

export const TaskStatusSchema = z.enum(['PENDING','DOWNLOADING','UPLOADING','FINISHED','FAILED']);

export type TaskStatusType = `${z.infer<typeof TaskStatusSchema>}`

export const LanguagesSchema = z.enum(['ab','aa','af','ak','sq','am','ar','an','hy','as','av','ae','ay','az','bm','ba','eu','be','bn','bi','bs','br','bg','my','ca','ch','ce','ny','cu','cv','kw','co','cr','hr','cs','da','dv','nl','dz','en','eo','et','ee','fo','fj','fi','fr','fy','ff','gd','gl','lg','ka','de','el','kl','gn','gu','ht','ha','he','hz','hi','ho','hu','is','io','ig','id','ia','ie','iu','ik','ga','it','jv','kn','kr','ks','kk','km','ki','rw','ky','kv','kg','kj','ku','lo','la','lv','li','ln','lt','lu','lb','mk','mg','ms','ml','mt','gv','mi','mr','mh','mn','na','nv','nd','nr','ng','ne','no','nb','nn','ii','oc','oj','or','om','os','pi','ps','fa','pl','pa','qu','ro','rm','rn','ru','se','sm','sg','sa','sc','sr','sn','sd','si','sk','sl','so','st','su','sw','ss','sv','tl','ty','tg','ta','tt','te','th','bo','ti','to','ts','tn','tr','tk','tw','ug','uk','ur','uz','ve','vi','vo','wa','cy','wo','xh','yi','yo','za','zu','es','es_la','pt_br','pt_pt','ja','ja_ro','ko','ko_ro','zh','zh_hk','zh_ro']);

export type LanguagesType = `${z.infer<typeof LanguagesSchema>}`

export const CountriesSchema = z.enum(['ad','ae','af','ag','ai','al','am','ao','aq','ar','as','at','au','aw','ax','az','ba','bb','bd','be','bf','bg','bh','bi','bj','bl','bm','bn','bo','bq','br','bs','bt','bv','bw','by','bz','ca','cc','cd','cf','cg','ch','ci','ck','cl','cm','cn','co','cr','cu','cv','cw','cx','cy','cz','de','dj','dk','dm','do','dz','ec','ee','eg','eh','er','es','et','fi','fj','fk','fm','fo','fr','ga','gb','gd','ge','gf','gg','gh','gi','gl','gm','gn','gp','gq','gr','gs','gt','gu','gw','gy','hk','hm','hn','hr','ht','hu','id','ie','il','im','in','io','iq','ir','is','it','je','jm','jo','jp','ke','kg','kh','ki','km','kn','kp','kr','kw','ky','kz','la','lb','lc','li','lk','lr','ls','lt','lu','lv','ly','ma','mc','md','me','mf','mg','mh','mk','ml','mm','mn','mo','mp','mq','mr','ms','mt','mu','mv','mw','mx','my','mz','na','nc','ne','nf','ng','ni','nl','no','np','nr','nu','nz','om','pa','pe','pf','pg','ph','pk','pl','pm','pn','pr','ps','pt','pw','py','qa','re','ro','rs','ru','rw','sa','sb','sc','sd','se','sg','sh','si','sj','sk','sl','sm','sn','so','sr','ss','st','sv','sx','sy','sz','tc','td','tf','tg','th','tj','tk','tl','tm','tn','to','tr','tt','tv','tw','tz','ua','ug','um','us','uy','uz','va','vc','ve','vg','vi','vn','vu','wf','ws','xk','ye','yt','za','zm','zw']);

export type CountriesType = `${z.infer<typeof CountriesSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  role: RolesSchema,
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  name: z.string(),
  username: z.string(),
  displayUsername: z.string(),
  email: z.string().nullable(),
  emailVerified: z.boolean(),
  normalizedEmail: z.string().nullable(),
  image: z.string().nullable(),
  banned: z.boolean().nullable(),
  banReason: z.string().nullable(),
  banExpires: z.coerce.date().nullable(),
  /**
   * [UserSettings]
   */
  settings: JsonValueSchema,
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// USER PROFILE SCHEMA
/////////////////////////////////////////

export const UserProfileSchema = z.object({
  gender: GendersSchema,
  country: CountriesSchema.nullable(),
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  banner: z.string().nullable(),
  birthDate: z.coerce.date().nullable(),
  city: z.string().nullable(),
  about: z.string().nullable(),
  points: z.number().int(),
  userId: z.string(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>

/////////////////////////////////////////
// USER LIBRARY SCHEMA
/////////////////////////////////////////

export const UserLibrarySchema = z.object({
  /**
   * [UserLibraryEntry]
   */
  reading: JsonValueSchema.array(),
  /**
   * [UserLibraryEntry]
   */
  rereading: JsonValueSchema.array(),
  /**
   * [UserLibraryEntry]
   */
  planToRead: JsonValueSchema.array(),
  /**
   * [UserLibraryEntry]
   */
  completed: JsonValueSchema.array(),
  /**
   * [UserLibraryEntry]
   */
  onHold: JsonValueSchema.array(),
  /**
   * [UserLibraryEntry]
   */
  dropped: JsonValueSchema.array(),
  userId: z.string(),
})

export type UserLibrary = z.infer<typeof UserLibrarySchema>

/////////////////////////////////////////
// USER HISTORY SCHEMA
/////////////////////////////////////////

export const UserHistorySchema = z.object({
  /**
   * [UserHistoryProgression]
   */
  progression: JsonValueSchema.array(),
  mediaId: z.string(),
  userId: z.string(),
})

export type UserHistory = z.infer<typeof UserHistorySchema>

/////////////////////////////////////////
// ACCOUNT SCHEMA
/////////////////////////////////////////

export const AccountSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  accessToken: z.string().nullable(),
  refreshToken: z.string().nullable(),
  accessTokenExpiresAt: z.coerce.date().nullable(),
  refreshTokenExpiresAt: z.coerce.date().nullable(),
  scope: z.string().nullable(),
  password: z.string().nullable(),
  idToken: z.string().nullable(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
})

export type Account = z.infer<typeof AccountSchema>

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  token: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  impersonatedBy: z.string().nullable(),
  userId: z.string(),
})

export type Session = z.infer<typeof SessionSchema>

/////////////////////////////////////////
// VERIFICATION SCHEMA
/////////////////////////////////////////

export const VerificationSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  identifier: z.string(),
  value: z.string(),
})

export type Verification = z.infer<typeof VerificationSchema>

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
  genres: MediaGenresSchema.array(),
  flag: FlagSchema,
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  startDate: z.coerce.date().nullable(),
  endDate: z.coerce.date().nullable(),
  synopsis: z.string().nullable(),
  oneShot: z.boolean(),
  trailer: z.string().nullable(),
  /**
   * [MediaTag]
   */
  tags: JsonValueSchema.array(),
  creatorId: z.string(),
  deleterId: z.string().nullable(),
})

export type Media = z.infer<typeof MediaSchema>

/////////////////////////////////////////
// COVER SCHEMA
/////////////////////////////////////////

export const CoverSchema = z.object({
  contentRating: ContentRatingSchema,
  language: LanguagesSchema,
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  volume: z.number().int().nullable(),
  isMainCover: z.boolean(),
  mediaId: z.string(),
  uploaderId: z.string(),
  deleterId: z.string().nullable(),
})

export type Cover = z.infer<typeof CoverSchema>

/////////////////////////////////////////
// BANNER SCHEMA
/////////////////////////////////////////

export const BannerSchema = z.object({
  contentRating: ContentRatingSchema,
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  mediaId: z.string(),
  uploaderId: z.string(),
  deleterId: z.string().nullable(),
})

export type Banner = z.infer<typeof BannerSchema>

/////////////////////////////////////////
// TITLE SCHEMA
/////////////////////////////////////////

export const TitleSchema = z.object({
  language: LanguagesSchema,
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  title: z.string(),
  priority: z.number().int(),
  isAcronym: z.boolean(),
  isMainTitle: z.boolean(),
  mediaId: z.string(),
  creatorId: z.string(),
  deleterId: z.string().nullable(),
})

export type Title = z.infer<typeof TitleSchema>

/////////////////////////////////////////
// TRACKER SCHEMA
/////////////////////////////////////////

export const TrackerSchema = z.object({
  tracker: TrackersSchema,
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  externalId: z.string(),
  mediaId: z.string(),
  creatorId: z.string(),
  deleterId: z.string().nullable(),
})

export type Tracker = z.infer<typeof TrackerSchema>

/////////////////////////////////////////
// CHAPTER SCHEMA
/////////////////////////////////////////

export const ChapterSchema = z.object({
  language: LanguagesSchema,
  contentRating: ContentRatingSchema,
  flag: FlagSchema,
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  title: z.string().nullable(),
  number: z.number(),
  volume: z.number().nullable(),
  /**
   * [MediaChapterPage]
   */
  pages: JsonValueSchema.array(),
  mediaId: z.string(),
  uploaderId: z.string(),
  deleterId: z.string().nullable(),
})

export type Chapter = z.infer<typeof ChapterSchema>

/////////////////////////////////////////
// GROUP SCHEMA
/////////////////////////////////////////

export const GroupSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  logo: z.string().nullable(),
  banner: z.string().nullable(),
  website: z.string().nullable(),
  discord: z.string().nullable(),
  x: z.string().nullable(),
  facebook: z.string().nullable(),
  instagram: z.string().nullable(),
  telegram: z.string().nullable(),
  youtube: z.string().nullable(),
  email: z.string().nullable(),
  creatorId: z.string(),
  deleterId: z.string().nullable(),
})

export type Group = z.infer<typeof GroupSchema>

/////////////////////////////////////////
// TASK SCHEMA
/////////////////////////////////////////

export const TaskSchema = z.object({
  type: TaskTypeSchema,
  status: TaskStatusSchema,
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  payload: JsonValueSchema,
  sessionId: z.string(),
})

export type Task = z.infer<typeof TaskSchema>
