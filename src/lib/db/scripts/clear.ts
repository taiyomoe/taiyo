import { db } from "../";

async function clear() {
  if (process.env.NODE_ENV === "development") {
    console.log("Clearing database...\n");

    await db.$executeRaw`DROP TABLE IF EXISTS "_MediaChapterToScan";`
      .then(() => console.log("_MediaChapterToScan deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "_ScanToScanMember";`
      .then(() => console.log("_ScanToScanMember deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "MediaChapterComment";`
      .then(() => console.log("MediaChapterComment deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "MediaChapter";`
      .then(() => console.log("MediaChapter deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "MediaTag";`
      .then(() => console.log("MediaTag deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "MediaTitle";`
      .then(() => console.log("MediaTitle deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "MediaTracker";`
      .then(() => console.log("MediaTracker deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "MediaCover";`
      .then(() => console.log("MediaCover deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "MediaBanner";`
      .then(() => console.log("MediaBanner deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "Media";`
      .then(() => console.log("Media deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "Tag";`
      .then(() => console.log("Tag deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "ScanMember";`
      .then(() => console.log("Scan deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "Scan";`
      .then(() => console.log("Scan deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "Account";`
      .then(() => console.log("Account deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "Session";`
      .then(() => console.log("Session deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "VerificationToken";`
      .then(() => console.log("VerificationToken deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "UserSetting";`
      .then(() => console.log("UserSetting deleted"))
      .catch((err) => console.error(err));
    await db.$executeRaw`DROP TABLE IF EXISTS "User";`
      .then(() => console.log("User deleted"))
      .catch((err) => console.error(err));
  }
}

clear()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  });
