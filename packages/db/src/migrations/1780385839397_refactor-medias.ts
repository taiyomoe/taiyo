import { type ColumnType, type Kysely, sql } from "kysely"
import { cluster } from "radashi"

// Medias: trackers and the trailer move to the links column, the staff tables appear, and
// synopsis, genres, tags and volumes take their new shapes.

type RefactorTrackersDb = {
  Media: {
    id: string
    trailer: string | null
    links: unknown
  }
  Tracker: {
    tracker: string
    externalId: string
    mediaId: string
  }
  // Temporary table staging each media's links: one UPDATE instead of one per media.
  mediaLinks: { id: string; links: string }
}

const BATCH_SIZE = 1000
const TAG_KEYS = new Set([
  "ACTION",
  "ADVENTURE",
  "BOYS_LOVE",
  "COMEDY",
  "CRIME",
  "DRAMA",
  "FANTASY",
  "GIRLS_LOVE",
  "HISTORICAL",
  "HORROR",
  "ISEKAI",
  "MAGICAL_GIRLS",
  "MECHA",
  "MEDICAL",
  "MYSTERY",
  "PHILOSOPHICAL",
  "PSYCHOLOGICAL",
  "ROMANCE",
  "SCI_FI",
  "SLICE_OF_LIFE",
  "SPORTS",
  "SUPERHERO",
  "SUPERNATURAL",
  "THRILLER",
  "TRAGEDY",
  "WUXIA",
  "ONESHOT",
  "AWARD_WINNING",
  "OFFICIAL_COLORED",
  "LONG_STRIP",
  "ANTHOLOGY",
  "FAN_COLORED",
  "SELF_PUBLISHED",
  "FOUR_KOMA",
  "DOUJINSHI",
  "WEB_COMIC",
  "ADAPTATION",
  "FULL_COLOR",
  "ACHROMATIC",
  "ACHRONOLOGICAL_ORDER",
  "ACROBATICS",
  "ACTING",
  "ADOPTION",
  "ADVERTISEMENT",
  "AFTERLIFE",
  "AGE_GAP",
  "AGE_REGRESSION",
  "AGENDER",
  "AGRICULTURE",
  "AHEGAO",
  "AIRSOFT",
  "ALCHEMY",
  "ALIENS",
  "ALTERNATE_UNIVERSE",
  "AMERICAN_FOOTBALL",
  "AMNESIA",
  "AMPUTATION",
  "ANACHRONISM",
  "ANAL_SEX",
  "ANCIENT_CHINA",
  "ANGELS",
  "ANIMALS",
  "ANTHROPOMORPHISM",
  "ANTIHERO",
  "ARCHERY",
  "ARMPITS",
  "AROMANTIC",
  "ARRANGED_MARRIAGE",
  "ARTIFICIAL_INTELLIGENCE",
  "ASEXUAL",
  "ASHIKOKI",
  "ASPHYXIATION",
  "ASSASSINS",
  "ASTRONOMY",
  "ATHLETICS",
  "AUGMENTED_REALITY",
  "AUTOBIOGRAPHICAL",
  "AVIATION",
  "BADMINTON",
  "BALLET",
  "BAND",
  "BAR",
  "BASEBALL",
  "BASKETBALL",
  "BATTLE_ROYALE",
  "BIOGRAPHICAL",
  "BISEXUAL",
  "BLACKMAIL",
  "BOARD_GAME",
  "BOARDING_SCHOOL",
  "BODY_HORROR",
  "BODY_IMAGE",
  "BODY_SWAPPING",
  "BONDAGE",
  "BOOBJOB",
  "BOWLING",
  "BOXING",
  "BULLYING",
  "BUTLER",
  "CALLIGRAPHY",
  "CAMPING",
  "CANNIBALISM",
  "CARD_BATTLE",
  "CARS",
  "CENTAUR",
  "CERVIX_PENETRATION",
  "CGI",
  "CHEATING",
  "CHEERLEADING",
  "CHIBI",
  "CHIMERA",
  "CHUUNIBYOU",
  "CIRCUS",
  "CLASS_STRUGGLE",
  "CLASSIC_LITERATURE",
  "CLASSICAL_MUSIC",
  "CLONE",
  "COASTAL",
  "COHABITATION",
  "COLLEGE",
  "COMING_OF_AGE",
  "CONSPIRACY",
  "COSMIC_HORROR",
  "COSPLAY",
  "COWBOYS",
  "CREATURE_TAMING",
  "CRIMINAL_ORGANIZATION",
  "CROSSDRESSING",
  "CROSSOVER",
  "CULT",
  "CULTIVATION",
  "CUMFLATION",
  "CUNNILINGUS",
  "CURSES",
  "CUTE_BOYS_DOING_CUTE_THINGS",
  "CUTE_GIRLS_DOING_CUTE_THINGS",
  "CYBERPUNK",
  "CYBORG",
  "CYCLING",
  "DANCING",
  "DEATH_GAME",
  "DEEPTHROAT",
  "DEFLORATION",
  "DELINQUENTS",
  "DEMONS",
  "DENPA",
  "DESERT",
  "DETECTIVE",
  "DILF",
  "DINOSAURS",
  "DISABILITY",
  "DISSOCIATIVE_IDENTITIES",
  "DOUBLE_PENETRATION",
  "DRAGONS",
  "DRAWING",
  "DRUGS",
  "DULLAHAN",
  "DUNGEON",
  "DYSTOPIAN",
  "ESPORTS",
  "ECO_HORROR",
  "ECONOMICS",
  "EDUCATIONAL",
  "ELDERLY_PROTAGONIST",
  "ELF",
  "ENSEMBLE_CAST",
  "ENVIRONMENTAL",
  "EPISODIC",
  "ERO_GURO",
  "EROTIC_PIERCINGS",
  "ESPIONAGE",
  "ESTRANGED_FAMILY",
  "EXHIBITIONISM",
  "EXORCISM",
  "FACIAL",
  "FAIRY",
  "FAIRY_TALE",
  "FAKE_RELATIONSHIP",
  "FAMILY_LIFE",
  "FASHION",
  "FEET",
  "FELLATIO",
  "FEMALE_HAREM",
  "FEMALE_PROTAGONIST",
  "FEMBOY",
  "FEMDOM",
  "FENCING",
  "FILMMAKING",
  "FINGERING",
  "FIREFIGHTERS",
  "FISHING",
  "FISTING",
  "FITNESS",
  "FLASH",
  "FLAT_CHEST",
  "FOOD",
  "FOOTBALL",
  "FOREIGN",
  "FOUND_FAMILY",
  "FUGITIVE",
  "FULL_CGI",
  "FUTANARI",
  "GAMBLING",
  "GANGS",
  "GENDER_BENDING",
  "GHOST",
  "GO",
  "GOBLIN",
  "GODS",
  "GOLF",
  "GORE",
  "GROUP_SEX",
  "GUNS",
  "GYARU",
  "HAIR_PULLING",
  "HANDBALL",
  "HANDJOB",
  "HENSHIN",
  "HETEROSEXUAL",
  "HIKIKOMORI",
  "HIP_HOP_MUSIC",
  "HOMELESS",
  "HORTICULTURE",
  "HUMAN_PET",
  "HYPERSEXUALITY",
  "ICE_SKATING",
  "IDOL",
  "INCEST",
  "INDIGENOUS_CULTURES",
  "INN",
  "INSEKI",
  "IRRUMATIO",
  "IYASHIKEI",
  "JAZZ_MUSIC",
  "JOSEI",
  "JUDO",
  "KABUKI",
  "KAIJU",
  "KARUTA",
  "KEMONOMIMI",
  "KIDS",
  "KINGDOM_MANAGEMENT",
  "KONBINI",
  "KUUDERE",
  "LACROSSE",
  "LACTATION",
  "LANGUAGE_BARRIER",
  "LARGE_BREASTS",
  "LGBTQ_THEMES",
  "LOST_CIVILIZATION",
  "LOVE_TRIANGLE",
  "MAFIA",
  "MAGIC",
  "MAHJONG",
  "MAIDS",
  "MAKEUP",
  "MALE_HAREM",
  "MALE_PREGNANCY",
  "MALE_PROTAGONIST",
  "MANZAI",
  "MARRIAGE",
  "MARTIAL_ARTS",
  "MASOCHISM",
  "MASTURBATION",
  "MATCHMAKING",
  "MATING_PRESS",
  "MATRIARCHY",
  "MEDIEVAL",
  "MEMORY_MANIPULATION",
  "MERMAID",
  "META",
  "METAL_MUSIC",
  "MILF",
  "MILITARY",
  "MIXED_GENDER_HAREM",
  "MIXED_MEDIA",
  "MODELING",
  "MONSTERS",
  "MONSTER_BOY",
  "MONSTER_GIRL",
  "MOPEDS",
  "MOTORCYCLES",
  "MOUNTAINEERING",
  "MUSICAL_THEATER",
  "MYTHOLOGY",
  "NAKADASHI",
  "NATURAL_DISASTER",
  "NECROMANCY",
  "NEKOMIMI",
  "NETORARE",
  "NETORASE",
  "NETORI",
  "NINJA",
  "NO_DIALOGUE",
  "NOIR",
  "NONFICTION",
  "NUDITY",
  "NUN",
  "OFFICE",
  "OFFICE_LADY",
  "OIRAN",
  "OJOUSAMA",
  "OMEGAVERSE",
  "ORPHAN",
  "OTAKU_CULTURE",
  "OUTDOOR_ACTIVITIES",
  "OYAKODON",
  "PANDEMIC",
  "PARENTHOOD",
  "PARKOUR",
  "PARODY",
  "PET_PLAY",
  "PHOTOGRAPHY",
  "PIRATES",
  "POKER",
  "POLICE",
  "POLITICS",
  "POLYAMOROUS",
  "POST_APOCALYPTIC",
  "POV",
  "PREGNANCY",
  "PRIMARILY_ADULT_CAST",
  "PRIMARILY_ANIMAL_CAST",
  "PRIMARILY_CHILD_CAST",
  "PRIMARILY_FEMALE_CAST",
  "PRIMARILY_MALE_CAST",
  "PRIMARILY_TEEN_CAST",
  "PRISON",
  "PROSTITUTION",
  "PROXY_BATTLE",
  "PSYCHOSEXUAL",
  "PUBLIC_SEX",
  "PUPPETRY",
  "RAKUGO",
  "RAPE",
  "REAL_ROBOT",
  "REHABILITATION",
  "REINCARNATION",
  "RELIGION",
  "RESCUE",
  "RESTAURANT",
  "REVENGE",
  "REVERSE_ISEKAI",
  "RIMJOB",
  "ROBOTS",
  "ROCK_MUSIC",
  "ROTOSCOPING",
  "ROYAL_AFFAIRS",
  "RUGBY",
  "RURAL",
  "SADISM",
  "SAMURAI",
  "SATIRE",
  "SCAT",
  "SCHOOL",
  "SCHOOL_CLUB",
  "SCISSORING",
  "SCUBA_DIVING",
  "SEINEN",
  "SEX_TOYS",
  "SHAPESHIFTING",
  "SHIMAIDON",
  "SHIPS",
  "SHOGI",
  "SHOUJO",
  "SHOUNEN",
  "SHRINE_MAIDEN",
  "SKATEBOARDING",
  "SKELETON",
  "SLAPSTICK",
  "SLAVERY",
  "SNOWSCAPE",
  "SOFTWARE_DEVELOPMENT",
  "SPACE",
  "SPACE_OPERA",
  "SPEARPLAY",
  "SQUIRTING",
  "STEAMPUNK",
  "STOP_MOTION",
  "SUCCUBUS",
  "SUICIDE",
  "SUMATA",
  "SUMO",
  "SUPER_POWER",
  "SUPER_ROBOT",
  "SURFING",
  "SURREAL_COMEDY",
  "SURVIVAL",
  "SWAPPING",
  "SWEAT",
  "SWIMMING",
  "SWORDPLAY",
  "TABLE_TENNIS",
  "TANKS",
  "TANNED_SKIN",
  "TEACHER",
  "TEENS_LOVE",
  "TENNIS",
  "TENTACLES",
  "TERRORISM",
  "THREESOME",
  "TIME_LOOP",
  "TIME_MANIPULATION",
  "TIME_SKIP",
  "TOKUSATSU",
  "TOMBOY",
  "TORTURE",
  "TRAINS",
  "TRANSGENDER",
  "TRAVEL",
  "TRIADS",
  "TSUNDERE",
  "TWINS",
  "UNREQUITED_LOVE",
  "URBAN",
  "URBAN_FANTASY",
  "VAMPIRE",
  "VERTICAL_VIDEO",
  "VETERINARIAN",
  "VIDEO_GAMES",
  "VIKINGS",
  "VILLAINESS",
  "VIRGINITY",
  "VIRTUAL_WORLD",
  "VOCAL_SYNTH",
  "VOLLEYBALL",
  "VORE",
  "VOYEUR",
  "VTUBER",
  "WAR",
  "WATERSPORTS",
  "WEREWOLF",
  "WILDERNESS",
  "WITCH",
  "WORK",
  "WRESTLING",
  "WRITING",
  "YAKUZA",
  "YANDERE",
  "YOUKAI",
  "YURI",
  "ZOMBIE",
  "ZOOPHILIA",
])

