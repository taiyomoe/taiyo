import { faker } from "@faker-js/faker"
import { COUNTRIES, GENDERS, getDb, sql } from "@taiyomoe/db"
import { env } from "@taiyomoe/db/env"
import { getSampleFile, SAMPLE_DIR, SAMPLE_TABLES } from "@taiyomoe/db/sample"
import { defineCommand } from "citty"
import { FileMigrationProvider, Migrator } from "kysely/migration"
import { spawn } from "node:child_process"
import { createReadStream } from "node:fs"
import * as fs from "node:fs/promises"
import path from "node:path"
import { pipeline } from "node:stream/promises"
import { fileURLToPath } from "node:url"
import { createGunzip, gzipSync } from "node:zlib"
import { repoRoot } from "./env-file.ts"

const MIGRATIONS_DIR = path.join(repoRoot, "packages/db/src/migrations")
const DELETER_TABLES = ["medias", "covers", "banners", "chapters", "titles", "groups", "staffs"]
const UUID_PATTERN = "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
const step = (message: string) => {
  console.log(`\n\u001B[1m→ ${message}\u001B[0m`)
}

export default defineCommand({
  meta: {
    name: "extract-sample",
    description:
      "Build the seed sample from a pre-rewrite production dump: keep a share of the medias with everything attached to them, migrate it, anonymize the users, and write packages/db/src/seeds/sample.",
  },
  args: {
    dump: {
      type: "positional",
      required: true,
      description:
        "Path to the production dump (pg_dump custom format, or plain SQL, optionally gzipped).",
    },
    percent: {
      type: "string",
      description: "Share of the non-deleted medias to keep.",
      default: "5",
    },
    seed: {
      type: "string",
      description: "Seed for the media selection and the fake user data.",
      default: "1",
    },
    database: {
      type: "string",
      description: "Scratch database the dump is restored into. Dropped and recreated.",
      default: "taiyo_sample",
    },
  },
  run: async ({ args }) => {
    const percent = Number(args.percent)
    const seed = Number(args.seed)
    const dumpPath = path.resolve(process.env.INIT_CWD ?? process.cwd(), args.dump)

    if (!(percent > 0 && percent <= 100) || !Number.isInteger(seed)) {
      throw new Error("--percent must be in (0, 100] and --seed must be an integer.")
    }

    if (args.database === new URL(env.DATABASE_URL).pathname.slice(1)) {
      throw new Error("--database must not be the app database, it gets dropped.")
    }

    const admin = getDb()

    step(`Restoring ${dumpPath} into "${args.database}"`)
    await sql`DROP DATABASE IF EXISTS ${sql.id(args.database)} WITH (FORCE)`.execute(admin)
    await sql`CREATE DATABASE ${sql.id(args.database)}`.execute(admin)
    await admin.destroy()

    const handle = await fs.open(dumpPath)
    const { buffer } = await handle.read(Buffer.alloc(5), 0, 5, 0)

    await handle.close()

    const user = decodeURIComponent(new URL(env.DATABASE_URL).username)
    const isCustomFormat = buffer.toString("latin1") === "PGDMP"
    const isGzip = buffer[0] === 0x1f && buffer[1] === 0x8b
    const command = isCustomFormat
      ? ["pg_restore", "--no-owner", "--no-privileges", "-U", user, "-d", args.database]
      : ["psql", "-q", "-U", user, "-d", args.database]
    const child = spawn("docker", ["compose", "exec", "-T", "postgres", ...command], {
      cwd: repoRoot,
      stdio: ["pipe", "inherit", "inherit"],
    })
    const exited = new Promise<number | null>((resolve, reject) => {
      child.once("error", reject)
      child.once("close", resolve)
    })
    const input = createReadStream(dumpPath)

    await (isGzip ? pipeline(input, createGunzip(), child.stdin) : pipeline(input, child.stdin))

    const code = await exited

    if (code !== 0) {
      console.warn(`${command[0]} exited with code ${code}, checking the restored schema anyway.`)
    }

    const scratchUrl = new URL(env.DATABASE_URL)

    scratchUrl.pathname = `/${args.database}`

    const db = getDb(scratchUrl.toString())
    const { rows: publicTables } = await sql<{ name: string }>`
    SELECT table_name AS name FROM information_schema.tables WHERE table_schema = 'public'
  `.execute(db)
    const tables = new Set(publicTables.map((row) => row.name))

    if (!tables.has("Media") || !tables.has("UserHistory") || tables.has("kysely_migration")) {
      throw new Error(
        "The dump does not look like the pre-rewrite production schema (the state of the `init` migration).",
      )
    }

    step(`Keeping ${percent}% of the medias and everything attached to them`)
    await db.transaction().execute(async (trx) => {
      await sql`
      CREATE TABLE "_sampleMedias" AS
      SELECT id FROM "Media"
      WHERE "deletedAt" IS NULL
      ORDER BY md5(id || ${String(seed)})
      LIMIT (
        SELECT ceil(count(*) * ${percent}::numeric / 100)::bigint
        FROM "Media"
        WHERE "deletedAt" IS NULL
      )
    `.execute(trx)
      await sql`ALTER TABLE "_sampleMedias" ADD PRIMARY KEY (id)`.execute(trx)
      await sql`
      CREATE TABLE "_sampleHistories" AS
      SELECT
        h."userId",
        p->>'chapterId' AS "chapterId",
        p->>'pageId' AS "pageId",
        COALESCE((p->>'completed')::boolean, false) AS completed,
        p->>'updatedAt' AS "updatedAt"
      FROM "UserHistory" h
      CROSS JOIN LATERAL unnest(h.progression) AS p
      WHERE h."mediaId" IN (SELECT id FROM "_sampleMedias")
    `.execute(trx)
      await sql`
      CREATE TABLE "_sampleLibraryEntries" AS
      SELECT l."userId", s.status, e->>'mediaId' AS "mediaId", e->>'updatedAt' AS "updatedAt"
      FROM "UserLibrary" l
      CROSS JOIN LATERAL (
        VALUES
          ('READING', l.reading),
          ('REREADING', l.rereading),
          ('PLAN_TO_READ', l."planToRead"),
          ('COMPLETED', l.completed),
          ('ON_HOLD', l."onHold"),
          ('DROPPED', l.dropped)
      ) AS s(status, entries)
      CROSS JOIN LATERAL unnest(s.entries) AS e
      WHERE e->>'mediaId' IN (SELECT id FROM "_sampleMedias")
    `.execute(trx)

      for (const [table, column] of [
        ["Media", "creatorId"],
        ["MediaChapter", "mediaId"],
        ["MediaChapter", "uploaderId"],
        ["MediaCover", "mediaId"],
        ["MediaCover", "uploaderId"],
        ["MediaBanner", "mediaId"],
        ["MediaBanner", "uploaderId"],
        ["MediaTitle", "creatorId"],
        ["MediaTracker", "mediaId"],
        ["MediaTracker", "creatorId"],
        ["Scan", "creatorId"],
      ] as const) {
        await sql`CREATE INDEX ON ${sql.table(table)} (${sql.ref(column)})`.execute(trx)
      }

      await sql`
      TRUNCATE "Account", "Session", "VerificationToken", "Task", "MediaChapterComment",
        "UserHistory", "UserLibrary", "_ScanToScanMember", "ScanMember"
    `.execute(trx)
      await sql`DELETE FROM "Media" WHERE id NOT IN (SELECT id FROM "_sampleMedias")`.execute(trx)
      await sql`DELETE FROM "Scan" WHERE id NOT IN (SELECT "B" FROM "_MediaChapterToScan")`.execute(
        trx,
      )
      await sql`
      CREATE TABLE "_sampleUsers" AS
      SELECT DISTINCT id FROM (
        SELECT "creatorId" AS id FROM "Media"
        UNION SELECT "deleterId" FROM "Media"
        UNION SELECT "uploaderId" FROM "MediaCover"
        UNION SELECT "deleterId" FROM "MediaCover"
        UNION SELECT "uploaderId" FROM "MediaBanner"
        UNION SELECT "deleterId" FROM "MediaBanner"
        UNION SELECT "uploaderId" FROM "MediaChapter"
        UNION SELECT "deleterId" FROM "MediaChapter"
        UNION SELECT "creatorId" FROM "MediaTitle"
        UNION SELECT "deleterId" FROM "MediaTitle"
        UNION SELECT "creatorId" FROM "MediaTracker"
        UNION SELECT "deleterId" FROM "MediaTracker"
        UNION SELECT "creatorId" FROM "Scan"
        UNION SELECT "deleterId" FROM "Scan"
        UNION SELECT "userId" FROM "_sampleHistories"
        UNION SELECT "userId" FROM "_sampleLibraryEntries"
        UNION (SELECT id FROM "User" WHERE role = 'ADMIN' ORDER BY "createdAt" LIMIT 1)
      ) AS referenced
      WHERE id IN (SELECT id FROM "User")
    `.execute(trx)
      await sql`DELETE FROM "UserSetting" WHERE "userId" NOT IN (SELECT id FROM "_sampleUsers")`.execute(
        trx,
      )
      await sql`DELETE FROM "UserProfile" WHERE "userId" NOT IN (SELECT id FROM "_sampleUsers")`.execute(
        trx,
      )
      await sql`DELETE FROM "User" WHERE id NOT IN (SELECT id FROM "_sampleUsers")`.execute(trx)
    })

    step("Running the migrations")
    const [initMigration] = (await fs.readdir(MIGRATIONS_DIR)).sort()

    if (initMigration === undefined) {
      throw new Error(`No migrations found in ${MIGRATIONS_DIR}.`)
    }

    await sql`
    CREATE TABLE kysely_migration (
      name varchar(255) NOT NULL PRIMARY KEY,
      timestamp varchar(255) NOT NULL
    )
  `.execute(db)
    await sql`
    INSERT INTO kysely_migration (name, timestamp)
    VALUES (${path.parse(initMigration).name}, ${new Date().toISOString()})
  `.execute(db)

    const migrator = new Migrator({
      db,
      provider: new FileMigrationProvider({ fs, path, migrationFolder: MIGRATIONS_DIR }),
    })
    const { error, results } = await migrator.migrateToLatest()

    for (const result of results ?? []) {
      console.log(`  ${result.status === "Success" ? "✓" : "✗"} ${result.migrationName}`)
    }

    if (error !== undefined) {
      throw error instanceof Error ? error : new Error("The migrations failed.", { cause: error })
    }

    step("Converting history and library, anonymizing users")
    await db.transaction().execute(async (trx) => {
      const { rows: triggers } = await sql<{ table: string; name: string }>`
      SELECT c.relname AS table, t.tgname AS name
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      WHERE NOT t.tgisinternal AND c.relnamespace = 'public'::regnamespace
    `.execute(trx)

      for (const trigger of triggers) {
        await sql`ALTER TABLE ${sql.table(trigger.table)} DISABLE TRIGGER ${sql.id(trigger.name)}`.execute(
          trx,
        )
      }

      await sql`
      INSERT INTO "userHistories" ("userId", "chapterId", "pageId", completed, "createdAt", "updatedAt")
      SELECT DISTINCT ON (h."userId", c.id)
        h."userId"::uuid,
        c.id,
        CASE WHEN h."pageId" ~* ${UUID_PATTERN} THEN h."pageId"::uuid END,
        h.completed,
        h.ts,
        h.ts
      FROM (
        SELECT *, COALESCE(("updatedAt"::timestamptz) AT TIME ZONE 'UTC', LOCALTIMESTAMP(3)) AS ts
        FROM "_sampleHistories"
      ) h
      JOIN chapters c ON c.id::text = h."chapterId"
      ORDER BY h."userId", c.id, h.ts DESC
    `.execute(trx)
      await sql`
      INSERT INTO "userLibraryEntries" ("userId", "mediaId", status, "createdAt", "updatedAt")
      SELECT DISTINCT ON (e."userId", e."mediaId")
        e."userId"::uuid,
        e."mediaId"::uuid,
        e.status::"UserLibraryStatus",
        e.ts,
        e.ts
      FROM (
        SELECT *, COALESCE(("updatedAt"::timestamptz) AT TIME ZONE 'UTC', LOCALTIMESTAMP(3)) AS ts
        FROM "_sampleLibraryEntries"
      ) e
      ORDER BY e."userId", e."mediaId", e.ts DESC
    `.execute(trx)

      const { rows: userRows } = await sql<{ id: string }>`
      SELECT id FROM users ORDER BY "createdAt", id
    `.execute(trx)
      const { rows: profileRows } = await sql<{ id: string }>`
      SELECT p.id FROM "userProfiles" p JOIN users u ON u.id = p."userId" ORDER BY u."createdAt", u.id
    `.execute(trx)

      faker.seed(seed)

      const taken = new Set<string>()
      const users = userRows.map(({ id: oldId }) => {
        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
        const base = faker.internet
          .username({ firstName, lastName })
          .replace(/[^a-zA-Z0-9_.]/g, "")
          .slice(0, 25)
          .padEnd(3, "0")
        let displayUsername = base

        for (let suffix = 2; taken.has(displayUsername.toLowerCase()); suffix++) {
          displayUsername = `${base}${suffix}`
        }

        const username = displayUsername.toLowerCase()

        taken.add(username)

        return {
          oldId,
          newId: faker.string.uuid(),
          name: `${firstName} ${lastName}`,
          username,
          displayUsername,
          email: `${username}@example.com`,
        }
      })
      const profiles = profileRows.map(({ id: oldId }) => ({
        oldId,
        newId: faker.string.uuid(),
        birthDate: faker.datatype.boolean()
          ? faker.date.birthdate({ mode: "age", min: 14, max: 50 }).toISOString()
          : null,
        gender: faker.helpers.arrayElement(GENDERS),
        city: faker.datatype.boolean() ? faker.location.city() : null,
        country: faker.datatype.boolean() ? faker.helpers.arrayElement(COUNTRIES) : null,
        about: faker.datatype.boolean({ probability: 0.3 })
          ? { pt_br: faker.lorem.sentences(2) }
          : {},
        points: faker.number.int({ min: 0, max: 5000 }),
      }))
      const { rows: groupRows } = await sql<{ id: string }>`
      SELECT id FROM groups WHERE email IS NOT NULL ORDER BY id
    `.execute(trx)
      const groupEmails = groupRows.map(({ id }) => ({
        id,
        email: faker.internet.email({ provider: "example.com" }).toLowerCase(),
      }))

      await sql`
      CREATE TEMP TABLE "_leakedIds" ON COMMIT DROP AS
      SELECT id::text FROM users UNION SELECT id::text FROM "userProfiles"
    `.execute(trx)
      await sql`
      CREATE TEMP TABLE "_userIdMap" ON COMMIT DROP AS
      SELECT * FROM jsonb_to_recordset(${JSON.stringify(users)}::jsonb)
        AS f("oldId" uuid, "newId" uuid, name text, username text, "displayUsername" text, email text)
    `.execute(trx)

      const { rows: userReferences } = await sql<{ table: string; column: string }>`
      SELECT cl.relname AS table, a.attname AS column
      FROM pg_constraint c
      JOIN pg_class cl ON cl.oid = c.conrelid
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
      WHERE c.contype = 'f' AND c.confrelid = 'users'::regclass
    `.execute(trx)

      for (const { table, column } of userReferences) {
        await sql`CREATE INDEX ON ${sql.table(table)} (${sql.ref(column)})`.execute(trx)
      }

      for (const table of DELETER_TABLES) {
        await sql`
        UPDATE ${sql.table(table)} t
        SET "deleterId" = (SELECT m."newId" FROM "_userIdMap" m WHERE m."oldId" = t."deleterId")
        WHERE "deleterId" IS NOT NULL
      `.execute(trx)
      }

      await sql`
      UPDATE users SET username = id::text, "displayUsername" = id::text, email = NULL
    `.execute(trx)
      await sql`
      UPDATE users u
      SET
        id = m."newId",
        name = m.name,
        username = m.username,
        "displayUsername" = m."displayUsername",
        email = m.email,
        "normalizedEmail" = m.email,
        "emailVerified" = true,
        image = NULL,
        "banReason" = CASE WHEN u."banReason" IS NULL THEN NULL ELSE 'Anonymized' END
      FROM "_userIdMap" m
      WHERE u.id = m."oldId"
    `.execute(trx)
      await sql`
      UPDATE "userProfiles" p
      SET
        id = f."newId",
        banner = NULL,
        "birthDate" = f."birthDate",
        gender = f.gender::"Genders",
        city = f.city,
        country = f.country::"Countries",
        about = f.about,
        points = f.points
      FROM jsonb_to_recordset(${JSON.stringify(profiles)}::jsonb) AS f(
        "oldId" uuid, "newId" uuid, "birthDate" timestamp(3), gender text, city text,
        country text, about jsonb, points integer
      )
      WHERE p.id = f."oldId"
    `.execute(trx)
      await sql`
      UPDATE groups g
      SET email = f.email
      FROM jsonb_to_recordset(${JSON.stringify(groupEmails)}::jsonb) AS f(id uuid, email text)
      WHERE g.id = f.id
    `.execute(trx)
      await sql`
      INSERT INTO "featuredMedias" ("mediaId", position)
      SELECT id, row_number() OVER (ORDER BY readers DESC, id) - 1
      FROM (
        SELECT m.id, count(DISTINCT h."userId") AS readers
        FROM medias m
        LEFT JOIN chapters c ON c."mediaId" = m.id
        LEFT JOIN "userHistories" h ON h."chapterId" = c.id
        WHERE m."deletedAt" IS NULL
          AND m."contentRating" = 'NORMAL'
          AND EXISTS (
            SELECT 1 FROM covers cv
            WHERE cv."mediaId" = m.id AND cv."isMainCover" AND cv."deletedAt" IS NULL
          )
        GROUP BY m.id
        ORDER BY readers DESC, m.id
        LIMIT 10
      ) ranked
    `.execute(trx)
      await sql`TRUNCATE "searchOutbox", tasks, sessions, accounts, verifications`.execute(trx)

      const { rows: columns } = await sql<{ table: string; column: string }>`
      SELECT c.table_name AS table, c.column_name AS column
      FROM information_schema.columns c
      JOIN information_schema.tables t
        ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      WHERE c.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        AND c.data_type IN ('uuid', 'text', 'character varying')
        AND c.table_name NOT LIKE '\\_%'
        AND c.table_name NOT LIKE 'kysely%'
    `.execute(trx)

      for (const { table, column } of columns) {
        const { rows } = await sql<{ count: string }>`
        SELECT count(*) AS count FROM ${sql.table(table)}
        WHERE ${sql.ref(column)}::text IN (SELECT id FROM "_leakedIds")
      `.execute(trx)

        if (Number(rows[0]?.count) > 0) {
          throw new Error(`${table}.${column} still holds ${rows[0]?.count} production user IDs.`)
        }
      }

      for (const trigger of triggers) {
        await sql`ALTER TABLE ${sql.table(trigger.table)} ENABLE TRIGGER ${sql.id(trigger.name)}`.execute(
          trx,
        )
      }
    })

    step(`Writing ${path.relative(repoRoot, fileURLToPath(SAMPLE_DIR))}`)
    await fs.rm(SAMPLE_DIR, { recursive: true, force: true })
    await fs.mkdir(SAMPLE_DIR, { recursive: true })

    for (const table of SAMPLE_TABLES) {
      const { rows } = await sql<{ row: string }>`
      SELECT row_to_json(t)::text AS row FROM ${sql.table(table)} AS t ORDER BY t
    `.execute(db)
      const file = getSampleFile(table)

      await fs.writeFile(file, gzipSync(rows.map((row) => `${row.row}\n`).join(""), { level: 9 }))

      const { size } = await fs.stat(file)

      console.log(
        `  ${table.padEnd(20)} ${String(rows.length).padStart(8)} rows ${(size / 1024 / 1024).toFixed(2).padStart(8)} MB`,
      )
    }

    await db.destroy()

    console.log(
      `\nDone. "${args.database}" is left in place for inspection. Download the images with \`pnpm -F @taiyomoe/scripts cli download-sample-images\`.`,
    )
    process.exit(0)
  },
})
