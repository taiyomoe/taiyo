import { type Kysely, sql } from "kysely"

const LANGUAGES = [
  "ab",
  "aa",
  "af",
  "ak",
  "sq",
  "am",
  "ar",
  "an",
  "hy",
  "as",
  "av",
  "ae",
  "ay",
  "az",
  "bm",
  "ba",
  "eu",
  "be",
  "bn",
  "bi",
  "bs",
  "br",
  "bg",
  "my",
  "ca",
  "ch",
  "ce",
  "ny",
  "cu",
  "cv",
  "kw",
  "co",
  "cr",
  "hr",
  "cs",
  "da",
  "dv",
  "nl",
  "dz",
  "en",
  "eo",
  "et",
  "ee",
  "fo",
  "fj",
  "fi",
  "fr",
  "fy",
  "ff",
  "gd",
  "gl",
  "lg",
  "ka",
  "de",
  "el",
  "kl",
  "gn",
  "gu",
  "ht",
  "ha",
  "he",
  "hz",
  "hi",
  "ho",
  "hu",
  "is",
  "io",
  "ig",
  "id",
  "ia",
  "ie",
  "iu",
  "ik",
  "ga",
  "it",
  "jv",
  "kn",
  "kr",
  "ks",
  "kk",
  "km",
  "ki",
  "rw",
  "ky",
  "kv",
  "kg",
  "kj",
  "ku",
  "lo",
  "la",
  "lv",
  "li",
  "ln",
  "lt",
  "lu",
  "lb",
  "mk",
  "mg",
  "ms",
  "ml",
  "mt",
  "gv",
  "mi",
  "mr",
  "mh",
  "mn",
  "na",
  "nv",
  "nd",
  "nr",
  "ng",
  "ne",
  "no",
  "nb",
  "nn",
  "ii",
  "oc",
  "oj",
  "or",
  "om",
  "os",
  "pi",
  "ps",
  "fa",
  "pl",
  "pa",
  "qu",
  "ro",
  "rm",
  "rn",
  "ru",
  "se",
  "sm",
  "sg",
  "sa",
  "sc",
  "sr",
  "sn",
  "sd",
  "si",
  "sk",
  "sl",
  "so",
  "st",
  "su",
  "sw",
  "ss",
  "sv",
  "tl",
  "ty",
  "tg",
  "ta",
  "tt",
  "te",
  "th",
  "bo",
  "ti",
  "to",
  "ts",
  "tn",
  "tr",
  "tk",
  "tw",
  "ug",
  "uk",
  "ur",
  "uz",
  "ve",
  "vi",
  "vo",
  "wa",
  "cy",
  "wo",
  "xh",
  "yi",
  "yo",
  "za",
  "zu",
  "es",
  "es_la",
  "pt_br",
  "pt_pt",
  "ja",
  "ja_ro",
  "ko",
  "ko_ro",
  "zh",
  "zh_hk",
  "zh_ro",
] as const
const COUNTRIES = [
  "ad",
  "ae",
  "af",
  "ag",
  "ai",
  "al",
  "am",
  "ao",
  "aq",
  "ar",
  "as",
  "at",
  "au",
  "aw",
  "ax",
  "az",
  "ba",
  "bb",
  "bd",
  "be",
  "bf",
  "bg",
  "bh",
  "bi",
  "bj",
  "bl",
  "bm",
  "bn",
  "bo",
  "bq",
  "br",
  "bs",
  "bt",
  "bv",
  "bw",
  "by",
  "bz",
  "ca",
  "cc",
  "cd",
  "cf",
  "cg",
  "ch",
  "ci",
  "ck",
  "cl",
  "cm",
  "cn",
  "co",
  "cr",
  "cu",
  "cv",
  "cw",
  "cx",
  "cy",
  "cz",
  "de",
  "dj",
  "dk",
  "dm",
  "do",
  "dz",
  "ec",
  "ee",
  "eg",
  "eh",
  "er",
  "es",
  "et",
  "fi",
  "fj",
  "fk",
  "fm",
  "fo",
  "fr",
  "ga",
  "gb",
  "gd",
  "ge",
  "gf",
  "gg",
  "gh",
  "gi",
  "gl",
  "gm",
  "gn",
  "gp",
  "gq",
  "gr",
  "gs",
  "gt",
  "gu",
  "gw",
  "gy",
  "hk",
  "hm",
  "hn",
  "hr",
  "ht",
  "hu",
  "id",
  "ie",
  "il",
  "im",
  "in",
  "io",
  "iq",
  "ir",
  "is",
  "it",
  "je",
  "jm",
  "jo",
  "jp",
  "ke",
  "kg",
  "kh",
  "ki",
  "km",
  "kn",
  "kp",
  "kr",
  "kw",
  "ky",
  "kz",
  "la",
  "lb",
  "lc",
  "li",
  "lk",
  "lr",
  "ls",
  "lt",
  "lu",
  "lv",
  "ly",
  "ma",
  "mc",
  "md",
  "me",
  "mf",
  "mg",
  "mh",
  "mk",
  "ml",
  "mm",
  "mn",
  "mo",
  "mp",
  "mq",
  "mr",
  "ms",
  "mt",
  "mu",
  "mv",
  "mw",
  "mx",
  "my",
  "mz",
  "na",
  "nc",
  "ne",
  "nf",
  "ng",
  "ni",
  "nl",
  "no",
  "np",
  "nr",
  "nu",
  "nz",
  "om",
  "pa",
  "pe",
  "pf",
  "pg",
  "ph",
  "pk",
  "pl",
  "pm",
  "pn",
  "pr",
  "ps",
  "pt",
  "pw",
  "py",
  "qa",
  "re",
  "ro",
  "rs",
  "ru",
  "rw",
  "sa",
  "sb",
  "sc",
  "sd",
  "se",
  "sg",
  "sh",
  "si",
  "sj",
  "sk",
  "sl",
  "sm",
  "sn",
  "so",
  "sr",
  "ss",
  "st",
  "sv",
  "sx",
  "sy",
  "sz",
  "tc",
  "td",
  "tf",
  "tg",
  "th",
  "tj",
  "tk",
  "tl",
  "tm",
  "tn",
  "to",
  "tr",
  "tt",
  "tv",
  "tw",
  "tz",
  "ua",
  "ug",
  "um",
  "us",
  "uy",
  "uz",
  "va",
  "vc",
  "ve",
  "vg",
  "vi",
  "vn",
  "vu",
  "wf",
  "ws",
  "xk",
  "ye",
  "yt",
  "za",
  "zm",
  "zw",
] as const