type MediaTag = {
  key: string
  isSpoiler: boolean
}

type RefactorMediasDb = {
  Media: {
    id: string
    genres: string[] | null
    tags: ColumnType<Array<{ key: string; isSpoiler?: boolean | null }> | null, never, unknown>
    oneShot: boolean
  }
  // Temporary table staging each media's tags (as a JSON array): one UPDATE instead of
  // one per media.
  mediaTags: { id: string; tags: string }
}

type MigrationDb = RefactorTrackersDb & RefactorMediasDb

export async function up(db: Kysely<MigrationDb>): Promise<void> {
  // refactor-trackers
  await db.schema
    .alterTable("Media")
    .addColumn("links", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .execute()

  const trackers = await db
    .selectFrom("Tracker")
    .select(["tracker", "externalId", "mediaId"])
    .execute()
  const grouped = new Map<string, Array<{ tracker: string; externalId: string }>>()

  for (const row of trackers) {
    const existing = grouped.get(row.mediaId)
    const entry = { tracker: row.tracker, externalId: row.externalId }

    if (existing) {
      existing.push(entry)
    } else {
      grouped.set(row.mediaId, [entry])
    }
  }

  const mediasWithTrailer = await db
    .selectFrom("Media")
    .select(["id", "trailer"])
    .where("trailer", "is not", null)
    .execute()
  const trailerById = new Map(mediasWithTrailer.map((m) => [m.id, m.trailer]))
  const allIds = new Set<string>([...grouped.keys(), ...trailerById.keys()])
  const mediaLinks: Array<{ id: string; links: string }> = []

  for (const mediaId of allIds) {
    const payload: {
      mangaDex?: string
      myAnimeList?: number
      anilist?: number
      trailer?: string
    } = {}

    for (const { tracker, externalId } of grouped.get(mediaId) ?? []) {
      if (tracker === "MYANIMELIST") {
        payload.myAnimeList = Number(externalId)
      } else if (tracker === "ANILIST") {
        payload.anilist = Number(externalId)
      } else if (tracker === "MANGADEX") {
        payload.mangaDex = externalId
      }
    }

    const trailer = trailerById.get(mediaId)

    if (trailer !== undefined && trailer !== null && trailer !== "") {
      payload.trailer = `https://www.youtube.com/watch?v=${trailer}`
    }

    if (Object.keys(payload).length === 0) {
      continue
    }

    mediaLinks.push({ id: mediaId, links: JSON.stringify(payload) })
  }

  await db.schema
    .createTable("mediaLinks")
    .temporary()
    .addColumn("id", "uuid", (c) => c.primaryKey())
    .addColumn("links", "jsonb", (c) => c.notNull())
    .execute()

  for (const batch of cluster(mediaLinks, BATCH_SIZE)) {
    await db.insertInto("mediaLinks").values(batch).execute()
  }

  // Inside the migration transaction, autovacuum cannot refresh the planner's statistics
  // on these freshly written tables, which the join below relies on.
  await sql`ANALYZE "mediaLinks", "Media"`.execute(db)

  await db
    .updateTable("Media")
    .from("mediaLinks")
    .set((eb) => ({ links: eb.ref("mediaLinks.links") }))
    .whereRef("Media.id", "=", "mediaLinks.id")
    .execute()

  await db.schema.dropTable("mediaLinks").execute()

  await db.schema.dropTable("Tracker").execute()

  await db.schema.alterTable("Media").dropColumn("trailer").execute()

  await db.schema.dropType("Trackers").execute()

  // add-staff
  // Creates the staff tables only. Importing authors and artists from MangaDex used to
  // happen here, one API call per media inside the migration transaction: hours of
  // downtime on production, and a MangaDex outage would roll back every migration. It now
  // runs after the migration, site up: packages/db/src/backfills/import-mangadex-staff.ts.
  await db.schema.createType("StaffRole").asEnum(["AUTHOR", "ARTIST"]).execute()

  await db.schema
    .createTable("Staff")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("bio", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn("image", "text")
    .addColumn("links", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn("creatorId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "uuid")
    .execute()

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

  // refactor-medias
  /**
   * Phase 1: Convert synopsis from TEXT to JSONB.
   */
  await sql`ALTER TABLE "Media" ALTER COLUMN "synopsis" TYPE JSONB USING CASE WHEN "synopsis" IS NOT NULL THEN jsonb_build_object('pt_br', "synopsis") ELSE '{}' END`.execute(
    db,
  )
  await db.schema
    .alterTable("Media")
    .alterColumn("synopsis", (c) => c.setDefault(sql`'{}'::jsonb`))
    .execute()

  await db.schema
    .alterTable("Media")
    .alterColumn("synopsis", (c) => c.setNotNull())
    .execute()

  /**
   * Phase 2: Convert genres and oneShot to tags.
   */
  await db.schema
    .alterTable("Media")
    .alterColumn("tags", (c) => c.setDefault(sql`'{}'::jsonb[]`))
    .execute()

  const rows = await db.selectFrom("Media").select(["id", "genres", "tags", "oneShot"]).execute()
  const mediaTags: Array<{ id: string; tags: string }> = []

  for (const row of rows) {
    const newTags: MediaTag[] = []
    const seen = new Set<string>()
    const push = (tag: MediaTag) => {
      if (seen.has(tag.key)) {
        return
      }

      seen.add(tag.key)
      newTags.push(tag)
    }

    if (row.oneShot) {
      push({ key: "ONESHOT", isSpoiler: false })
    }

    const genres: string[] = Array.isArray(row.genres) ? row.genres : []

    for (const genre of genres) {
      if (TAG_KEYS.has(genre)) {
        push({ key: genre, isSpoiler: false })
      } else {
        // oxlint-disable-next-line no-console
        console.warn(`Invalid genre key "${genre}" for media ${row.id}, skipping`)
      }
    }

    const existingTags: Array<{ key: string; isSpoiler?: boolean | null }> = Array.isArray(row.tags)
      ? row.tags
      : []

    for (const tag of existingTags) {
      const isSpoiler = tag.isSpoiler ?? false

      if (TAG_KEYS.has(tag.key)) {
        if (!seen.has(tag.key)) {
          push({ key: tag.key, isSpoiler })
        }

        continue
      }

      if (tag.key === "PHILOSOPHY") {
        push({ key: "PHILOSOPHICAL", isSpoiler })

        continue
      }

      if (tag.key === "MEDICINE") {
        push({ key: "MEDICAL", isSpoiler })

        continue
      }

      if (tag.key === "POSTAPOCALYPTIC") {
        push({ key: "POST_APOCALYPTIC", isSpoiler })

        continue
      }

      // oxlint-disable-next-line no-console
      console.warn(`Invalid tag key "${tag.key}" for media ${row.id}, skipping`)
    }

    mediaTags.push({ id: row.id, tags: JSON.stringify(newTags) })
  }

  await db.schema
    .createTable("mediaTags")
    .temporary()
    .addColumn("id", "uuid", (c) => c.primaryKey())
    .addColumn("tags", "jsonb", (c) => c.notNull())
    .execute()

  for (const batch of cluster(mediaTags, BATCH_SIZE)) {
    await db.insertInto("mediaTags").values(batch).execute()
  }

  // Inside the migration transaction, autovacuum cannot refresh the planner's statistics
  // on these freshly written tables, which the join below relies on.
  await sql`ANALYZE "mediaTags", "Media"`.execute(db)

  // "tags" is a jsonb[] column: the staged JSON array is unnested into it.
  await db
    .updateTable("Media")
    .from("mediaTags")
    .set({ tags: sql`ARRAY(SELECT jsonb_array_elements("mediaTags"."tags"))` })
    .whereRef("Media.id", "=", "mediaTags.id")
    .execute()

  await db.schema.dropTable("mediaTags").execute()

  await db.schema.alterTable("Media").dropColumn("genres").execute()

  await db.schema.alterTable("Media").dropColumn("oneShot").execute()

  await db.schema.dropType("MediaGenres").execute()

  /**
   * Phase 3: Convert volume from INT to TEXT.
   */
  await sql`ALTER TABLE "Cover" ALTER COLUMN "volume" TYPE TEXT USING "volume"::TEXT`.execute(db)

  await sql`ALTER TABLE "Chapter" ALTER COLUMN "volume" TYPE TEXT USING "volume"::TEXT`.execute(db)
}

export function down(): Promise<void> {
  return Promise.reject(
    new Error(
      "refactor-medias cannot be reversed: refactor-trackers, refactor-medias destroy data",
    ),
  )
}
