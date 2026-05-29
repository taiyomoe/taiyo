import type { Kysely } from "kysely"
import type { DB } from "../../database"

export const execute = async (db: Kysely<DB>): Promise<void> => {
  const now = new Date()

  await db
    .insertInto("medias")
    .values({
      id: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
      synopsis: {
        en: 'What has not yet been seen, and what cannot be seen - "X". Beyblade, accelerated to the limit (extreme), blasts through a new era!',
      },
      contentRating: "NORMAL",
      tags: [
        { key: "ACTION", isSpoiler: false },
        { key: "SPORTS", isSpoiler: false },
        { key: "ADVENTURE", isSpoiler: false },
      ],
      type: "MANGA",
      status: "RELEASING",
      source: "ORIGINAL",
      demography: "SHOUNEN",
      countryOfOrigin: "JAPAN",
      flag: "OK",
      links: {
        mangaDex: "f1845adf-270b-4405-9438-0c56b1b9576c",
        anilist: 165050,
        animePlanet: "https://www.anime-planet.com/manga/beyblade-x",
        bookWalker: "https://bookwalker.jp/series/436375/list",
        mangaUpdates: "https://www.mangaupdates.com/series.html?id=0kzjjmh",
        myAnimeList: 159721,
        kitsu: "https://kitsu.io/api/edge/manga?filter[slug]=beyblade-x",
        amazon: "https://www.amazon.co.jp/dp/B0CJCCKT6L",
        eBookJapan: "https://ebookjapan.yahoo.co.jp/books/787707/",
        raw: "https://www.corocoro.jp/title/80",
        officialENTranslation: "https://www.viz.com/beyblade-x",
      },
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      startDate: null,
      endDate: null,
      updatedAt: now,
    })
    .execute()

  await db
    .insertInto("titles")
    .values([
      {
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        title: "Beyblade X",
        language: "en",
        priority: 1,
        isAcronym: false,
        isMainTitle: true,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        title: "ベイブレードエックス",
        language: "ja",
        priority: 1,
        isAcronym: false,
        isMainTitle: false,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        title: "Beiburēdo Ekkusu",
        language: "ja_ro",
        priority: 1,
        isAcronym: false,
        isMainTitle: false,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        title: "Beyblade X",
        language: "tr",
        priority: 1,
        isAcronym: false,
        isMainTitle: false,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
    ])
    .execute()

  await db
    .insertInto("covers")
    .values([
      {
        id: "0687f6c4-9f81-4aba-af89-7aa1c15f7289",
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        volume: "7",
        language: "ja",
        contentRating: "NORMAL",
        isMainCover: true,
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        id: "f54cc8d2-1d47-4312-9962-36a8aa69b8d8",
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        volume: "6",
        language: "ja",
        contentRating: "NORMAL",
        isMainCover: false,
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        id: "6b1d2f5c-2b52-4e72-981e-5391aa83b854",
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        volume: "5",
        language: "ja",
        contentRating: "NORMAL",
        isMainCover: false,
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        id: "59040e09-6859-423d-9b55-3752308b194e",
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        volume: "4",
        language: "ja",
        contentRating: "NORMAL",
        isMainCover: false,
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        id: "45790a1b-c4e0-452b-9b00-84b7e1b4ebf4",
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        volume: "3",
        language: "ja",
        contentRating: "NORMAL",
        isMainCover: false,
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        id: "4903b90a-9925-4e7d-a8b1-7e2085467d27",
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        volume: "2",
        language: "ja",
        contentRating: "NORMAL",
        isMainCover: false,
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        id: "19bd04cc-76b6-4a02-9b81-d8bb137c1f58",
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        volume: "1",
        language: "ja",
        contentRating: "NORMAL",
        isMainCover: false,
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        id: "dc35464c-1776-466e-9d2f-3d17c8d807d3",
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        volume: "0",
        language: "ja",
        contentRating: "NORMAL",
        isMainCover: false,
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
    ])
    .execute()

  await db
    .insertInto("staffs")
    .values([
      {
        id: "d603b641-a4c2-41f0-87cf-7fb641f2cf42",
        name: "Muno Hikaru",
        bio: { en: "**Alt names**:\n武野光" },
        links: {
          twitter: "https://twitter.com/poipheno",
          youtube: "https://www.youtube.com/channel/UCPbVqKinziUlCLvIaIzRdhw",
        },
        image: null,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        id: "d6d965f5-4021-49f0-a6f2-086fff14db1f",
        name: "Kawamoto Homura",
        bio: {
          en: "**Name In Native Language:** 河本ほむら\n\n**Also Known As:**\nGyuunyuu (牛乳)\nHitotsubu Ichigo (一粒苺)\n\n**Additional Sites:**\n- [Webcomics Site](http://ushimilk.web.fc2.com/)\n- [Website (Defunct)](http://2st.jp/500/)\n- [Website (Defunct)](https://kawamuno.com/)\n- [Blog (Defunct)](http://hitotubosite.blog119.fc2.com/)",
        },
        links: {
          twitter: "https://twitter.com/ushimilksan",
          pixiv: "https://www.pixiv.net/users/967185",
          nicoVideo: "http://www.nicovideo.jp/user/753248",
        },
        image: null,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        id: "2ebfaeb3-3b72-4aa5-8c00-64b804b3a905",
        name: "Demizu Posuka",
        bio: { en: "**Alt names**:\n出水ぽすか" },
        links: {
          website: "http://posuka.iinaa.net/",
          twitter: "https://twitter.com/DemizuPosuka",
          pixiv: "https://www.pixiv.net/users/33333",
        },
        image: null,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
    ])
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()

  await db
    .insertInto("staffOnMedias")
    .values([
      {
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        staffId: "d603b641-a4c2-41f0-87cf-7fb641f2cf42",
        role: "AUTHOR",
      },
      {
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        staffId: "d6d965f5-4021-49f0-a6f2-086fff14db1f",
        role: "AUTHOR",
      },
      {
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        staffId: "2ebfaeb3-3b72-4aa5-8c00-64b804b3a905",
        role: "ARTIST",
      },
    ])
    .execute()

  await db
    .insertInto("chapters")
    .values([
      {
        id: "8a487658-150e-4256-ba48-80228496880c",
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        title: null,
        number: 0,
        volume: "1",
        language: "pt_br",
        pages: [
          { id: "b2758459-11fb-48b4-9514-db89280d7bda" },
          { id: "dd837e6d-7eba-4aa5-a1a7-76cad13ca291" },
          { id: "f4ed6605-6d70-4fbf-a5a7-04bcb91b8433" },
          { id: "dda244a7-025c-4003-b5d7-c2d62e78eb8a" },
          { id: "8f972fb1-8de3-4552-a9cf-e74cf072a47a" },
          { id: "02ba8eeb-3f88-4214-9339-7c7db9bb834a" },
          { id: "87e792c1-5fa2-4e63-ab3e-d0e1fd5739ce" },
          { id: "4a30d414-e996-4a54-9c14-c9dca07d3d8d" },
          { id: "5e964a5c-b926-4c47-ac57-a30c3e573cc9" },
          { id: "eb224444-9c91-46d8-b8f5-9dcd73802cf8" },
          { id: "adbefe1c-95d8-4016-9ce4-8bfd85be2303" },
        ],
        contentRating: "NORMAL",
        flag: "OK",
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
      {
        id: "43fa155c-d37b-4b75-855c-aea97313c0ef",
        mediaId: "d22a95ca-be76-4d65-97c4-a1bb5d46d32c",
        title: null,
        number: 1,
        volume: "1",
        language: "pt_br",
        pages: [
          { id: "e5ce8a1b-3694-494b-a759-dde6eca45524" },
          { id: "ec23cfe9-e5f5-4411-98bd-7561c8fcd9f4" },
          { id: "d9bf31da-2409-49bb-9f93-6904bb2e08e2" },
          { id: "a5264c50-1d94-4da3-81e5-2b38ca6fa805" },
          { id: "f46f8b5a-2a66-40c1-b85b-61e1ca1d5021" },
          { id: "6fa92d31-5f77-48f1-bd5e-86c93e88f345" },
          { id: "54443361-bb60-41cc-9530-ff57b0b83f3a" },
          { id: "35fcbbbc-c566-4dec-8da5-65adf402abc1" },
          { id: "ecbce482-f563-4046-a774-331aa478584c" },
          { id: "5001d8d5-4cb5-4ed3-898a-0352d4291960" },
          { id: "ff1607ef-02a2-46ae-859b-7cec366c38a5" },
          { id: "d7e2ed3c-9277-4122-b768-5500cb0d091b" },
          { id: "2cf0ea46-aa2e-48be-817e-3c55b0f8043c" },
          { id: "19b72b11-96ea-4caa-b99f-706273cec548" },
          { id: "3b936766-122e-44ce-a102-863b85f9122d" },
          { id: "36a29c84-9c3a-449a-89f5-45b60360a91d" },
          { id: "94037b50-b5c8-49c6-bed5-1fb29e9be537" },
          { id: "87b6181b-259b-446c-a2b1-21aeec77a034" },
          { id: "b3fa1e38-dbdc-45cb-b097-1e3b59b081ff" },
          { id: "4623a0d8-92bd-490c-9678-60dd565e4ea4" },
          { id: "63681197-e374-42f8-94d7-d9de7894b077" },
          { id: "5b93db08-a34e-4b20-8c9c-5cf1ebfe48c3" },
          { id: "eb66f058-41fa-4a8f-b225-ad89d8e7daac" },
          { id: "8629525a-d183-423c-854b-23576172ec9f" },
          { id: "6c8d3a0a-e403-4673-9a54-a47e0195632d" },
          { id: "b8cc7ab5-af4c-4e04-8a91-b41796296479" },
          { id: "cd0632ce-2711-49a7-b9a9-e87618d8c651" },
          { id: "53505a71-9498-4994-9a12-420e610a4d17" },
          { id: "c7a02c3c-efaf-4e3f-8c29-fba7053e8037" },
          { id: "8146040d-95e5-4dd4-9831-0d56ba06bb0a" },
          { id: "8a6cef0b-ab50-46cb-b091-a1e0497fa992" },
          { id: "d2b4e095-cebd-4eb7-b9c5-a82c49809900" },
          { id: "3b724bc0-7b09-49a4-a28e-1d2fdfb91a38" },
          { id: "f366489d-c674-40b9-ac3a-65a840998a23" },
          { id: "1655edae-f171-4862-9924-3d6118ef24a8" },
          { id: "0c8f8ccb-6837-4b65-bf13-a07bec54f640" },
          { id: "56b43da0-2f1f-430f-bb17-4fc3a609da1a" },
          { id: "fb5bae1f-1c17-4a9b-957a-7f4328ea3efe" },
          { id: "d1fe7347-4b5a-419c-a05c-6f2388228617" },
          { id: "b15d9cdc-6c32-43d0-b247-de26149910cb" },
          { id: "1d17de52-04a8-44cb-ae2e-56fe070adf8a" },
          { id: "a0777b74-ac64-4020-ba8a-7b603f341f3e" },
          { id: "2dbef6d9-6566-4985-a9bf-671c5a99eded" },
          { id: "88a6073b-9943-45f7-b44c-8e11a3f7c880" },
          { id: "54a2ccb3-efe0-4ab7-a910-7f9832fd0905" },
          { id: "18db3848-18f5-4114-a99b-56101a6296a5" },
          { id: "9e45fd22-53b9-4e9c-ab35-8d2b10e912cc" },
          { id: "08703aa1-4d69-4539-addb-90d1afdea7e0" },
          { id: "0b5f625c-0666-4375-8f5d-436e884cc6e6" },
          { id: "45bc8999-b996-4d4c-b1d9-e8cae6a98e26" },
          { id: "4dc42776-6e56-428e-b72d-057a10dbcff5" },
          { id: "bd829c12-e205-49a1-8967-ebdfd052fafe" },
          { id: "874dd97c-09d0-4fae-b426-81bdabf83fb3" },
          { id: "f655c918-83db-439a-b9e5-8e8d68bb7e7b" },
          { id: "ff911c49-e7cd-4ba2-a30e-1191760edac4" },
          { id: "c408a275-ebba-45b6-954d-ce351a8b3e95" },
          { id: "a6c432b4-c11a-4373-93ba-084a8f1e0936" },
          { id: "65a17ec6-42a9-412c-b982-67cd6b18885c" },
          { id: "9c117aaf-c276-4b18-936a-d66f90dd4ca0" },
          { id: "71185fe6-afa9-409d-a55c-8503404522ab" },
          { id: "a0eeef7f-9063-4ec2-b267-3bf9a265a7e9" },
          { id: "003a6cc0-2ec4-4487-994f-bf0a6ec70655" },
          { id: "a843f1de-9753-4377-a6b0-221aa44ce2c1" },
          { id: "522c98d5-41fa-4277-a9d9-c4616b2a8f95" },
          { id: "628700cf-dff8-47a1-9569-2305d890c882" },
          { id: "4df438b9-0c21-4eaa-8c72-0dea619aa585" },
        ],
        contentRating: "NORMAL",
        flag: "OK",
        uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
    ])
    .execute()

  await db
    .insertInto("groups")
    .values([
      {
        id: "3f55c48b-f866-41c7-af71-99add8dc2d0a",
        name: "Shin Project",
        description:
          "Somos apenas um grupo de fãs que querem trazer mais obras que não tem uma tradução em nossa língua PT-BR.",
        logo: null,
        banner: null,
        website: null,
        discord: "https://discord.gg//invite/896hybBhdr",
        x: "https://twitter.com/https://twitter.com/shinprojectscan",
        facebook: null,
        instagram: null,
        telegram: null,
        youtube: null,
        email: null,
        creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
        updatedAt: now,
      },
    ])
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()

  await db
    .insertInto("_chapterToGroups")
    .values([
      {
        A: "8a487658-150e-4256-ba48-80228496880c",
        B: "3f55c48b-f866-41c7-af71-99add8dc2d0a",
      },
    ])
    .execute()
}
