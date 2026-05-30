import { faker, fakerEN, fakerPT_BR } from "@faker-js/faker"
import type { Kysely } from "kysely"
import type { DB } from "../database"

// Inlined to keep @taiyomoe/db a leaf package (no workspace cycle with @taiyomoe/utils).
const USERNAME = { minLength: 3, maxLength: 30 }
const DISPLAY_NAME = { minLength: 3, maxLength: 30 }
const normalizeUsername = (input: string) => {
  const normalized = input
    .slice(0, USERNAME.maxLength)
    .replaceAll(" ", "_")
    .replace(/[^a-zA-Z0-9_.]/g, "")
    .toLowerCase()

  return normalized.length < USERNAME.minLength ? faker.internet.username() : normalized
}
const normalizeDisplayName = (input: string) => {
  const normalized = input.slice(0, DISPLAY_NAME.maxLength).replace(/[^a-zA-Z0-9_.\s]/g, "")

  return normalized.length < DISPLAY_NAME.minLength ? faker.internet.username() : normalized
}
const LANGUAGES = [
  "en",
  "pt_br",
  "pt_pt",
  "es",
  "es_la",
  "fr",
  "de",
  "ja",
  "ja_ro",
  "ko",
  "ko_ro",
  "zh",
  "zh_hk",
  "zh_ro",
] as const
const GENDERS = ["MALE", "FEMALE", "OTHER", "NOT_SPECIFIED"] as const
const USERS = [
  // Drope Scan
  {
    id: "5afbbfef-0a99-4be1-8080-cf856786290f",
    name: "Hipon",
    email: "hipon@gmail.com",
  },
  {
    id: "1f36d9db-3187-449e-ab95-5bebb7d25bd2",
    name: "Argen-chan",
    email: "argen-chan@gmail.com",
  },
  {
    id: "2df975c5-2354-4273-b9fb-d0648b9535fb",
    name: "Conrad",
    email: "conrad@gmail.com",
  },
  {
    id: "709e7044-bc20-4241-abc3-eef6fd5b88a3",
    name: "Getauscht",
    email: "getauscht@gmail.com",
  },

  // Gekkou
  {
    id: "340dfc72-fa23-4941-a925-91d6088dbc41",
    name: "Kenshi",
    email: "kenshi@gmail.com",
  },
  {
    id: "f29c8026-15cf-49dd-a899-1d33468ab9e2",
    name: "Tio Clóvis",
    email: "tioclovis@gmail.com",
  },
  {
    id: "8d4d60de-a983-43c1-bafb-4d2a19f7fff8",
    name: "BriFF",
    email: "briff@gmail.com",
  },

  // Kousen Scans
  {
    id: "54044138-275b-4248-8842-ee7a72d6c8a4",
    name: "Hiei",
    email: "hiei@gmail.com",
  },
  {
    id: "3db8ea16-b5c2-48eb-937f-a7b346e19d29",
    name: "LEONARUTO",
    email: "leonaruto@gmail.com",
  },

  // Kyodai Mangás
  {
    id: "81825dd9-01c5-4a8a-9882-f63fd53cc163",
    name: "Gah",
    email: "gah@gmail.com",
  },
  {
    id: "6c60a451-4a2d-4179-9b76-7be17d661f53",
    name: "engels",
    email: "engels@gmail.com",
  },

  // AnimaRegia Scantrad
  {
    id: "f1cfb3ad-3821-4fef-ac68-933594d44243",
    name: "Butcher",
    email: "butcher@gmail.com",
  },
  {
    id: "92fdb5fd-9c1a-4ef9-92c3-6a6a5ae2e6fa",
    name: "Isabella",
    email: "isabella@gmail.com",
  },

  // Shin Sekai Scans
  {
    id: "e368b9b5-fc7e-4235-9f08-9902db00a691",
    name: "Seinen",
    email: "seinen@gmail.com",
  },
  {
    id: "4ede745e-519d-4d09-b930-d91af930f12c",
    name: "Nintakun",
    email: "nintakun@gmail.com",
  },

  // Neox Scans
  {
    id: "8e27fec3-6218-440b-82ea-61a52373882e",
    name: "Mel",
    email: "mel@gmail.com",
  },
  {
    id: "bf8efe61-85c1-4880-b2ac-ccbfcf8fa987",
    name: "Tsuki",
    email: "tsuki@gmail.com",
  },

  // Saikai Scans
  {
    id: "e97f1d3d-22a5-4fa8-ac37-aa9569be03a5",
    name: "Hyung",
    email: "hyung@gmail.com",
  },
  {
    id: "0658d346-338b-49d3-9939-7ea5b9069623",
    name: "Dokohan",
    email: "dokohan@gmail.com",
  },
  {
    id: "dc345ee8-12c5-4f18-8579-774cac5f225b",
    name: "ifdruidas",
    email: "ifdruidas@gmail.com",
  },
  {
    id: "2885b836-4a4f-41e0-939a-5cf816cb3612",
    name: "Sparky",
    email: "sparky@gmail.com",
  },

  // Saturn Scan
  {
    id: "6b8b87eb-382c-4fc1-9da6-a6e8b21f6be8",
    name: "Sena",
    email: "sena@gmail.com",
  },
  {
    id: "afea4c1f-b685-461e-aa6d-a3ebdd1640f2",
    name: "Araragi",
    email: "araragi@gmail.com",
  },

  // Others
  {
    id: "db852a04-7406-4a6a-87f2-1b494e810a29",
    name: "Calvo",
    email: "calvo@gmail.com",
  },
] as const