export async function up(db: Kysely<any>): Promise<void> {
  // --- Enums
  await db.schema
    .createType("ContentRating")
    .asEnum(["NORMAL", "SUGGESTIVE", "NSFW", "NSFL"])
    .execute()
  await db.schema.createType("Flag").asEnum(["OK", "STAFF_ONLY", "VIP_ONLY", "LOCKED"]).execute()
  await db.schema
    .createType("Roles")
    .asEnum(["USER", "MODERATOR", "UPLOADER_INTERN", "UPLOADER", "ADMIN"])
    .execute()
  await db.schema
    .createType("Genders")
    .asEnum(["MALE", "FEMALE", "OTHER", "NOT_SPECIFIED"])
    .execute()
  await db.schema.createType("StaffRole").asEnum(["AUTHOR", "ARTIST"]).execute()
  await db.schema
    .createType("MediaType")
    .asEnum(["MANGA", "MANHWA", "MANHUA", "LIGHT_NOVEL", "OTHER"])
    .execute()
  await db.schema
    .createType("MediaStatus")
    .asEnum(["RELEASING", "FINISHED", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"])
    .execute()
  await db.schema
    .createType("MediaSource")
    .asEnum(["ORIGINAL", "LIGHT_NOVEL", "VISUAL_NOVEL", "WEB_NOVEL", "VIDEO_GAME"])
    .execute()
  await db.schema
    .createType("MediaDemography")
    .asEnum(["SHOUNEN", "SHOUJO", "SEINEN", "JOSEI"])
    .execute()
  await db.schema
    .createType("MediaCountryOfOrigin")
    .asEnum(["JAPAN", "KOREA", "CHINA", "USA", "FRANCE", "BRAZIL"])
    .execute()
  await db.schema
    .createType("TaskType")
    .asEnum([
      "IMPORT_COVER",
      "IMPORT_CHAPTER",
      "CREATE_MEDIA",
      "IMPORT_MEDIA",
      "UPLOAD_CHAPTER",
      "UPLOAD_COVER",
      "UPLOAD_BANNER",
    ])
    .execute()
  await db.schema
    .createType("TaskStatus")
    .asEnum(["PENDING", "DOWNLOADING", "UPLOADING", "FINISHED", "FAILED"])
    .execute()
  await db.schema
    .createType("Languages")
    .asEnum([...LANGUAGES])
    .execute()
  await db.schema
    .createType("Countries")
    .asEnum([...COUNTRIES])
    .execute()

  // --- User
  await db.schema
    .createTable("User")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("username", "text", (c) => c.notNull())
    .addColumn("displayUsername", "text", (c) => c.notNull())
    .addColumn("email", "text")
    .addColumn("emailVerified", "boolean", (c) => c.notNull())
    .addColumn("normalizedEmail", "text")
    .addColumn("image", "text")
    .addColumn("banned", "boolean")
    .addColumn("banReason", "text")
    .addColumn("banExpires", sql`timestamp(3)`)
    .addColumn("role", sql`"Roles"`, (c) => c.notNull().defaultTo(sql`'USER'::"Roles"`))
    .addColumn("settings", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .execute()

  await db.schema.createIndex("User_email_key").on("User").column("email").unique().execute()
  await db.schema.createIndex("User_username_key").on("User").column("username").unique().execute()
  await db.schema
    .createIndex("User_displayUsername_key")
    .on("User")
    .column("displayUsername")
    .unique()
    .execute()

  // --- UserProfile
  await db.schema
    .createTable("UserProfile")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("banner", "text")
    .addColumn("birthDate", sql`timestamp(3)`)
    .addColumn("gender", sql`"Genders"`, (c) =>
      c.notNull().defaultTo(sql`'NOT_SPECIFIED'::"Genders"`),
    )
    .addColumn("city", "text")
    .addColumn("country", sql`"Countries"`)
    .addColumn("about", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn("points", "integer", (c) => c.notNull().defaultTo(0))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .execute()

  await db.schema
    .createIndex("UserProfile_userId_key")
    .on("UserProfile")
    .column("userId")
    .unique()
    .execute()

  // --- UserLibrary
  await db.schema
    .createTable("UserLibrary")
    .addColumn("reading", sql`jsonb[]`, (c) => c.defaultTo(sql`ARRAY[]::jsonb[]`))
    .addColumn("rereading", sql`jsonb[]`, (c) => c.defaultTo(sql`ARRAY[]::jsonb[]`))
    .addColumn("planToRead", sql`jsonb[]`, (c) => c.defaultTo(sql`ARRAY[]::jsonb[]`))
    .addColumn("completed", sql`jsonb[]`, (c) => c.defaultTo(sql`ARRAY[]::jsonb[]`))
    .addColumn("onHold", sql`jsonb[]`, (c) => c.defaultTo(sql`ARRAY[]::jsonb[]`))
    .addColumn("dropped", sql`jsonb[]`, (c) => c.defaultTo(sql`ARRAY[]::jsonb[]`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .execute()

  await db.schema
    .createIndex("UserLibrary_userId_key")
    .on("UserLibrary")
    .column("userId")
    .unique()
    .execute()

  // --- _UserFollow
  await db.schema
    .createTable("_UserFollow")
    .addColumn("A", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("B", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addPrimaryKeyConstraint("_UserFollow_AB_pkey", ["A", "B"])
    .execute()

  await db.schema.createIndex("_UserFollow_B_index").on("_UserFollow").column("B").execute()

  // --- Account
  await db.schema
    .createTable("Account")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("accessToken", "text")
    .addColumn("refreshToken", "text")
    .addColumn("accessTokenExpiresAt", sql`timestamp(3)`)
    .addColumn("refreshTokenExpiresAt", sql`timestamp(3)`)
    .addColumn("scope", "text")
    .addColumn("password", "text")
    .addColumn("idToken", "text")
    .addColumn("accountId", "text", (c) => c.notNull())
    .addColumn("providerId", "text", (c) => c.notNull())
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("cascade").onUpdate("cascade"),
    )
    .execute()

  await db.schema
    .createIndex("Account_accountId_providerId_userId_key")
    .on("Account")
    .columns(["accountId", "providerId", "userId"])
    .unique()
    .execute()

  // --- Session
  await db.schema
    .createTable("Session")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("expiresAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("token", "text", (c) => c.notNull())
    .addColumn("ipAddress", "text")
    .addColumn("userAgent", "text")
    .addColumn("impersonatedBy", "text")
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("cascade").onUpdate("cascade"),
    )
    .execute()

  await db.schema.createIndex("Session_token_key").on("Session").column("token").unique().execute()

  // --- Verification
  await db.schema
    .createTable("Verification")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("expiresAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("identifier", "text", (c) => c.notNull())
    .addColumn("value", "text", (c) => c.notNull())
    .execute()

  // --- Group
  await db.schema
    .createTable("Group")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("description", "text")
    .addColumn("logo", "text")
    .addColumn("banner", "text")
    .addColumn("website", "text")
    .addColumn("discord", "text")
    .addColumn("x", "text")
    .addColumn("facebook", "text")
    .addColumn("instagram", "text")
    .addColumn("telegram", "text")
    .addColumn("youtube", "text")
    .addColumn("email", "text")
    .addColumn("creatorId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "uuid")
    .execute()

  // --- Staff
  await db.schema
    .createTable("Staff")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("bio", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn("links", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn("image", "text")
    .addColumn("creatorId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "uuid")
    .execute()

  // --- Media
  await db.schema
    .createTable("Media")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("startDate", sql`timestamp(3)`)
    .addColumn("endDate", sql`timestamp(3)`)
    .addColumn("synopsis", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn("contentRating", sql`"ContentRating"`, (c) =>
      c.notNull().defaultTo(sql`'NORMAL'::"ContentRating"`),
    )
    .addColumn("type", sql`"MediaType"`, (c) => c.notNull())
    .addColumn("status", sql`"MediaStatus"`, (c) => c.notNull())
    .addColumn("source", sql`"MediaSource"`, (c) => c.notNull())
    .addColumn("demography", sql`"MediaDemography"`, (c) => c.notNull())
    .addColumn("countryOfOrigin", sql`"MediaCountryOfOrigin"`, (c) => c.notNull())
    .addColumn("tags", sql`jsonb[]`, (c) => c.defaultTo(sql`'{}'::jsonb[]`))
    .addColumn("flag", sql`"Flag"`, (c) => c.notNull().defaultTo(sql`'OK'::"Flag"`))
    .addColumn("links", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn("creatorId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "uuid")
    .execute()

  // --- UserHistory (depends on User + Media)
  await db.schema
    .createTable("UserHistory")
    .addColumn("progression", sql`jsonb[]`)
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("Media.id").onDelete("restrict").onUpdate("cascade"),
    )
    .execute()

  await db.schema
    .createIndex("UserHistory_mediaId_userId_key")
    .on("UserHistory")
    .columns(["mediaId", "userId"])
    .unique()
    .execute()

  // --- Banner
  await db.schema
    .createTable("Banner")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("contentRating", sql`"ContentRating"`, (c) =>
      c.notNull().defaultTo(sql`'NORMAL'::"ContentRating"`),
    )
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("Media.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("uploaderId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "uuid")
    .execute()

  // --- Cover
  await db.schema
    .createTable("Cover")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("volume", "text")
    .addColumn("contentRating", sql`"ContentRating"`, (c) =>
      c.notNull().defaultTo(sql`'NORMAL'::"ContentRating"`),
    )
    .addColumn("isMainCover", "boolean", (c) => c.notNull().defaultTo(false))
    .addColumn("language", sql`"Languages"`, (c) => c.notNull())
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("Media.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("uploaderId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "uuid")
    .execute()

  // --- Title
  await db.schema
    .createTable("Title")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("title", "text", (c) => c.notNull())
    .addColumn("language", sql`"Languages"`, (c) => c.notNull())
    .addColumn("priority", "integer", (c) => c.notNull())
    .addColumn("isAcronym", "boolean", (c) => c.notNull().defaultTo(false))
    .addColumn("isMainTitle", "boolean", (c) => c.notNull().defaultTo(false))
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("Media.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("creatorId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "uuid")
    .execute()

  await db.schema
    .createIndex("Title_mediaId_language_priority_key")
    .on("Title")
    .columns(["mediaId", "language", "priority"])
    .unique()
    .execute()

  // --- Chapter
  await db.schema
    .createTable("Chapter")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("title", "text")
    .addColumn("number", "double precision", (c) => c.notNull())
    .addColumn("volume", "text")
    .addColumn("language", sql`"Languages"`, (c) => c.notNull())
    .addColumn("pages", sql`jsonb[]`)
    .addColumn("contentRating", sql`"ContentRating"`, (c) =>
      c.notNull().defaultTo(sql`'NORMAL'::"ContentRating"`),
    )
    .addColumn("flag", sql`"Flag"`, (c) => c.notNull().defaultTo(sql`'OK'::"Flag"`))
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("Media.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("uploaderId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "uuid")
    .execute()

  // --- _ChapterToGroup
  await db.schema
    .createTable("_ChapterToGroup")
    .addColumn("A", "uuid", (c) =>
      c.notNull().references("Chapter.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("B", "uuid", (c) =>
      c.notNull().references("Group.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addPrimaryKeyConstraint("_ChapterToGroup_AB_pkey", ["A", "B"])
    .execute()

  await db.schema.createIndex("_ChapterToGroup_B_index").on("_ChapterToGroup").column("B").execute()

  // --- StaffOnMedia
  await db.schema
    .createTable("StaffOnMedia")
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("Media.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("staffId", "uuid", (c) =>
      c.notNull().references("Staff.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("role", sql`"StaffRole"`, (c) => c.notNull())
    .addPrimaryKeyConstraint("StaffOnMedia_pkey", ["mediaId", "staffId", "role"])
    .execute()

  await db.schema
    .createIndex("StaffOnMedia_staffId_index")
    .on("StaffOnMedia")
    .column("staffId")
    .execute()

  // --- Task
  await db.schema
    .createTable("Task")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("type", sql`"TaskType"`, (c) => c.notNull())
    .addColumn("status", sql`"TaskStatus"`, (c) => c.notNull())
    .addColumn("payload", "jsonb", (c) => c.notNull())
    .addColumn("sessionId", "uuid", (c) => c.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("Task").execute()
  await db.schema.dropTable("StaffOnMedia").execute()
  await db.schema.dropTable("_ChapterToGroup").execute()
  await db.schema.dropTable("Chapter").execute()
  await db.schema.dropTable("Title").execute()
  await db.schema.dropTable("Cover").execute()
  await db.schema.dropTable("Banner").execute()
  await db.schema.dropTable("UserHistory").execute()
  await db.schema.dropTable("Media").execute()
  await db.schema.dropTable("Staff").execute()
  await db.schema.dropTable("Group").execute()
  await db.schema.dropTable("Verification").execute()
  await db.schema.dropTable("Session").execute()
  await db.schema.dropTable("Account").execute()
  await db.schema.dropTable("_UserFollow").execute()
  await db.schema.dropTable("UserLibrary").execute()
  await db.schema.dropTable("UserProfile").execute()
  await db.schema.dropTable("User").execute()

  await db.schema.dropType("Countries").execute()
  await db.schema.dropType("Languages").execute()
  await db.schema.dropType("TaskStatus").execute()
  await db.schema.dropType("TaskType").execute()
  await db.schema.dropType("MediaCountryOfOrigin").execute()
  await db.schema.dropType("MediaDemography").execute()
  await db.schema.dropType("MediaSource").execute()
  await db.schema.dropType("MediaStatus").execute()
  await db.schema.dropType("MediaType").execute()
  await db.schema.dropType("StaffRole").execute()
  await db.schema.dropType("Genders").execute()
  await db.schema.dropType("Roles").execute()
  await db.schema.dropType("Flag").execute()
  await db.schema.dropType("ContentRating").execute()
}
