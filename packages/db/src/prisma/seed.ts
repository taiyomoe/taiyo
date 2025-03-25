import group1 from "./seeds/groups/group-1"
import group2 from "./seeds/groups/group-2"
import group3 from "./seeds/groups/group-3"
import group4 from "./seeds/groups/group-4"
import group5 from "./seeds/groups/group-5"
import group6 from "./seeds/groups/group-6"
import group7 from "./seeds/groups/group-7"
import group8 from "./seeds/groups/group-8"
import group9 from "./seeds/groups/group-9"
import group10 from "./seeds/groups/group-10"
import group11 from "./seeds/groups/group-11"
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
import users from "./seeds/users"

async function main() {
  if (
    !process.env.NEXT_PUBLIC_MEILISEARCH_URL ||
    !process.env.MEILISEARCH_ADMIN_KEY
  ) {
    console.error("Missing MeiliSearch URL or admin key")
    process.exit(1)
  }

  console.log("Seeding database and executing logs migrations...")

  // Users
  console.log("\nUsers:")
  await users.execute().then(() => console.log("Users seeded"))

  // Medias
  console.log("\nMedias:")
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

  // Groups
  console.log("\nGroups:")
  await group1.execute().then(() => console.log("Group 1 seeded"))
  await group2.execute().then(() => console.log("Group 2 seeded"))
  await group3.execute().then(() => console.log("Group 3 seeded"))
  await group4.execute().then(() => console.log("Group 4 seeded"))
  await group5.execute().then(() => console.log("Group 5 seeded"))
  await group6.execute().then(() => console.log("Group 6 seeded"))
  await group7.execute().then(() => console.log("Group 7 seeded"))
  await group8.execute().then(() => console.log("Group 8 seeded"))
  await group9.execute().then(() => console.log("Group 9 seeded"))
  await group10.execute().then(() => console.log("Group 10 seeded"))
  await group11.execute().then(() => console.log("Group 11 seeded"))

  // Meilisearch
  console.log("\nMeilisearch:")
  await meilisearch.execute().then(() => console.log("Meilisearch reindexed"))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
