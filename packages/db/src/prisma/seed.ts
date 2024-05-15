import media1 from "./seeds/medias/media-1"
import media2 from "./seeds/medias/media-2"
import media3 from "./seeds/medias/media-3"
import media4 from "./seeds/medias/media-4"
import media5 from "./seeds/medias/media-5"
import media6 from "./seeds/medias/media-6"
import media7 from "./seeds/medias/media-7"
import media8 from "./seeds/medias/media-8"
import media9 from "./seeds/medias/media-9"
import media10 from "./seeds/medias/media-10"
import meilisearch from "./seeds/meilisearch.seed"
import scan1 from "./seeds/scans/scan-1"
import scan2 from "./seeds/scans/scan-2"
import scan3 from "./seeds/scans/scan-3"
import scan4 from "./seeds/scans/scan-4"
import scan5 from "./seeds/scans/scan-5"
import scan6 from "./seeds/scans/scan-6"
import scan7 from "./seeds/scans/scan-7"
import scan8 from "./seeds/scans/scan-8"
import scan9 from "./seeds/scans/scan-9"
import scan10 from "./seeds/scans/scan-10"
import scan11 from "./seeds/scans/scan-11"
import users from "./seeds/users"

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Cannot run seed in production")
    process.exit(1)
  }

  if (
    !process.env.NEXT_PUBLIC_MEILISEARCH_URL ||
    !process.env.MEILISEARCH_ADMIN_KEY
  ) {
    console.error("Missing MeiliSearch URL or admin key")
    process.exit(1)
  }

  console.log("Seeding database...")

  // Users
  await users.execute().then(() => console.log("Users seeded"))

  // Medias
  await media1.execute().then(() => console.log("Media 1 seeded"))
  await media2.execute().then(() => console.log("Media 2 seeded"))
  await media3.execute().then(() => console.log("Media 3 seeded"))
  await media4.execute().then(() => console.log("Media 4 seeded"))
  await media5.execute().then(() => console.log("Media 5 seeded"))
  await media6.execute().then(() => console.log("Media 6 seeded"))
  await media7.execute().then(() => console.log("Media 7 seeded"))
  await media8.execute().then(() => console.log("Media 8 seeded"))
  await media9.execute().then(() => console.log("Media 9 seeded"))
  await media10.execute().then(() => console.log("Media 10 seeded"))

  // Scans
  await scan1.execute().then(() => console.log("Scan 1 seeded"))
  await scan2.execute().then(() => console.log("Scan 2 seeded"))
  await scan3.execute().then(() => console.log("Scan 3 seeded"))
  await scan4.execute().then(() => console.log("Scan 4 seeded"))
  await scan5.execute().then(() => console.log("Scan 5 seeded"))
  await scan6.execute().then(() => console.log("Scan 6 seeded"))
  await scan7.execute().then(() => console.log("Scan 7 seeded"))
  await scan8.execute().then(() => console.log("Scan 8 seeded"))
  await scan9.execute().then(() => console.log("Scan 9 seeded"))
  await scan10.execute().then(() => console.log("Scan 10 seeded"))
  await scan11.execute().then(() => console.log("Scan 11 seeded"))

  // Meilisearch
  await meilisearch.execute().then(() => console.log("Meilisearch reindexed"))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
