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
  // Enums
  await db.schema
    .createType("Roles")
    .asEnum(["USER", "MODERATOR", "UPLOADER_INTERN", "UPLOADER", "ADMIN"])
    .execute()

  await db.schema
    .createType("Genders")
    .asEnum(["MALE", "FEMALE", "OTHER", "NOT_SPECIFIED"])
    .execute()

  await db.schema
    .createType("Countries")
    .asEnum([...COUNTRIES])
    .execute()

  await db.schema
    .createType("ContentRating")
    .asEnum(["NORMAL", "SUGGESTIVE", "NSFW", "NSFL"])
    .execute()

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
    .createType("MediaGenres")
    .asEnum([
      "ACTION",
      "ADVENTURE",
      "COMEDY",
      "DRAMA",
      "ECCHI",
      "FANTASY",
      "HENTAI",
      "HORROR",
      "MAHOU_SHOUJO",
      "MECHA",
      "MUSIC",
      "MYSTERY",
      "PSYCHOLOGICAL",
      "ROMANCE",
      "SCI_FI",
      "SLICE_OF_LIFE",
      "SPORTS",
      "SUPERNATURAL",
      "THRILLER",
    ])
    .execute()

  await db.schema.createType("Flag").asEnum(["OK", "STAFF_ONLY", "VIP_ONLY", "LOCKED"]).execute()

  await db.schema
    .createType("Languages")
    .asEnum([...LANGUAGES])
    .execute()

  await db.schema.createType("Trackers").asEnum(["MANGADEX", "MYANIMELIST", "ANILIST"]).execute()

  await db.schema
    .createType("ScanMemberRoles")
    .asEnum([
      "OWNER",
      "ADMIN",
      "TRANSLATOR",
      "PROOFREADER",
      "CLEANER",
      "REDRAWER",
      "TYPESETTER",
      "QUALITY_CHECKER",
      "RAW_PROVIDER",
      "OTHER",
    ])
    .execute()

  await db.schema.createType("ScanMemberPermissions").asEnum(["UPLOAD", "EDIT", "DELETE"]).execute()

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

  await db.schema.createType("HomeLayout").asEnum(["ROWS", "COLUMNS"]).execute()

  // Prisma migrations table
  await db.schema
    .createTable("_prisma_migrations")
    .addColumn("id", sql`varchar(36)`, (c) => c.primaryKey())
    .addColumn("checksum", sql`varchar(64)`, (c) => c.notNull())
    .addColumn("finished_at", sql`timestamptz`)
    .addColumn("migration_name", sql`varchar(255)`, (c) => c.notNull())
    .addColumn("logs", "text")
    .addColumn("rolled_back_at", sql`timestamptz`)
    .addColumn("started_at", sql`timestamptz`, (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn("applied_steps_count", "integer", (c) => c.notNull().defaultTo(0))
    .execute()

  // VerificationToken
  await db.schema
    .createTable("VerificationToken")
    .addColumn("identifier", "text", (c) => c.notNull())
    .addColumn("token", "text", (c) => c.notNull())
    .addColumn("expires", sql`timestamp(3)`, (c) => c.notNull())
    .addPrimaryKeyConstraint("VerificationToken_pkey", ["identifier", "token"])
    .execute()

  // User
  await db.schema
    .createTable("User")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("name", "text")
    .addColumn("email", "text")
    .addColumn("emailVerified", sql`timestamp(3)`)
    .addColumn("image", "text")
    .addColumn("role", sql`"Roles"`, (c) => c.notNull().defaultTo(sql`'USER'::"Roles"`))
    .execute()

  await db.schema.createIndex("User_email_key").on("User").column("email").unique().execute()

  await db.schema.createIndex("User_id_idx").on("User").column("id").execute()

  // Account
  await db.schema
    .createTable("Account")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("type", "text", (c) => c.notNull())
    .addColumn("refresh_token", "text")
    .addColumn("access_token", "text")
    .addColumn("expires_at", "integer")
    .addColumn("token_type", "text")
    .addColumn("scope", "text")
    .addColumn("id_token", "text")
    .addColumn("session_state", "text")
    .addColumn("provider", "text", (c) => c.notNull())
    .addColumn("providerAccountId", "text", (c) => c.notNull())
    .addColumn("userId", "text", (c) =>
      c.notNull().references("User.id").onDelete("cascade").onUpdate("cascade"),
    )
    .execute()

  await db.schema
    .createIndex("Account_provider_providerAccountId_key")
    .on("Account")
    .columns(["provider", "providerAccountId"])
    .unique()
    .execute()

  // UserProfile
  await db.schema
    .createTable("UserProfile")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("banner", "text")
    .addColumn("birthDate", sql`timestamp(3)`)
    .addColumn("gender", sql`"Genders"`, (c) =>
      c.notNull().defaultTo(sql`'NOT_SPECIFIED'::"Genders"`),
    )
    .addColumn("city", "text")
    .addColumn("country", sql`"Countries"`)
    .addColumn("about", "text")
    .addColumn("points", "integer", (c) => c.notNull().defaultTo(0))
    .addColumn("userId", "text", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .execute()

  await db.schema
    .createIndex("UserProfile_userId_key")
    .on("UserProfile")
    .column("userId")
    .unique()
    .execute()

  // Media
  await db.schema
    .createTable("Media")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("startDate", sql`timestamp(3)`)
    .addColumn("endDate", sql`timestamp(3)`)
    .addColumn("synopsis", "text")
    .addColumn("contentRating", sql`"ContentRating"`, (c) =>
      c.notNull().defaultTo(sql`'NORMAL'::"ContentRating"`),
    )
    .addColumn("oneShot", "boolean", (c) => c.notNull().defaultTo(false))
    .addColumn("trailer", "text")
    .addColumn("type", sql`"MediaType"`, (c) => c.notNull())
    .addColumn("status", sql`"MediaStatus"`, (c) => c.notNull())
    .addColumn("source", sql`"MediaSource"`, (c) => c.notNull())
    .addColumn("demography", sql`"MediaDemography"`, (c) => c.notNull())
    .addColumn("countryOfOrigin", sql`"MediaCountryOfOrigin"`, (c) => c.notNull())
    .addColumn("genres", sql`"MediaGenres"[]`)
    .addColumn("tags", sql`jsonb[]`)
    .addColumn("flag", sql`"Flag"`, (c) => c.notNull().defaultTo(sql`'OK'::"Flag"`))
    .addColumn("creatorId", "text", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "text")
    .execute()

  // MediaBanner
  await db.schema
    .createTable("MediaBanner")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("contentRating", sql`"ContentRating"`, (c) =>
      c.notNull().defaultTo(sql`'NORMAL'::"ContentRating"`),
    )
    .addColumn("mediaId", "text", (c) =>
      c.notNull().references("Media.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("uploaderId", "text", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "text")
    .execute()

  // MediaChapter
  await db.schema
    .createTable("MediaChapter")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("title", "text")
    .addColumn("number", "double precision", (c) => c.notNull())
    .addColumn("volume", "double precision")
    .addColumn("language", sql`"Languages"`, (c) => c.notNull())
    .addColumn("pages", sql`jsonb[]`)
    .addColumn("contentRating", sql`"ContentRating"`, (c) =>
      c.notNull().defaultTo(sql`'NORMAL'::"ContentRating"`),
    )
    .addColumn("flag", sql`"Flag"`, (c) => c.notNull().defaultTo(sql`'OK'::"Flag"`))
    .addColumn("mediaId", "text", (c) =>
      c.notNull().references("Media.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("uploaderId", "text", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "text")
    .execute()

  // MediaChapterComment
  await db.schema
    .createTable("MediaChapterComment")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("content", "text", (c) => c.notNull())
    .addColumn("attachments", sql`jsonb[]`)
    .addColumn("parentId", "text", (c) =>
      c.references("MediaChapterComment.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("mediaChapterId", "text", (c) =>
      c.notNull().references("MediaChapter.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("userId", "text", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "text")
    .execute()

  // MediaCover
  await db.schema
    .createTable("MediaCover")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("volume", "integer")
    .addColumn("contentRating", sql`"ContentRating"`, (c) =>
      c.notNull().defaultTo(sql`'NORMAL'::"ContentRating"`),
    )
    .addColumn("isMainCover", "boolean", (c) => c.notNull().defaultTo(false))
    .addColumn("language", sql`"Languages"`, (c) => c.notNull())
    .addColumn("mediaId", "text", (c) =>
      c.notNull().references("Media.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("uploaderId", "text", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "text")
    .execute()

  // _UserFollow
  await db.schema
    .createTable("_UserFollow")
    .addColumn("A", "text", (c) =>
      c.notNull().references("User.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("B", "text", (c) =>
      c.notNull().references("User.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addPrimaryKeyConstraint("_UserFollow_AB_pkey", ["A", "B"])
    .execute()

  await db.schema.createIndex("_UserFollow_B_index").on("_UserFollow").column("B").execute()

  // MediaTitle
  await db.schema
    .createTable("MediaTitle")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("title", "text", (c) => c.notNull())
    .addColumn("language", sql`"Languages"`, (c) => c.notNull())
    .addColumn("priority", "integer", (c) => c.notNull())
    .addColumn("isAcronym", "boolean", (c) => c.notNull().defaultTo(false))
    .addColumn("isMainTitle", "boolean", (c) => c.notNull().defaultTo(false))
    .addColumn("mediaId", "text", (c) =>
      c.notNull().references("Media.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("creatorId", "text", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "text")
    .execute()

  await db.schema
    .createIndex("MediaTitle_mediaId_language_priority_key")
    .on("MediaTitle")
    .columns(["mediaId", "language", "priority"])
    .unique()
    .execute()

  // MediaTracker
  await db.schema
    .createTable("MediaTracker")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("tracker", sql`"Trackers"`, (c) => c.notNull())
    .addColumn("externalId", "text", (c) => c.notNull())
    .addColumn("mediaId", "text", (c) =>
      c.notNull().references("Media.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("creatorId", "text", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "text")
    .execute()

  // ScanMember
  await db.schema
    .createTable("ScanMember")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("roles", sql`"ScanMemberRoles"[]`)
    .addColumn("permissions", sql`"ScanMemberPermissions"[]`)
    .addColumn("userId", "text", (c) =>
      c.notNull().references("User.id").onDelete("cascade").onUpdate("cascade"),
    )
    .execute()

  // Scan
  await db.schema
    .createTable("Scan")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("description", "text")
    .addColumn("logo", "text")
    .addColumn("banner", "text")
    .addColumn("website", "text")
    .addColumn("discord", "text")
    .addColumn("twitter", "text")
    .addColumn("facebook", "text")
    .addColumn("instagram", "text")
    .addColumn("telegram", "text")
    .addColumn("youtube", "text")
    .addColumn("email", "text")
    .addColumn("creatorId", "text", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "text")
    .execute()

  // Session
  await db.schema
    .createTable("Session")
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("sessionToken", "text", (c) => c.notNull())
    .addColumn("expires", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("userId", "text", (c) =>
      c.notNull().references("User.id").onDelete("cascade").onUpdate("cascade"),
    )
    .execute()

  await db.schema
    .createIndex("Session_sessionToken_key")
    .on("Session")
    .column("sessionToken")
    .unique()
    .execute()

  // UserHistory
  await db.schema
    .createTable("UserHistory")
    .addColumn("progression", sql`jsonb[]`)
    .addColumn("mediaId", "text", (c) =>
      c.notNull().references("Media.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("userId", "text", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .execute()

  await db.schema
    .createIndex("UserHistory_mediaId_userId_key")
    .on("UserHistory")
    .columns(["mediaId", "userId"])
    .unique()
    .execute()

  // UserLibrary
  await db.schema
    .createTable("UserLibrary")
    .addColumn("reading", sql`jsonb[]`, (c) => c.defaultTo(sql`ARRAY[]::jsonb[]`))
    .addColumn("rereading", sql`jsonb[]`, (c) => c.defaultTo(sql`ARRAY[]::jsonb[]`))
    .addColumn("planToRead", sql`jsonb[]`, (c) => c.defaultTo(sql`ARRAY[]::jsonb[]`))
    .addColumn("completed", sql`jsonb[]`, (c) => c.defaultTo(sql`ARRAY[]::jsonb[]`))
    .addColumn("onHold", sql`jsonb[]`, (c) => c.defaultTo(sql`ARRAY[]::jsonb[]`))
    .addColumn("dropped", sql`jsonb[]`, (c) => c.defaultTo(sql`ARRAY[]::jsonb[]`))
    .addColumn("userId", "text", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .execute()

  await db.schema
    .createIndex("UserLibrary_userId_key")
    .on("UserLibrary")
    .column("userId")
    .unique()
    .execute()

  // _MediaChapterToScan
  await db.schema
    .createTable("_MediaChapterToScan")
    .addColumn("A", "text", (c) =>
      c.notNull().references("MediaChapter.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("B", "text", (c) =>
      c.notNull().references("Scan.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addPrimaryKeyConstraint("_MediaChapterToScan_AB_pkey", ["A", "B"])
    .execute()

  await db.schema
    .createIndex("_MediaChapterToScan_B_index")
    .on("_MediaChapterToScan")
    .column("B")
    .execute()

  // _ScanToScanMember
  await db.schema
    .createTable("_ScanToScanMember")
    .addColumn("A", "text", (c) =>
      c.notNull().references("Scan.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("B", "text", (c) =>
      c.notNull().references("ScanMember.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addPrimaryKeyConstraint("_ScanToScanMember_AB_pkey", ["A", "B"])
    .execute()

  await db.schema
    .createIndex("_ScanToScanMember_B_index")
    .on("_ScanToScanMember")
    .column("B")
    .execute()

  // Task
  await db.schema
    .createTable("Task")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("type", sql`"TaskType"`, (c) => c.notNull())
    .addColumn("status", sql`"TaskStatus"`, (c) => c.notNull())
    .addColumn("sessionId", "text", (c) => c.notNull())
    .addColumn("payload", "jsonb", (c) => c.notNull())
    .execute()

  // UserSetting
  await db.schema
    .createTable("UserSetting")
    .addColumn("id", "text", (c) => c.primaryKey())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("contentRating", sql`"ContentRating"`, (c) =>
      c.notNull().defaultTo(sql`'NSFL'::"ContentRating"`),
    )
    .addColumn("preferredTitles", sql`"Languages"`)
    .addColumn("userId", "text", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("showFollowing", "boolean", (c) => c.notNull().defaultTo(true))
    .addColumn("showLibrary", "boolean", (c) => c.notNull().defaultTo(true))
    .addColumn("homeLayout", sql`"HomeLayout"`, (c) =>
      c.notNull().defaultTo(sql`'ROWS'::"HomeLayout"`),
    )
    .execute()

  await db.schema
    .createIndex("UserSetting_userId_key")
    .on("UserSetting")
    .column("userId")
    .unique()
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("UserSetting").execute()
  await db.schema.dropTable("Task").execute()
  await db.schema.dropTable("_ScanToScanMember").execute()
  await db.schema.dropTable("_MediaChapterToScan").execute()
  await db.schema.dropTable("UserLibrary").execute()
  await db.schema.dropTable("UserHistory").execute()
  await db.schema.dropTable("Session").execute()
  await db.schema.dropTable("Scan").execute()
  await db.schema.dropTable("ScanMember").execute()
  await db.schema.dropTable("MediaTracker").execute()
  await db.schema.dropTable("MediaTitle").execute()
  await db.schema.dropTable("_UserFollow").execute()
  await db.schema.dropTable("MediaCover").execute()
  await db.schema.dropTable("MediaChapterComment").execute()
  await db.schema.dropTable("MediaChapter").execute()
  await db.schema.dropTable("MediaBanner").execute()
  await db.schema.dropTable("Media").execute()
  await db.schema.dropTable("UserProfile").execute()
  await db.schema.dropTable("Account").execute()
  await db.schema.dropTable("User").execute()
  await db.schema.dropTable("VerificationToken").execute()
  await db.schema.dropTable("_prisma_migrations").execute()

  await db.schema.dropType("HomeLayout").execute()
  await db.schema.dropType("TaskStatus").execute()
  await db.schema.dropType("TaskType").execute()
  await db.schema.dropType("ScanMemberPermissions").execute()
  await db.schema.dropType("ScanMemberRoles").execute()
  await db.schema.dropType("Trackers").execute()
  await db.schema.dropType("Languages").execute()
  await db.schema.dropType("Flag").execute()
  await db.schema.dropType("MediaGenres").execute()
  await db.schema.dropType("MediaCountryOfOrigin").execute()
  await db.schema.dropType("MediaDemography").execute()
  await db.schema.dropType("MediaSource").execute()
  await db.schema.dropType("MediaStatus").execute()
  await db.schema.dropType("MediaType").execute()
  await db.schema.dropType("ContentRating").execute()
  await db.schema.dropType("Countries").execute()
  await db.schema.dropType("Genders").execute()
  await db.schema.dropType("Roles").execute()
}
