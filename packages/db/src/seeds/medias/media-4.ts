import type { Kysely } from "kysely"
import type { DB } from "../../database"

export const execute = async (db: Kysely<DB>): Promise<void> => {
  const now = new Date()

  await db
    .insertInto("medias")
    .values({
      id: "35a1efbe-9bdc-45f1-8483-220995449eaa",
      synopsis: {
        en: 'How would you react if one day you were sucked into an MMORPG and could never get out? After a mysterious incident, roughly 30,000 players from Japan are now forced to live their life inside the MMORPG "Elder Tale" and can not log out. Even death is met with a respawn. Even worse is the fact that food has absolutely no taste. All this combined, many of the players inside this MMO has lost any will to actually play this game, but they are never allowed to leave. A player named Shiro will venture forth to uncover the mystery behind the reason why they are inside this game.',
      },
      contentRating: "NORMAL",
      tags: [
        { key: "ROMANCE", isSpoiler: false },
        { key: "ADVENTURE", isSpoiler: false },
        { key: "ISEKAI", isSpoiler: false },
        { key: "FANTASY", isSpoiler: false },
      ],
      type: "MANGA",
      status: "CANCELLED",
      source: "ORIGINAL",
      demography: "SHOUNEN",
      countryOfOrigin: "JAPAN",
      flag: "OK",
      links: {
        mangaDex: "fead53e5-f3b5-4793-b19f-b483208ad04e",
        anilist: 75893,
        animePlanet: "https://www.anime-planet.com/manga/log-horizon",
        mangaUpdates: "https://www.mangaupdates.com/series.html?id=03dlf2b",
        myAnimeList: 45893,
        kitsu: "https://kitsu.io/api/edge/manga/1762",
        officialENTranslation: "https://yenpress.com/series/log-horizon-manga",
      },
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      startDate: null,
      endDate: null,
    })
    .execute()

  await db
    .insertInto("titles")
    .values([
      {
        mediaId: "35a1efbe-9bdc-45f1-8483-220995449eaa",
        title: "Log Horizon",
        language: "en",
        priority: 1,
        isAcronym: false,
        isMainTitle: true,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
      {
        mediaId: "35a1efbe-9bdc-45f1-8483-220995449eaa",
        title: "ログ。ホライズン",
        language: "ja",
        priority: 1,
        isAcronym: false,
        isMainTitle: false,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
    ])
    .execute()

  await db
    .insertInto("covers")
    .values([
      {
        id: "787cdbe5-b23b-47b4-ab80-68b2b470e2b3",
        mediaId: "35a1efbe-9bdc-45f1-8483-220995449eaa",
        volume: null,
        language: "ja",
        contentRating: "NORMAL",
        isMainCover: true,
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
      {
        id: "1d689df5-8d8d-4aad-972c-b8ef932bde7c",
        mediaId: "35a1efbe-9bdc-45f1-8483-220995449eaa",
        volume: "1",
        language: "ja",
        contentRating: "NORMAL",
        isMainCover: false,
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
    ])
    .execute()

  await db
    .insertInto("staffs")
    .values([
      {
        id: "2f82a964-dfd4-4c25-83c5-c8af95dca667",
        name: "Touno Mamare",
        bio: {},
        links: {},
        image: null,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
      {
        id: "edaf7a28-c9c9-4b83-a3be-4087b3e4fcae",
        name: "Hara Kazuhiro",
        bio: {
          en: "**Name In Native Language:** ハラカズヒロ\n\nLight novel illustrator & character designer for [A B-Grade Adventurer With a Bad Guy Face Becomes a Daddy to the Protagonist and His Childhood Friends](https://mangadex.org/title/a21eab2d-781d-40b2-a666-7b2d72551927).",
        },
        links: {
          website: "https://ninefive95.com/",
          twitter: "https://twitter.com/harapand",
        },
        image: null,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
    ])
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()

  await db
    .insertInto("staffOnMedias")
    .values([
      {
        mediaId: "35a1efbe-9bdc-45f1-8483-220995449eaa",
        staffId: "2f82a964-dfd4-4c25-83c5-c8af95dca667",
        role: "AUTHOR",
      },
      {
        mediaId: "35a1efbe-9bdc-45f1-8483-220995449eaa",
        staffId: "edaf7a28-c9c9-4b83-a3be-4087b3e4fcae",
        role: "ARTIST",
      },
    ])
    .execute()

  await db
    .insertInto("chapters")
    .values([
      {
        id: "c72b0642-0dc4-478f-b226-647bae417db4",
        mediaId: "35a1efbe-9bdc-45f1-8483-220995449eaa",
        title: null,
        number: 0,
        volume: "1",
        language: "pt_br",
        pages: [
          { id: "c84fc9f2-a0a3-43de-81e0-33f27d494999" },
          { id: "ccc38db0-4d1d-41d1-a6bf-d9a99da60bb5" },
          { id: "74d3feea-046b-4cfd-8f75-ea63cef5480b" },
          { id: "10f4c875-149a-43aa-9871-68ecb6b6f637" },
          { id: "f3d1f9ee-b6f6-46e4-8da4-1ef8d579d150" },
        ],
        contentRating: "NORMAL",
        flag: "OK",
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
      {
        id: "e0d82a10-7a6d-4dcb-965a-0b1aee50f2e6",
        mediaId: "35a1efbe-9bdc-45f1-8483-220995449eaa",
        title: null,
        number: 1,
        volume: "1",
        language: "pt_br",
        pages: [
          { id: "8d42edc5-4049-49ee-b8fa-345f442baf9f" },
          { id: "aa41e2a1-2ec3-4c5f-91aa-1037fa4abbe1" },
          { id: "cde81a3c-e2df-4274-a8ca-f23b3da40ad7" },
          { id: "452ce5e8-8852-4586-970f-38c0b763065d" },
          { id: "ca58b9d5-a3c3-4ffc-ba1c-7dc9f774cd7d" },
          { id: "6d14c68c-e702-42e6-97f2-10941e4b8831" },
          { id: "c56271af-c405-4410-aa58-8eabbf6c64f9" },
          { id: "b4cb5f20-d74e-4d22-bb9d-436ca439f3ed" },
          { id: "1e193dcc-6836-40cf-9dd7-94bd58141c8a" },
          { id: "ef2ffaa7-b504-4905-acfd-77923170f09c" },
          { id: "7c80ae7d-a473-4213-8f3a-b3e46e028335" },
          { id: "5229b4cd-ad20-455a-92ca-173dd00b43e4" },
          { id: "bee9ea28-a828-40fe-b035-45d4999ba39a" },
          { id: "49d4c0e7-f68c-4fe4-be35-16d7c6838148" },
          { id: "70510cf6-2740-4256-bbb0-bb243d409cd8" },
          { id: "87434d02-0f7a-405e-b489-82c153f19627" },
          { id: "75f84703-3207-482a-b03b-b4056d63fa39" },
          { id: "cb01c049-d9c1-4734-8359-f276cc6426d0" },
          { id: "89fd1599-2649-4c89-bb01-e55390c2573e" },
          { id: "a0a4bfbc-006f-4859-9939-9a784c452fbe" },
          { id: "481c5e37-5ec8-4d6f-b00c-46884cb08c20" },
          { id: "2cf20fad-fa89-4d67-9d70-98cb38cadd58" },
          { id: "a912ca0d-3c95-4750-bfe7-6630592702e5" },
          { id: "6fc26d73-daee-4249-ac4a-7dcbf12a3dd5" },
          { id: "a78e06ae-81d3-4bf7-87c7-f262bb3d9ca0" },
          { id: "f0291283-1ead-4b86-a9fc-6e8e6310a09d" },
          { id: "78278a96-adce-48a9-a238-63ff0e4a3d1c" },
          { id: "8a766904-fc59-4226-8361-30e05cb88168" },
          { id: "a429dc23-6bf7-4913-a987-fa319c4adf32" },
          { id: "5b01f502-f351-46ac-b344-c1c74fe6e3ed" },
          { id: "bc5d8e24-ffea-48d3-8472-9f1cdafca28e" },
          { id: "51f8e749-a843-4e34-9c7a-190332e28144" },
          { id: "2a3f1278-5041-4e47-8b2c-5da07bff6cbd" },
          { id: "c76f7565-573d-4e11-bd83-c768b20946e5" },
          { id: "8a7450d6-189c-4929-96ed-5fe40b526822" },
          { id: "bada53b6-7287-4b4d-bcb2-5071bb113ab5" },
          { id: "99432077-cf22-41a3-977f-21278b88722e" },
          { id: "9bf898a9-cc43-453a-b4c7-9eeceaff0b58" },
          { id: "e1ffbe21-99fe-47a5-99b7-186f5db8705f" },
          { id: "37d15895-dd9e-4778-90b9-52936934e70f" },
          { id: "57be5cc3-316a-49bc-82a2-75d7eaefc2eb" },
          { id: "4bb1022c-e3d4-405c-996c-93b9c5ca8a75" },
        ],
        contentRating: "NORMAL",
        flag: "OK",
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
      {
        id: "f0f58bfa-df1d-45e7-986c-793523786d3a",
        mediaId: "35a1efbe-9bdc-45f1-8483-220995449eaa",
        title: null,
        number: 1,
        volume: "1",
        language: "pt_br",
        pages: [
          { id: "efe9ac6b-0414-4a6d-955a-3daa2c08caf3" },
          { id: "d78ce2ab-9689-477e-a4f4-b2d2d6224dcd" },
          { id: "6b174f30-5c19-45e4-b51b-3ea0fe018761" },
          { id: "0a58e584-c77f-489e-b3b9-6d4cb4cb859f" },
          { id: "099c9ccf-06bc-4216-9a27-f34ef3be13eb" },
          { id: "6d102144-e1fd-411d-8ede-7495f150c681" },
          { id: "549756a2-0961-459b-a0dc-ce917ae699d5" },
          { id: "adb71500-af5f-411d-8cf0-ecfcbf12fc8a" },
          { id: "a503a868-28ed-4c1c-8ab5-49777eba11f9" },
          { id: "857ca9ca-9385-475a-bd01-6e5dbf756e84" },
          { id: "4402c2a7-1980-4a2a-8cd9-d16770532efe" },
          { id: "9f9ca065-6831-4a9c-a728-7e7c19ad3da1" },
          { id: "c18ef68e-6577-44d6-a9b8-495cc145b0ed" },
          { id: "768c795c-63ea-430b-8964-f6c386aa8b31" },
          { id: "5dc92b86-a341-4f54-ad19-9aa5c693f9f6" },
          { id: "a71b1d9f-998c-459d-8a36-b64deecec511" },
          { id: "b69077fb-138b-4f83-9408-277ca4fde1c2" },
          { id: "244f0459-7aff-407c-9d12-d9c95205c66b" },
          { id: "8104c9fb-eb3e-4810-9b46-454450cf8daf" },
          { id: "8009ebc1-4cb4-4fea-b60d-9a400bcf6ca7" },
          { id: "bfbf5146-7a81-4eee-9eaa-3248c424eb88" },
          { id: "c400fed9-8e08-4e17-892f-0cf1326e6799" },
          { id: "7070514b-cee6-41d6-a778-35d44fffeb89" },
          { id: "b85160eb-860a-45d9-a78a-3d89d010dab8" },
          { id: "6c28fef4-b158-43b2-bc27-eb3e1a70046b" },
          { id: "9e8fbcef-91fb-47df-9de1-23766dfe1c96" },
          { id: "92910941-7d61-4398-a8a6-56410814c435" },
          { id: "1252912c-1439-484f-9664-3b34f1e1b168" },
          { id: "08eb803d-bbf4-4389-bd6f-0f801b93ebc9" },
          { id: "e476daa7-a244-4af7-9071-713122949740" },
          { id: "0b90b319-a491-4772-ac69-0f6be6995502" },
          { id: "770075f5-e46f-41a4-af91-3a8eea0b1bd8" },
          { id: "9ea0114e-4e31-4a82-8850-34413005edaf" },
          { id: "33295b9c-f2f6-4e6a-9993-81ff3066d369" },
          { id: "06bc62df-7857-471a-ad32-878e1c9b66a1" },
          { id: "ccbc7886-f6ee-47c3-baad-bd50270fd8cf" },
          { id: "b5f8fa0c-d7a3-4ab6-99a3-93851a305766" },
          { id: "7a876512-8df9-4de0-a080-88ad75263c81" },
          { id: "01b592db-c2d8-49a3-af76-084f1cbad4a9" },
          { id: "04fa875e-5161-4fe6-ac31-6cbc3e8030a7" },
          { id: "8fc4909b-b17d-445f-a4b9-926008c7ff61" },
          { id: "5ee2d88d-0025-40b0-86ff-14235c226b17" },
        ],
        contentRating: "NORMAL",
        flag: "OK",
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
      {
        id: "638743b8-dd54-454c-affa-105978461280",
        mediaId: "35a1efbe-9bdc-45f1-8483-220995449eaa",
        title: null,
        number: 2,
        volume: "1",
        language: "pt_br",
        pages: [
          { id: "f39c51e8-e574-41ed-bd04-8dba193048cc" },
          { id: "a28ad0f2-2a41-43e0-8bc6-3bed4d9d097c" },
          { id: "7f6bb045-0ea3-4596-bc41-6a4a34244789" },
          { id: "e2f38d37-ba4d-4169-a17a-2f6b9c461d60" },
          { id: "5f465931-3621-4321-8282-2fcf51e6a1a6" },
          { id: "d22df89f-0412-457e-8f8c-0540c50880d5" },
          { id: "70284ec3-ace0-49b2-ae24-285988ed4345" },
          { id: "eb02de15-8a6c-4b41-9e3b-7316cae939d8" },
          { id: "66014e8d-b32f-42ac-8667-b40f5c9c10f3" },
          { id: "3f6ee2e7-ca5b-40ad-b0fb-82f6eaf33584" },
          { id: "4a957a33-c57e-48c0-b9db-a6ee7810e632" },
          { id: "674f93ea-691d-4034-b2a4-53739cbe82b5" },
          { id: "0063ba61-3ac0-4363-a248-99a44ab1c88d" },
          { id: "cb977db5-f71b-40c9-9e35-6f90a8608799" },
          { id: "1da0d7eb-fa42-4998-8c36-0ff320cfe213" },
          { id: "64c76b23-6a80-470f-8862-34c8245b735c" },
        ],
        contentRating: "NORMAL",
        flag: "OK",
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
      {
        id: "8f28fd11-f220-43fd-b421-54b86e9aca8e",
        mediaId: "35a1efbe-9bdc-45f1-8483-220995449eaa",
        title: null,
        number: 3,
        volume: "1",
        language: "pt_br",
        pages: [
          { id: "13cd7e23-293d-4c0f-8e72-a6c90d72accb" },
          { id: "401607c6-cfd1-4fb5-b8a4-e7a76bdd7aed" },
          { id: "d4ebebc7-e53a-4f11-8c02-d8ef108a1ba7" },
          { id: "66a85510-4c4f-4c95-8aed-44076336f126" },
          { id: "25cccf2c-9583-4213-bc9e-7d5045fdb6ae" },
          { id: "c04dfea1-41a0-4cb7-afb2-2d55deec4d7c" },
          { id: "59fdeb15-1e84-44f1-b15a-457d342fb8a8" },
          { id: "16f31e54-34a8-4ace-966d-5ffe66a94f10" },
          { id: "3eb637d4-1b40-4f24-a6e6-4dab008a8738" },
          { id: "4fb92482-63a7-480c-8974-fd0aec0aaa82" },
          { id: "e7f187c3-1189-436d-b041-433dc1aa0db7" },
          { id: "be6fe754-f636-4d47-8fdb-47e2369e4854" },
          { id: "4d8df29b-8777-4755-b7ea-92f29ae63d18" },
          { id: "cae22f7b-5068-4d49-82f9-d7180399be60" },
          { id: "33c5fdf4-981c-41ae-8c71-f340b4f9c58d" },
          { id: "28464e18-a585-4cd5-acbb-16fd643289fa" },
          { id: "f2821b7e-5b2e-44df-a435-0b93f866960d" },
          { id: "7df64ce8-5298-4290-9748-ebbc96ffeb93" },
          { id: "72167979-0168-4647-9992-26e39be0b714" },
          { id: "5ffa9d7a-dee9-42f9-9c0f-26a179f74286" },
          { id: "ed0ad56c-48ac-45d5-9b0c-1372f4f911d2" },
          { id: "c9f04829-37cd-44cc-98e5-0a0fd3ea6e9e" },
          { id: "5b8dd315-5817-4b1b-87e8-8f5f1b55c6b7" },
          { id: "734eb40a-a64a-4c38-8957-bcf46f2fb6d1" },
          { id: "861fcace-b915-4771-9007-ebb7713d7f85" },
        ],
        contentRating: "NORMAL",
        flag: "OK",
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
      {
        id: "f492ff87-f5b6-4aaa-b6de-eda3f3bbed10",
        mediaId: "35a1efbe-9bdc-45f1-8483-220995449eaa",
        title: null,
        number: 4,
        volume: "1",
        language: "pt_br",
        pages: [
          { id: "4ddc45d3-b302-48de-a91c-e4efa8411960" },
          { id: "08c66213-f592-4b6c-bdfb-79d021431e01" },
          { id: "395a39c5-db25-45fd-aaa1-2f2ccca70ff2" },
          { id: "f645996a-9eea-4d84-a356-c0fbe1ca0ed9" },
          { id: "bbaf2228-bd09-4106-8047-b1fa4367e25a" },
          { id: "570ebec9-3fe0-4f3e-b6e6-7b7e42531076" },
          { id: "82dd9384-03a8-4f12-9641-73eb7cd0e951" },
          { id: "aa230679-3efa-406b-875d-7204dce487ae" },
          { id: "71ca0492-a196-40ec-a72a-376e69990e8e" },
          { id: "11329ea4-c5bf-435f-b89e-8e1f0b01dc74" },
          { id: "b2b07b23-129a-4950-8b3a-c154f3654c45" },
          { id: "0c8934c2-1378-4d6f-a218-497eee9be51d" },
          { id: "e2075423-130d-430d-8af3-1ca724232033" },
          { id: "1e970f78-f94e-4597-9b8d-c04fa88c7550" },
          { id: "e051447f-fb6a-44e4-b05c-e6ecb718a390" },
          { id: "81a65014-7503-497e-87da-73e076fadba1" },
          { id: "62398aa1-8396-4452-a150-f9f2bce67eba" },
          { id: "91387b52-1bc7-4aab-85ac-def3ab70ea70" },
          { id: "a0e09744-30b7-4f63-ae8d-47205900e90e" },
          { id: "53856214-c047-4f2a-8909-717e9a86b0dc" },
          { id: "27692916-a426-45f1-bbfd-437e665559aa" },
        ],
        contentRating: "NORMAL",
        flag: "OK",
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
    ])
    .execute()

  await db
    .insertInto("groups")
    .values([
      {
        id: "487c518d-c81a-47fe-9fc4-3c0f6c48a977",
        name: "God Hand Scans",
        description:
          "A God Hand Scans (ou GHS) parou de traduzir mangás e agora atua como uma fansub chamada [God Hands Fansub](https://ghsfansub.com.br/) (ou GHF) legendando Detective Conan.\n\n---\n\nCaso queira acessar o antigo site da GHS (ele está offline) acesse através do [Wayback Machine](https://web.archive.org/details/https://www.godhandscans.com.br/)",
        logo: null,
        banner: null,
        website: "https://www.godhandscans.com.br/",
        discord: null,
        x: "https://twitter.com/https://twitter.com/godhand_scans",
        facebook: null,
        instagram: null,
        telegram: null,
        youtube: null,
        email: null,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
      {
        id: "0774019a-d4cc-48e3-a6ca-c9fd6cc5b6d6",
        name: "Hime-k Scanlator",
        description: null,
        logo: null,
        banner: null,
        website: "http://hime-ks.blogspot.com/",
        discord: null,
        x: null,
        facebook: null,
        instagram: null,
        telegram: null,
        youtube: null,
        email: null,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      },
    ])
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()

  await db
    .insertInto("_chapterToGroups")
    .values([
      {
        A: "c72b0642-0dc4-478f-b226-647bae417db4",
        B: "487c518d-c81a-47fe-9fc4-3c0f6c48a977",
      },
      {
        A: "e0d82a10-7a6d-4dcb-965a-0b1aee50f2e6",
        B: "487c518d-c81a-47fe-9fc4-3c0f6c48a977",
      },
      {
        A: "f0f58bfa-df1d-45e7-986c-793523786d3a",
        B: "0774019a-d4cc-48e3-a6ca-c9fd6cc5b6d6",
      },
      {
        A: "638743b8-dd54-454c-affa-105978461280",
        B: "487c518d-c81a-47fe-9fc4-3c0f6c48a977",
      },
      {
        A: "8f28fd11-f220-43fd-b421-54b86e9aca8e",
        B: "487c518d-c81a-47fe-9fc4-3c0f6c48a977",
      },
      {
        A: "f492ff87-f5b6-4aaa-b6de-eda3f3bbed10",
        B: "487c518d-c81a-47fe-9fc4-3c0f6c48a977",
      },
    ])
    .execute()
}
