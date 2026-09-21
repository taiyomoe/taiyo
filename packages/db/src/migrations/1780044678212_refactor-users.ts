import { faker } from "@faker-js/faker"
import { type Kysely, sql } from "kysely"
import normalizeEmail from "validator/lib/normalizeEmail"

const USERNAME_MIN = 3
const USERNAME_MAX = 30
const DISPLAY_NAME_MIN = 3
const DISPLAY_NAME_MAX = 30
const normalizeUsername = (input: string) => {
  const normalized = input
    .slice(0, USERNAME_MAX)
    .replaceAll(" ", "_")
    .replace(/[^a-zA-Z0-9_.]/g, "")
    .toLowerCase()

  return normalized.length < USERNAME_MIN ? faker.internet.username() : normalized
}
const normalizeDisplayName = (input: string) => {
  const normalized = input.slice(0, DISPLAY_NAME_MAX).replace(/[^a-zA-Z0-9_.\s]/g, "")

  return normalized.length < DISPLAY_NAME_MIN ? faker.internet.username() : normalized
}

export async function up(db: Kysely<any>): Promise<void> {
  /**
   * Phase 1: better-auth migration (Account/Session/Verification + bans).
   */
  await db.schema.dropIndex("Account_provider_providerAccountId_key").execute()

  await db.schema.dropIndex("Session_sessionToken_key").execute()

  await db.schema.alterTable("Account").renameColumn("access_token", "accessToken").execute()

  await db.schema.alterTable("Account").renameColumn("refresh_token", "refreshToken").execute()

  await db.schema.alterTable("Account").renameColumn("expires_at", "accessTokenExpiresAt").execute()

  await db.schema.alterTable("Account").renameColumn("providerAccountId", "accountId").execute()

  await db.schema.alterTable("Account").renameColumn("id_token", "idToken").execute()

  await db.schema.alterTable("Account").renameColumn("provider", "providerId").execute()

  await db.schema
    .alterTable("Account")
    .dropColumn("session_state")
    .dropColumn("token_type")
    .dropColumn("type")
    .addColumn("password", "text")
    .addColumn("refreshTokenExpiresAt", sql`timestamp(3)`)
    .execute()

  await sql`ALTER TABLE "Account" ALTER COLUMN "accessTokenExpiresAt" TYPE TIMESTAMP(3) USING to_timestamp("accessTokenExpiresAt")`.execute(
    db,
  )

  await db.schema.alterTable("Session").renameColumn("expires", "expiresAt").execute()

  await db.schema.alterTable("Session").renameColumn("sessionToken", "token").execute()

  await db.schema
    .alterTable("Session")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .addColumn("impersonatedBy", "text")
    .addColumn("ipAddress", "text")
    .addColumn("userAgent", "text")
    .execute()

  await db.schema.alterTable("Session").addPrimaryKeyConstraint("Session_pkey", ["id"]).execute()

  await db.schema
    .alterTable("User")
    .alterColumn("name", (c) => c.setNotNull())
    .addColumn("banExpires", sql`timestamp(3)`)
    .addColumn("banReason", "text")
    .addColumn("banned", "boolean")
    .execute()

  await db.schema.dropTable("VerificationToken").execute()

  await db.schema
    .createTable("Verification")
    .addColumn("id", "uuid", (c) => c.notNull().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("expiresAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("identifier", "text", (c) => c.notNull())
    .addColumn("value", "text", (c) => c.notNull())
    .addPrimaryKeyConstraint("Verification_pkey", ["id"])
    .execute()

  await db.schema
    .createIndex("Account_accountId_providerId_userId_key")
    .on("Account")
    .columns(["accountId", "providerId", "userId"])
    .unique()
    .execute()

  await db.schema.createIndex("Session_token_key").on("Session").column("token").unique().execute()

  /**
   * Phase 2: Convert emailVerified (timestamp) to boolean and add normalizedEmail column to User table.
   */
  await db.schema
    .alterTable("User")
    .dropColumn("emailVerified")
    .addColumn("emailVerified", "boolean", (c) => c.notNull().defaultTo(false))
    .execute()

  await db.schema
    .alterTable("User")
    .alterColumn("emailVerified", (c) => c.dropDefault())
    .execute()

  await db.schema.alterTable("User").addColumn("normalizedEmail", "text").execute()

  const usersForEmail = await db.selectFrom("User").select(["id", "email"]).execute()

  for (const user of usersForEmail) {
    const normalized = user.email ? normalizeEmail(user.email) : null

    if (normalized === false) {
      throw new Error(`Failed to normalize email for user ${user.id}`)
    }

    await db
      .updateTable("User")
      .set({ normalizedEmail: normalized ?? null })
      .where("id", "=", user.id)
      .execute()
  }

  /**
   * Phase 3: add username and displayUsername columns to User table.
   */
  await db.schema
    .alterTable("User")
    .addColumn("displayUsername", "text")
    .addColumn("username", "text")
    .execute()

  await db.schema.createIndex("User_username_key").on("User").column("username").unique().execute()

  await db.schema
    .createIndex("User_displayUsername_key")
    .on("User")
    .column("displayUsername")
    .unique()
    .execute()

  const usersForUsername = await db
    .selectFrom("User")
    .select(["id", "name"])
    .orderBy("createdAt", "asc")
    .execute()
  const takenUsernames = new Set<string>()
  const takenDisplayUsernames = new Set<string>()
  const generateUsername = (set: Set<string>): string => {
    const candidate = faker.internet.username()

    return set.has(candidate) ? generateUsername(set) : candidate
  }
  const generateDisplayUsername = (set: Set<string>): string => {
    const candidate = faker.internet.displayName()

    return set.has(candidate) ? generateDisplayUsername(set) : candidate
  }

  for (const user of usersForUsername) {
    let username = normalizeUsername(user.name)
    let displayUsername = normalizeDisplayName(user.name)

    if (takenUsernames.has(username)) {
      username = generateUsername(takenUsernames).toLowerCase()
    }

    if (takenDisplayUsernames.has(displayUsername)) {
      displayUsername = generateDisplayUsername(takenDisplayUsernames)
    }

    await db
      .updateTable("User")
      .set({ username, displayUsername })
      .where("id", "=", user.id)
      .execute()

    takenUsernames.add(username)
    takenDisplayUsernames.add(displayUsername)
  }

  await db.schema
    .alterTable("User")
    .alterColumn("displayUsername", (c) => c.setNotNull())
    .alterColumn("username", (c) => c.setNotNull())
    .execute()

  /**
   * Phase 4: Convert UserSetting table to settings column in User table.
   */
  await db.schema
    .alterTable("User")
    .addColumn("settings", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .execute()

  const settingsRows = await db
    .selectFrom("UserSetting")
    .select(["userId", "preferredTitles", "showFollowing", "showLibrary", "homeLayout"])
    .execute()

  for (const row of settingsRows) {
    const rawSettings = {
      preferredTitles: row.preferredTitles,
      showFollowing: row.showFollowing ? null : false,
      showLibrary: row.showLibrary ? null : false,
      homeLayout: row.homeLayout === "ROWS" ? null : "COLUMNS",
    }
    const settings = Object.fromEntries(
      Object.entries(rawSettings).filter(([, value]) => value !== null),
    )

    await db
      .updateTable("User")
      .set({ settings: sql`${JSON.stringify(settings)}::jsonb` })
      .where("id", "=", row.userId)
      .execute()
  }

  await db.schema.dropTable("UserSetting").execute()

  await db.schema.dropType("HomeLayout").execute()

  /**
   * Phase 5: Convert about (text) to jsonb in UserProfile table.
   */
  await sql`ALTER TABLE "UserProfile" ALTER COLUMN "about" TYPE JSONB USING CASE WHEN "about" IS NOT NULL THEN jsonb_build_object('pt-br', "about") ELSE '{}' END`.execute(
    db,
  )
  await db.schema
    .alterTable("UserProfile")
    .alterColumn("about", (c) => c.setDefault(sql`'{}'::jsonb`))
    .execute()

  await db.schema
    .alterTable("UserProfile")
    .alterColumn("about", (c) => c.setNotNull())
    .execute()
}

export async function down(): Promise<void> {
  throw new Error("refactor-users is a destructive data-type migration and cannot be reversed")
}