export async function seed(db: Kysely<DB>): Promise<void> {
  await db
    .insertInto("users")
    .values(
      USERS.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        username: normalizeUsername(u.name),
        displayUsername: normalizeDisplayName(u.name),
        emailVerified: true,
        image: faker.datatype.boolean({ probability: 0.7 }) ? null : faker.image.avatarGitHub(),
        settings: {
          contentRating: faker.helpers.weightedArrayElement([
            { value: ["NORMAL", "SUGGESTIVE"], weight: 70 },
            { value: ["NORMAL", "SUGGESTIVE", "NSFW"], weight: 15 },
            { value: ["NORMAL", "SUGGESTIVE", "NSFW", "NSFL"], weight: 15 },
          ]),
          preferredTitles: faker.helpers.arrayElement(LANGUAGES),
          showFollowing: faker.datatype.boolean({ probability: 0.7 }),
          showLibrary: faker.datatype.boolean({ probability: 0.7 }),
        },
      })),
    )
    .execute()

  // Follow relationships (_userFollows: A follows B)
  const followRows: { A: string; B: string }[] = []

  for (const user of USERS) {
    const followers = faker.helpers
      .arrayElements([...USERS], { min: 0, max: 15 })
      .filter((u) => u.id !== user.id)
    const following = faker.helpers
      .arrayElements([...USERS], { min: 0, max: 15 })
      .filter((u) => u.id !== user.id)

    for (const f of followers) followRows.push({ A: f.id, B: user.id })
    for (const f of following) followRows.push({ A: user.id, B: f.id })
  }

  // Deduplicate (A,B) pairs
  const seen = new Set<string>()
  const uniqueFollows = followRows.filter((r) => {
    const k = `${r.A}|${r.B}`

    if (seen.has(k)) return false

    seen.add(k)

    return true
  })

  if (uniqueFollows.length > 0) {
    await db.insertInto("_userFollows").values(uniqueFollows).execute()
  }

  await db
    .insertInto("userProfiles")
    .values(
      USERS.map((u) => ({
        banner: faker.datatype.boolean({ probability: 0.7 })
          ? null
          : faker.image.url({ width: 1920, height: 350 }),
        birthDate: faker.date.birthdate(),
        gender: faker.helpers.arrayElement(GENDERS),
        city: fakerPT_BR.location.city(),
        country: "br",
        about: {
          en: fakerEN.lorem.sentence(),
          pt_br: fakerPT_BR.lorem.sentence(),
        },
        points: faker.number.int({ min: 0, max: 1000 }),
        userId: u.id,
      })),
    )
    .execute()
}
