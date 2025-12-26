import type { PrismaClient } from "@taiyomoe/db"

const execute = async (db: PrismaClient) => {
  await db.media.create({
    data: {
      id: "861ec3a1-2cff-4e8f-b9fd-b5e41f741970",
      synopsis: {
        en: "Cross Academy is attended by two groups of students: the Day Class and the Night Class. At twilight, when the students of the Day Class return to their dorm, they cross paths with the Night Class on their way to school. Yuki Cross and Zero Kiryu are the Guardians of the school, protecting the Day Class from the Academy's dark secret: the Night Class is full of vampires!",
        pt_br:
          'A história de Vampire Knight trata de uma garota chamada Kurosu Yuuki, que não se lembra de nada de seu passado anterior a um certo dia; dia em que foi salva por Kaname Kuran, um vampiro "puro-sangue" que decidiu ficar em paz com os humanos, não sugando mais seus sangue. Devido a morte dos pais de Yuuki, Kaname leva-a para uma escola chamada Cross Academy, que aceita vampiros e humanos em paz na mesma escola, separando-os em Classe do Dia e Classe da Noite. Porém, para que os vampiros permaneçam na escola, não podem revelar sua identidade de vampiros e não podem sugar o sangue de ninguém.',
      },
      contentRating: "NORMAL",
      tags: [
        { key: "ACTION", isSpoiler: false },
        { key: "ROMANCE", isSpoiler: false },
        { key: "INCEST", isSpoiler: false },
        { key: "MALE_HAREM", isSpoiler: false },
        { key: "DRAMA", isSpoiler: false },
        { key: "SCHOOL", isSpoiler: false },
        { key: "VAMPIRE", isSpoiler: false },
        { key: "SUPERNATURAL", isSpoiler: false },
        { key: "MYSTERY", isSpoiler: false },
        { key: "TRAGEDY", isSpoiler: false },
      ],
      type: "MANGA",
      status: "FINISHED",
      source: "ORIGINAL",
      demography: "SHOUJO",
      countryOfOrigin: "JAPAN",
      links: {
        mangaDex: "baaa0ca4-efef-4b15-b91a-c1f85692c2a7",
        anilist: 30618,
        animePlanet: "https://www.anime-planet.com/manga/vampire-knight",
        mangaUpdates: "https://www.mangaupdates.com/series.html?id=mwdpn46",
        myAnimeList: 618,
        kitsu: "https://kitsu.io/api/edge/manga/1404",
        officialENTranslation: "https://www.viz.com/vampire-knight",
      },
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      titles: {
        create: [
          {
            title: "Vampire Knight",
            language: "en",
            priority: 1,
            isMainTitle: true,
            creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            title: "Caballero Vampiro",
            language: "es",
            priority: 1,
            isMainTitle: false,
            creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            title: "Cavaleiro Vampiro",
            language: "pt_pt",
            priority: 1,
            isMainTitle: false,
            creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            title: "Hiệp sĩ Vampire",
            language: "vi",
            priority: 1,
            isMainTitle: false,
            creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            title: "Vampir Şövalye",
            language: "tr",
            priority: 1,
            isMainTitle: false,
            creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            title: "ヴァンパイア騎士",
            language: "ja",
            priority: 1,
            isMainTitle: false,
            creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            title: "吸血鬼騎士",
            language: "zh_hk",
            priority: 1,
            isMainTitle: false,
            creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
        ],
      },
      staff: {
        create: [
          {
            role: "AUTHOR",
            staff: {
              connectOrCreate: {
                where: { id: "098ce244-f8d7-4dcb-bb31-5c5993dee615" },
                create: {
                  id: "098ce244-f8d7-4dcb-bb31-5c5993dee615",
                  name: "Hino Matsuri",
                  bio: {},
                  links: {},
                  creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                },
              },
            },
          },
          {
            role: "ARTIST",
            staff: {
              connectOrCreate: {
                where: { id: "098ce244-f8d7-4dcb-bb31-5c5993dee615" },
                create: {
                  id: "098ce244-f8d7-4dcb-bb31-5c5993dee615",
                  name: "Hino Matsuri",
                  bio: {},
                  links: {},
                  creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                },
              },
            },
          },
        ],
      },
      covers: {
        create: [
          {
            id: "0e68378d-3f34-4bb2-bf80-a6c266159de1",
            volume: "16",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "556d2d47-67fc-4d87-a4c2-6ce3242b5d99",
            volume: "18",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "6104d46e-5ada-41d2-85e1-73b5d1deb1e6",
            volume: "14",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "d66bdc5f-0f16-45ea-bdd7-2bfccd9cfc19",
            volume: "9",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "2ca4b553-bf25-45a4-8fc1-f2d86e116eba",
            volume: "5",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "bbf4a825-0f50-4c20-8883-f20e865c79c2",
            volume: "2",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "c1e74ff2-374f-47b4-8739-22157f301611",
            volume: "7",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "b0455a37-f4e3-483b-99e7-4fcd779f04ae",
            volume: "17",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "61e3743d-e42c-4b1c-9c0f-fd520c017758",
            volume: "15",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "d9e85111-7ff5-4401-8d36-0103cc45a95c",
            volume: "6",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "7ed291f8-33eb-4c5d-8adc-37307a63ed46",
            volume: "19",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: true,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "b22ea535-e0c9-4d2f-91c9-376a37cb6c1f",
            volume: "3",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "206c33b0-1486-4641-9601-b6aafd4f29a7",
            volume: "4",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "c68e28c0-4d9c-4756-9b6e-319904812d96",
            volume: "8",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "c5daef83-ef40-46ad-a0dc-c612db6a6742",
            volume: "13",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "fc37af57-d671-47a8-8dde-309a732546ae",
            volume: "12",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "ba731d29-c3f2-4948-99e3-45007116efcb",
            volume: "10",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "c48acd12-1d6d-4738-97f6-11f7ef443b51",
            volume: "11",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "98452d00-826f-4fc7-9988-1850e63e66b6",
            volume: "1",
            language: "ja",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
        ],
      },
      chapters: {
        create: [
          {
            id: "465bb97d-648d-4d0d-96ef-a8460d3ea310",
            number: 1,
            volume: "1",
            language: "pt_br",
            pages: [
              {
                id: "3dd96bc1-c8d5-4a5e-9309-b5a8cd77be15",
              },
              {
                id: "6b537721-2efb-4d6a-92bb-2568ec6f1079",
              },
              {
                id: "165c48ea-2018-42f4-91fa-22d43697d517",
              },
              {
                id: "bf9a2320-fec0-4991-9cad-954c0ae28bf2",
              },
              {
                id: "68eb4461-5298-4a78-acb4-360fc9db6fb5",
              },
              {
                id: "bf9b0d2e-6ac6-46b4-b59e-065050d03be6",
              },
              {
                id: "ef480a03-f8db-4e04-8b66-d188249172a2",
              },
              {
                id: "918829bf-f1ea-4f64-b964-5193e4b3a28a",
              },
              {
                id: "4f494ed7-24f1-4573-b0ea-ce87ae3f5465",
              },
              {
                id: "7d6ba60e-9357-46a6-a1f9-7813b8b75779",
              },
              {
                id: "abab1f67-732d-430d-8484-66edbe02fa91",
              },
              {
                id: "4dc0f582-4b49-4f17-9b69-5d6c0cd391ed",
              },
              {
                id: "ea3f9d36-2f97-47b2-a3e2-ad28df98fd1d",
              },
              {
                id: "acff1e5b-4fed-4a24-b412-4d8d24a013e8",
              },
              {
                id: "489d8232-8329-48f7-bf74-dbabd56b5811",
              },
              {
                id: "52ec5300-9833-4957-9e5b-91321be920cd",
              },
              {
                id: "a4892bd6-7cab-466c-9c73-4e9a3001d36a",
              },
              {
                id: "ccd38fe0-2a4a-4b03-ad93-3f184abc036b",
              },
              {
                id: "39fe57ca-285f-48ea-8c4e-5da2abc0bee2",
              },
              {
                id: "229079db-ec01-483e-9b97-7882ba430b8b",
              },
              {
                id: "645ce7c4-f8cc-483e-abe1-cd74b1298631",
              },
              {
                id: "4b00f16a-f050-41e8-afd9-f0effed105f2",
              },
              {
                id: "a1e63d82-ad7a-448c-8d0e-09d87bd85618",
              },
              {
                id: "b4c75d7c-fe16-495e-ad6e-882f85ee5357",
              },
              {
                id: "d7e3ebdb-106e-4ec3-bd3d-ff6e03386f48",
              },
              {
                id: "5109193a-ca51-4113-8709-650034be16d9",
              },
              {
                id: "9e8a3588-f312-4c84-9972-54dd41c6aa2c",
              },
              {
                id: "2be71603-b19b-400f-9b9b-ae0d9abae387",
              },
              {
                id: "9f5e37ab-7167-43e2-8c87-b5260d02394c",
              },
              {
                id: "a45896f9-d235-4cec-b9ef-b8171a6ff3bf",
              },
              {
                id: "93451264-db4d-4db0-86c0-f328bc3536bf",
              },
              {
                id: "14f05f18-e607-421c-ab0f-bb4d7120b446",
              },
              {
                id: "57c64cb0-9c56-434c-84cd-e8ee5f17929c",
              },
              {
                id: "5ff4ffbc-68cb-44e3-96d3-588be51394e2",
              },
              {
                id: "28c12c79-616c-4159-8052-896d435938ac",
              },
              {
                id: "eb9c6cec-88f6-4e82-9383-aa03276e4b5c",
              },
              {
                id: "27e842cf-cf6a-4576-bfe3-5bdb1a650246",
              },
              {
                id: "8165da53-2ced-4c1e-bb5b-f9d325cbde9f",
              },
              {
                id: "24705541-080f-45e9-98de-eb1280e181e1",
              },
              {
                id: "9ed8edb8-efb4-4e55-9ddf-596ac9492b43",
              },
              {
                id: "91b559e6-07f0-4919-a1e9-a71960f6b67b",
              },
              {
                id: "3e7f2d96-b746-4dcb-83e0-875b7af42b9e",
              },
              {
                id: "d2edd543-1bf7-463a-a86e-74a1b5357beb",
              },
              {
                id: "6fd0589a-292f-406f-92db-569fb28637b9",
              },
              {
                id: "898c35ea-0438-48c9-84f5-1ce37da5babc",
              },
              {
                id: "24536841-55dc-4aed-9d0e-8544d8715b93",
              },
              {
                id: "4816e512-9d7c-4543-9988-5d8e63af2a36",
              },
              {
                id: "b4823565-38da-43c9-a0b5-dfec3fbda119",
              },
              {
                id: "22c1ce6c-c1e8-406d-a139-3b6a5e0977dc",
              },
              {
                id: "1c571655-08d2-45e1-aa53-0e8a497dc1b9",
              },
              {
                id: "9bccb1e6-6227-45dd-80ee-a6de7dad540c",
              },
              {
                id: "471c6bf3-2e7a-445e-8614-452f44a78e1b",
              },
              {
                id: "4af55b58-c2c6-4027-97e0-ed85ccf26410",
              },
              {
                id: "d75c3b1b-71b3-4c53-b8e0-9c6bf68bc786",
              },
              {
                id: "fdf8e612-24b6-41d6-b83a-385767a2ca51",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "c7f8e70b-cc2d-40ec-8b8b-3ec086b4b430",
            number: 2,
            volume: "1",
            language: "pt_br",
            pages: [
              {
                id: "8e714b37-a221-4dc8-845e-7b50c070f329",
              },
              {
                id: "98ec5c84-628b-4f8b-8794-c8f4b65e4105",
              },
              {
                id: "ee8f42d2-8a30-482e-bc46-34ab6ffb2255",
              },
              {
                id: "5eee074c-ca23-4ebd-8a02-deb783da6841",
              },
              {
                id: "4ffe7c1e-5477-462d-afcb-47d9a4ea491e",
              },
              {
                id: "a797d157-0ec4-40b0-b7f3-e1f4b166a7a4",
              },
              {
                id: "bcf4cbec-c81c-45f5-81b3-0bc50113f4c2",
              },
              {
                id: "6caa754f-b01b-43d1-bab5-1bb890bef913",
              },
              {
                id: "5146dafe-29b5-4c19-8cee-3e2adc0c1ac0",
              },
              {
                id: "78499ecb-a530-4908-ba4b-ef8cbedf6ef6",
              },
              {
                id: "eec1e1bf-2fc0-4b0d-a330-04ce36012c82",
              },
              {
                id: "0bf13409-c0e3-4e60-a301-79e2cc8fe184",
              },
              {
                id: "35e82238-2233-4fe0-a32d-35b25e713e1d",
              },
              {
                id: "1f88a7ae-6556-48b0-9e4e-6082895365a2",
              },
              {
                id: "395eb764-84bc-4a3b-806e-16278f76d147",
              },
              {
                id: "31f98dd9-a86a-4e86-9648-aadca8180fde",
              },
              {
                id: "8bdb6c6f-e90a-48ef-8392-8daebb8c6f64",
              },
              {
                id: "842392e6-df4e-4521-bc01-4fba10d9552b",
              },
              {
                id: "ebccb345-4273-4eea-afe5-ae615f9a9e1d",
              },
              {
                id: "ec4b47ce-ec01-4a8e-abe6-91d45cf27175",
              },
              {
                id: "4f3bf2e4-8d78-4ad5-97ba-6e98b1550b1b",
              },
              {
                id: "a0b76c57-0579-469d-8a76-ac53228d2f72",
              },
              {
                id: "a123932e-8807-414b-854e-7d58b1b7e4b2",
              },
              {
                id: "00081792-1cfe-4efe-a8dc-c1e66cdbb22b",
              },
              {
                id: "593900a5-c2b7-4532-88f9-e04b4fd85675",
              },
              {
                id: "79d3c3ad-a9d1-4c5e-b93b-9e5275403181",
              },
              {
                id: "4c1053f8-4347-4deb-94dd-36de0090dd65",
              },
              {
                id: "740bdb95-8afc-4ef9-8db4-e54c732ef61c",
              },
              {
                id: "f94da027-f512-4dd5-8be8-a80b08cf2e4f",
              },
              {
                id: "23a947e4-9545-4382-ad13-5e2ec1b2749b",
              },
              {
                id: "cfa2bb45-4f1c-4552-8fb0-e37cb98816c6",
              },
              {
                id: "99c5f68b-2caf-47ee-bb1d-d94425ae8c22",
              },
              {
                id: "0a17290f-d816-42cb-bd41-c74c99700f0c",
              },
              {
                id: "32d598d7-1331-4e84-aa4d-29796095e199",
              },
              {
                id: "4894a4c6-b012-4354-a936-caf2b082d36c",
              },
              {
                id: "ee53a3cf-93b5-492d-af0a-4fa5c52f3470",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "c23b5078-9959-4518-8770-ef622a8b44cf",
            number: 3,
            volume: "1",
            language: "pt_br",
            pages: [
              {
                id: "a800b292-f301-4c1d-b81c-1a9aff58b55f",
              },
              {
                id: "7ade5191-31d2-40ee-aa36-063254d8e8e0",
              },
              {
                id: "2c73a37f-1e1d-4e87-91b2-44c6841cd659",
              },
              {
                id: "fb32fa19-966d-40b1-9a37-5a6165d30aee",
              },
              {
                id: "ae9569ad-61e9-4817-aafd-09f81d15b38f",
              },
              {
                id: "38b569e6-f98a-4163-b5c9-1644af7c5f81",
              },
              {
                id: "d82c44f5-655b-42bc-86ce-b26885e2cae1",
              },
              {
                id: "77ec96cc-4a9a-46a6-9065-1b9ce4d045f9",
              },
              {
                id: "5c3de03c-aa6b-45c4-801d-2b73a0d0b0c7",
              },
              {
                id: "5d6509b4-48f6-4f6a-9582-310c895cfdd1",
              },
              {
                id: "d7c4f46f-93da-4437-b238-a48170d20244",
              },
              {
                id: "104fe565-5d49-443c-b665-58d802f05fb7",
              },
              {
                id: "7a67aebb-f3b4-4d9d-bc52-cbbea58da1e6",
              },
              {
                id: "9100c2cc-a392-44ce-b112-37aae40e8cb9",
              },
              {
                id: "c74e1393-b621-4162-99f8-8989c7cf753f",
              },
              {
                id: "9c63b363-7e7d-4851-b830-644db48b9b5a",
              },
              {
                id: "a96a1b0a-8d13-4343-b473-f5df2f1d05a9",
              },
              {
                id: "9b14b56a-e9a2-40f2-8186-234b3f7bd37e",
              },
              {
                id: "d8c990ba-9d6d-4d27-9a5d-4671b380773b",
              },
              {
                id: "4692d878-fba1-4f09-90bb-3d1e83534eb5",
              },
              {
                id: "86833813-5880-49fd-95ef-be5fdb530c0f",
              },
              {
                id: "fd041b0f-04ef-4c31-8fc9-cd7ac9410c62",
              },
              {
                id: "1944eb07-5859-4ef3-b2df-4e9501266499",
              },
              {
                id: "d99d93ba-a93f-4596-86ab-dfd3f33c1ae0",
              },
              {
                id: "668981bc-e3b2-454c-bde7-4b7ee009a8d7",
              },
              {
                id: "aeeab2d4-f131-475b-a8aa-49cee4ea1774",
              },
              {
                id: "3322c657-ffe0-4591-b21b-8b6b1022c89e",
              },
              {
                id: "f0bb69bb-de85-4188-82ee-94bf72112ed1",
              },
              {
                id: "9ddf49ba-5e4b-4eae-9709-ea3a6849159f",
              },
              {
                id: "d10a182a-4de7-49f4-ba7d-84fec016081e",
              },
              {
                id: "3995032a-deda-4b80-abd7-5935040864d1",
              },
              {
                id: "5c6cdbee-c2b6-4378-ab2c-a93856e37f4e",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "3801215f-6027-49f2-9ac3-1396b9554346",
            number: 4,
            volume: "1",
            language: "pt_br",
            pages: [
              {
                id: "9f971c25-95c4-442a-9168-f4b0fdf185dd",
              },
              {
                id: "e20fa91f-996b-4d50-b017-db0e8d6bb491",
              },
              {
                id: "ee5a38ec-8bc0-4986-9fa8-5a51488c4268",
              },
              {
                id: "8f50ac3c-a5fa-478c-9e9f-a80597f116db",
              },
              {
                id: "43d27868-9a6b-4359-b47e-6e664eb66731",
              },
              {
                id: "f5d4bb42-d039-44db-b508-058bc91fe48a",
              },
              {
                id: "fe7b359e-d69f-44e7-be07-9d144bbf56eb",
              },
              {
                id: "a13ddd94-3106-4a6f-bb2c-397fe1dd49b9",
              },
              {
                id: "5f52d7dd-133e-4aad-9292-eaea7b1e2e2f",
              },
              {
                id: "3a9577ca-052b-4b6f-a263-4631cd9d41d9",
              },
              {
                id: "1edd4a35-5799-48d1-b93c-8c0ce48f0771",
              },
              {
                id: "915287c2-e308-476b-8325-a1e8d168932e",
              },
              {
                id: "67cfaaf8-d405-4007-840e-d28df8160a42",
              },
              {
                id: "1603a11e-e741-45c4-86af-fc8cc7c20b95",
              },
              {
                id: "57412d83-8996-4aae-b1a2-367120aa45ca",
              },
              {
                id: "2aff62d7-bde8-4f3c-a947-05a03ecd7f6f",
              },
              {
                id: "d881fa0d-d3b6-45e3-97f3-e9bd18ffaa43",
              },
              {
                id: "d974367c-d8b9-4eb1-a2a9-ecb90abb95ab",
              },
              {
                id: "2ade5dd0-aca9-4840-90a5-9b398c401ba3",
              },
              {
                id: "6482a7c2-0069-4039-8a54-378ca747f89a",
              },
              {
                id: "b8f35e7f-b263-4d62-8a63-40565faa1b26",
              },
              {
                id: "dc92b4a9-e06e-476e-813e-6e8361b05cd2",
              },
              {
                id: "6aac130f-8a2b-4cab-9e41-0102696f708a",
              },
              {
                id: "3370bb9f-f21a-4555-97dc-c739ce9cdf53",
              },
              {
                id: "a7a74b48-6815-4819-b32f-85bf69e111d7",
              },
              {
                id: "f87c17dd-7539-4c14-bf7d-6f9aa04ad988",
              },
              {
                id: "c00fa6a3-8cfc-45ab-a996-4f045c7eb5fa",
              },
              {
                id: "ca578986-3aeb-46fb-954a-23c5b0cf104d",
              },
              {
                id: "80a8fbe3-8417-4cf1-842b-0ed553c69b22",
              },
              {
                id: "a18fcb44-3636-434a-b3db-30c592c3d907",
              },
              {
                id: "6b233ffa-d0c4-42f8-aaf6-1cb02ca3ab51",
              },
              {
                id: "a6bc9ce5-6849-4582-a398-2d6cf923ebb2",
              },
              {
                id: "db668412-df31-46b4-88bf-51df422e2aca",
              },
              {
                id: "e40990a5-c515-4c2c-bc1e-222154d6d762",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "4e55fd38-d605-4cdf-bf10-a6030d7c2a8d",
            number: 5,
            volume: "1",
            language: "pt_br",
            pages: [
              {
                id: "2855184d-a850-4f21-8edb-aca755fa0e16",
              },
              {
                id: "a6877dab-ae51-4541-9887-9f7a9c3be54b",
              },
              {
                id: "b7bca1e9-ced7-4c93-b74c-8ae8a1537d0e",
              },
              {
                id: "d488dfe4-f18d-4ee0-9a62-e44b85cb8e0a",
              },
              {
                id: "a79a824e-ccb9-4644-b5a2-4265dfff735f",
              },
              {
                id: "d5c2a43b-cfa6-4714-ab03-a361d3ce668a",
              },
              {
                id: "ac8dfa84-81c9-4d5d-956d-783542e5234f",
              },
              {
                id: "ab6db9a1-44fe-43c9-bebe-d4519b87c0a1",
              },
              {
                id: "75d2d7b9-8997-44f2-b882-84c543d0570f",
              },
              {
                id: "84145443-e613-48e4-9554-6c6ebb9b09ed",
              },
              {
                id: "55efa558-5a1c-4bda-93e0-79cc74ecfaa0",
              },
              {
                id: "23ceddee-0a62-4e2f-a425-44ea6115e1d0",
              },
              {
                id: "c7a8396b-33d9-4775-acdf-9fe537d4795d",
              },
              {
                id: "50fca6f1-3848-44e3-8015-c15cc216d6a1",
              },
              {
                id: "454c3187-197d-4650-b15d-af6f0b852cae",
              },
              {
                id: "62169025-030e-465a-a279-802c8c05dcde",
              },
              {
                id: "8bd8be3d-02b4-415f-ac67-54020c6d8222",
              },
              {
                id: "b34c07e6-631f-40a2-890c-1b357df455f5",
              },
              {
                id: "ea7264f3-400b-4882-bf78-9d683e0f349d",
              },
              {
                id: "dfc1b65e-69f7-4245-9264-7133738204f0",
              },
              {
                id: "90b0d35f-deaa-4437-9293-6c4776d9c68e",
              },
              {
                id: "6e8b65b7-3431-40e0-9b75-383182957808",
              },
              {
                id: "76e96f66-1eec-4836-b2da-39c020748007",
              },
              {
                id: "bf6f7d08-cda2-4ae5-82f2-cfab95e9fd93",
              },
              {
                id: "1d1a2ee4-9097-4621-b87a-9d689d3bf42e",
              },
              {
                id: "6d4be785-ee68-4516-85a6-e83d1cc22d2e",
              },
              {
                id: "5c320646-ac04-4163-a74d-2027743b4aee",
              },
              {
                id: "8c51137e-7b36-497e-ba8c-156113195500",
              },
              {
                id: "3d0fd5c8-3b72-46c1-adf2-f405abd6732f",
              },
              {
                id: "3edad814-fcda-4b24-8c52-f7877432223d",
              },
              {
                id: "f61863d1-17f2-4391-a697-35b082fa16c8",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "756c53ca-e0ad-4b6f-aa78-88e864dd6ef3",
            number: 5.5,
            volume: "1",
            language: "pt_br",
            pages: [
              {
                id: "e15ac7c6-b46e-45bb-aacf-f5838f623f2c",
              },
              {
                id: "e0b71688-943d-4e95-8a83-b3b462070891",
              },
              {
                id: "28562a4e-ebe8-4812-8010-1a4014f837ae",
              },
              {
                id: "582ea3df-9081-41a8-8442-a2bc6b10b2dc",
              },
              {
                id: "6a362b2d-a7f4-43b1-b8d9-1a8fd7cc3656",
              },
              {
                id: "d54f7147-8108-4e16-b4e3-d0abcdb5d517",
              },
              {
                id: "5cab79e6-322c-45fa-baf5-fd71ffe03990",
              },
              {
                id: "6fc5a849-a252-43b8-86a9-9e1fea09eef4",
              },
              {
                id: "8c5a152a-71fb-42b9-b2b7-c15b9c6b63a8",
              },
              {
                id: "f13fe32a-2db9-42eb-bc4a-5a0448f89b81",
              },
              {
                id: "b5d164f6-39c3-405c-aae5-0484a9e7c99f",
              },
              {
                id: "8de08af4-69d7-418b-b422-338bad421805",
              },
              {
                id: "5d2640f7-d5e7-43cc-af60-d86adb0548f6",
              },
              {
                id: "5b31e613-b1f3-4fa4-b6da-09ac649b7b31",
              },
              {
                id: "a0e154f6-f227-4b22-b9dc-dfa650e37ece",
              },
              {
                id: "be963549-e26b-4384-a77f-48c84518dc40",
              },
              {
                id: "945dc704-48a9-49d6-9e39-c3c11abc0e91",
              },
              {
                id: "c4228e6a-8d67-494e-803f-519fa40e2715",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "01c03360-b1e2-4179-b6b0-5bce3f166870",
            number: 6,
            volume: "2",
            language: "pt_br",
            pages: [
              {
                id: "e50f4977-0537-4c6e-9dca-2966a56f870a",
              },
              {
                id: "c38b54ee-3d9a-49d0-96c7-04a8faf0a42b",
              },
              {
                id: "f8cbc963-b477-4669-8cb0-d1c467f6929a",
              },
              {
                id: "7429e295-5f60-420e-891d-523cf81cd214",
              },
              {
                id: "fe5de840-7556-4ebd-a5f1-6940d515a9e3",
              },
              {
                id: "9da6e6d7-e392-4149-a138-7d87112965b7",
              },
              {
                id: "d4beba50-1e1e-4c14-862a-0ae882ca7a89",
              },
              {
                id: "7259e17c-3c35-485f-b0a1-9a07752698da",
              },
              {
                id: "9ef68b5f-8ef8-49f1-a517-cbece31e310e",
              },
              {
                id: "f55298f3-7d45-495c-8990-afcd90298ed9",
              },
              {
                id: "c8843e53-8053-4f96-b030-c3e21ccf53dd",
              },
              {
                id: "75ab57fa-4e7b-42eb-b3cf-ef766bfc6a21",
              },
              {
                id: "41ac582d-b331-4551-b19b-ef67b2533d6d",
              },
              {
                id: "201794fd-a1cd-4eb5-8eec-c653c018663e",
              },
              {
                id: "ddfbe614-d254-4d6b-8ff1-6bdb5a24678a",
              },
              {
                id: "10cc0134-0025-48d7-90fc-bcb56224f520",
              },
              {
                id: "d71bec8e-168d-4e4f-991b-b27dd95555e7",
              },
              {
                id: "7961efeb-3c88-4b47-a6be-eef831275039",
              },
              {
                id: "1a058e97-427d-4d16-b671-c0b959eb2ae2",
              },
              {
                id: "62509298-b86d-4fe0-b14e-587aa7176398",
              },
              {
                id: "59fddac6-1202-4ed2-bf4a-64f086ca4a50",
              },
              {
                id: "e796dc81-6621-4979-99f9-cbcb3e1a2ea9",
              },
              {
                id: "05919eed-b6e3-442c-80e1-f625a233edd3",
              },
              {
                id: "e681863d-7fb2-45ef-9b1b-bdadb7637c11",
              },
              {
                id: "71260e1b-f618-4d8d-ba85-3a13bc7253da",
              },
              {
                id: "42f25da2-c75c-48aa-a4a8-ff348489bce9",
              },
              {
                id: "023651c8-3a7e-4935-b152-4f0b98edb75c",
              },
              {
                id: "afeaf519-3958-46d7-b5cb-62a30c087c07",
              },
              {
                id: "f542c003-8145-4514-8c86-2908a54bb87c",
              },
              {
                id: "211892c3-484d-48fd-99cf-a2fae714c0ec",
              },
              {
                id: "45f5066c-9b55-40c9-9b24-631803765e30",
              },
              {
                id: "b6b35355-adf1-481a-833e-9fc555ced68b",
              },
              {
                id: "29673c90-8343-47ad-95c9-6d6ab5ba1c45",
              },
              {
                id: "0c1bd963-ef98-45f6-a947-17c32e3b9e6d",
              },
              {
                id: "4f680a9b-8036-430c-861f-e6e9d27f9784",
              },
              {
                id: "3d6ea2b5-18fd-42a7-a7ff-64652caa9bdd",
              },
              {
                id: "e60a6a78-aa06-4a16-a7c6-96d812125fa1",
              },
              {
                id: "1ed3d905-b4d3-44bf-8b98-53916ec67492",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "bf4d8372-ce87-475b-9228-65d233d7dab1",
            number: 7,
            volume: "2",
            language: "pt_br",
            pages: [
              {
                id: "1cb9b9b7-5d5a-4833-a082-dfc2d36510f6",
              },
              {
                id: "968a28e2-f56c-4b3b-b52f-91633fee28ad",
              },
              {
                id: "3d4c0cc3-6f36-4fa9-b68e-9c7c8ccfc3db",
              },
              {
                id: "3f0b98e0-a4e2-4502-8a8a-413e7deb9836",
              },
              {
                id: "693b6737-6255-4e4b-8805-99c382573377",
              },
              {
                id: "db702320-5470-4cdc-a7a4-208a7dd4ba5d",
              },
              {
                id: "8b0e3465-fdbe-4392-bee5-0499be76385e",
              },
              {
                id: "ca409d9c-c5cb-4061-a6f8-ca13e311876d",
              },
              {
                id: "e5780223-5d82-4214-950f-f31a14b241a1",
              },
              {
                id: "981f6fc8-b886-43d0-9a44-43dadbf9ad7e",
              },
              {
                id: "0bf2859d-7024-4e81-a24e-036957f168cb",
              },
              {
                id: "28a2113a-b883-4752-a3c3-4b2842db6ea5",
              },
              {
                id: "2bba729e-929b-4115-8351-7880c54c3c21",
              },
              {
                id: "0c12b70c-d1fa-4606-a3db-77e9f7b43543",
              },
              {
                id: "1fcad977-5d45-4516-bde0-a2f2d6772ebf",
              },
              {
                id: "2271a7b5-f6bf-4da5-b114-6d07aaa43c92",
              },
              {
                id: "6a893daf-4e08-4e89-8d51-21244982bd08",
              },
              {
                id: "96ff5786-1812-479f-88f0-ecca053f3959",
              },
              {
                id: "05940bf0-cd8b-474f-bd30-902be2fd1f69",
              },
              {
                id: "d7bd126b-426d-455f-b408-8ce0c8d8d973",
              },
              {
                id: "e409b303-d2cd-4cd8-8020-d1c74592151b",
              },
              {
                id: "916f539d-a13a-4393-a1d6-9da6b6fce714",
              },
              {
                id: "5c80f537-6b58-4bc9-964c-6ed277183848",
              },
              {
                id: "3e6c7de7-5fd1-455c-b864-0564593d3c6c",
              },
              {
                id: "3b7cd3dc-4113-4ec3-9941-13b0dbd6a248",
              },
              {
                id: "35113071-b21a-4a1b-975e-c8d8e3b9762e",
              },
              {
                id: "2be92874-f07e-404b-9076-500037070122",
              },
              {
                id: "f7be5e9e-7ca4-4637-bb2e-88d73459d2e9",
              },
              {
                id: "259306bf-a156-4482-9787-645933515fcf",
              },
              {
                id: "c4436342-c505-459b-8e23-2f809703e506",
              },
              {
                id: "5aea280f-556c-4b19-8881-dc91b81e079a",
              },
              {
                id: "751d13c0-00d3-457f-ac32-c28bcd2f5423",
              },
              {
                id: "c2ad1f7e-bac4-425d-966c-177a2fd1e687",
              },
              {
                id: "91c74f1e-a3dc-4728-9cbe-321f788ecc0a",
              },
              {
                id: "cff8e147-a78b-40c1-abd7-251a8c1d4352",
              },
              {
                id: "d99f8de1-c1f1-47f0-bbe1-d45bfe13049d",
              },
              {
                id: "29ec5269-a452-4f63-91c5-06646ef3d7e1",
              },
              {
                id: "061f019f-9046-455d-8a3b-d699ad6201ef",
              },
              {
                id: "18ea7e2e-d599-4f19-8ce8-e6dca91b4aba",
              },
              {
                id: "07c229f1-4cb2-4311-ac0b-1ed522164138",
              },
              {
                id: "8519e791-2f51-4b90-9243-6889d13b7cdd",
              },
              {
                id: "38567e71-9cce-4972-9ca0-fb1ee2614dcf",
              },
              {
                id: "bd9b98ee-f313-4cb7-b566-f02f44dccb6b",
              },
              {
                id: "ff96c8d6-dc7b-40f8-bc5e-f550238fce5a",
              },
              {
                id: "c056d046-cdcb-4c5c-ab33-9be67c4f24bb",
              },
              {
                id: "6b14c421-c69b-4f1d-92c8-06774d0cde75",
              },
              {
                id: "03b8ae5e-98b4-4b50-bc06-2adcbb469522",
              },
              {
                id: "27629d2a-665f-42ce-8e1b-d0dbc669b181",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "acfab07d-e0bd-4be5-9008-f435647d3d45",
            number: 8,
            volume: "2",
            language: "pt_br",
            pages: [
              {
                id: "02b5473f-5fb6-4872-b4e3-2b5ba22c5140",
              },
              {
                id: "88f4eb59-df22-4576-98c8-18b300fe4d61",
              },
              {
                id: "bae4f979-f721-47b8-bc4c-0fd27a90d07e",
              },
              {
                id: "1460b9bc-5d7c-457b-a0ec-8a1bd94e9ea1",
              },
              {
                id: "e272ddd8-3ca1-4123-aaa7-730aa9d39088",
              },
              {
                id: "8a158e37-c622-44a3-ae7c-ce8b6cbaba26",
              },
              {
                id: "e8f72ff3-8144-469b-b1ba-13f5a17815e2",
              },
              {
                id: "10054175-6050-4eb1-90c2-41b1a4e6ac8a",
              },
              {
                id: "d91be222-1586-47c8-9506-78daa13996b5",
              },
              {
                id: "f44a0098-dd57-45f5-b106-ea4934486f34",
              },
              {
                id: "c09aff03-ca8e-4132-8860-9048de2d34b1",
              },
              {
                id: "28884573-7929-46c3-8949-d08578ee05ca",
              },
              {
                id: "0e853a51-4543-4c22-ae3d-f3b2fe49b2ba",
              },
              {
                id: "935a9927-f7d0-48e6-88cc-cc3e1e88b0f9",
              },
              {
                id: "84988702-1513-4794-9d27-17900becc3a9",
              },
              {
                id: "1148d2a9-da3a-4171-9916-4d2458b0ba36",
              },
              {
                id: "54afe7c4-49e5-4c5d-89c9-4381ec65bda2",
              },
              {
                id: "0da23b33-1314-4feb-8cb3-8f445aed9e15",
              },
              {
                id: "88b904b7-ecd1-4c06-b6bb-420ecdae02db",
              },
              {
                id: "c331f268-2fe2-4ba2-9bda-a0c8704b955b",
              },
              {
                id: "687f2254-f257-4b71-b093-c63d723f75f4",
              },
              {
                id: "ec37b9ff-02ae-4ef4-9506-05becf66438f",
              },
              {
                id: "61f7bde3-a962-45be-bf55-65179a1ec314",
              },
              {
                id: "fabf9edd-0fd9-4189-976e-11bc68c1b49c",
              },
              {
                id: "d66d6901-df0f-4920-909f-cf579b5df4f5",
              },
              {
                id: "10c37ed7-8fed-4270-bf5a-d46d6172c800",
              },
              {
                id: "fceb7123-7605-4fd1-9d4c-554a59f0a9df",
              },
              {
                id: "f88f64be-f2cc-4e17-a370-4b6846ed0ab2",
              },
              {
                id: "3312b8fd-5f91-4540-9920-e467a9b766f3",
              },
              {
                id: "bc8e4f26-3d2c-4c9d-9411-1b53e2015194",
              },
              {
                id: "32429792-f684-42e5-bc3e-d25b87e4a299",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "b2ffcfd7-784a-4b3d-8edf-4663dde9a6ed",
            number: 9,
            volume: "2",
            language: "pt_br",
            pages: [
              {
                id: "27829f5f-4d49-4d41-8b15-8af90fe69e0c",
              },
              {
                id: "cda2869c-92db-483c-8289-5cff14ca7993",
              },
              {
                id: "ae2072c2-e8c6-462b-8e6b-353e3d568b30",
              },
              {
                id: "6dbd739d-7ed7-4426-a0e9-e3189fde8738",
              },
              {
                id: "c92f3665-5c84-4dbd-a218-637510195d17",
              },
              {
                id: "e9b5d016-4d46-4b8a-9f0d-183389e2d601",
              },
              {
                id: "f6478581-5f2e-41f7-a446-d8adeb5c29cb",
              },
              {
                id: "853b2a4e-f996-4754-930b-134cc03d2de0",
              },
              {
                id: "26090155-37e9-4ef7-9839-a86b54d0ab6f",
              },
              {
                id: "41a93aa4-1574-4ee3-a4d5-6b695bcacaa1",
              },
              {
                id: "5c12cb80-4523-4853-9a9d-d1c9b0d5df48",
              },
              {
                id: "cd938549-cf68-4769-ad53-59bd8acd0571",
              },
              {
                id: "74bf56b5-dc49-4b95-b484-c06ad2eb5c84",
              },
              {
                id: "1791909c-5d0a-4a14-b7ff-69cd3345700d",
              },
              {
                id: "44ffc38d-a74f-4381-a816-08b21fd36a1a",
              },
              {
                id: "0b30a59f-b47b-4d80-97df-9a5e8e5efe15",
              },
              {
                id: "7eb95fc3-7086-42c3-88d3-8994642efe3f",
              },
              {
                id: "46532a58-dbfe-4acb-beba-b9b0f9da2e40",
              },
              {
                id: "ee97ebf3-2432-4896-b3ad-fa3e7e06cf0b",
              },
              {
                id: "cdeb0e4f-9dc6-4523-be1c-1f8bb3a9d98c",
              },
              {
                id: "15f94ba1-8327-4ce7-a214-bde0574584bf",
              },
              {
                id: "d4f30c05-a180-4562-9e9a-36549ab41fc6",
              },
              {
                id: "c45f716e-708c-486f-a062-57742c7cb9d3",
              },
              {
                id: "6ef66884-7614-4656-bcc1-0bcd63f01e17",
              },
              {
                id: "815ff3aa-f700-4805-b711-40574fc3c0bd",
              },
              {
                id: "bed37a73-91e1-4fd4-80cc-1919c34b5a5d",
              },
              {
                id: "a1a40c85-7ab6-4ee3-a3da-a3a46e0ea978",
              },
              {
                id: "f4db0dfb-b6fd-4605-8100-36a4175bb7f3",
              },
              {
                id: "569badc7-cf44-4f93-b4cb-4da1ec4fc8ac",
              },
              {
                id: "544ec134-1cab-4b19-ad6f-08e7b5d68e8c",
              },
              {
                id: "fe0e6dea-8ff9-4713-bd2c-ce0e503dbafb",
              },
              {
                id: "993a6018-f0c3-44d0-92aa-8e3d1cf1a661",
              },
              {
                id: "4fee1518-0323-4f44-affa-7ecbb28ef405",
              },
              {
                id: "af211dfa-2eeb-45f1-adb9-60d3fac7bbd7",
              },
              {
                id: "800bf711-0041-44fd-a665-7f635a118021",
              },
              {
                id: "22e28745-33c8-42dc-ac91-3c2ddd5b12b4",
              },
              {
                id: "33d56498-6ae7-4473-9c3d-e22dec171c9e",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "8687ea89-13d1-40c9-a9bb-8bd107b80127",
            number: 10,
            volume: "3",
            language: "pt_br",
            pages: [
              {
                id: "b0c65f2d-871a-4f63-b889-afc58ca6e093",
              },
              {
                id: "1b090b7a-e9f1-40d7-ba43-a39b8f6665eb",
              },
              {
                id: "4db248d4-1f08-4262-b487-3012a00c431c",
              },
              {
                id: "7b9a5730-d67d-4c4a-8b14-e15d42a94e23",
              },
              {
                id: "a7ed7b87-9a65-4b48-90a8-b31b77041eb5",
              },
              {
                id: "3ca20274-c238-43bc-8f0a-35e028fef4b0",
              },
              {
                id: "313e1dbf-8f0f-4f62-b979-5c457e08a292",
              },
              {
                id: "8b028945-88d9-40d2-a17a-46970bb97da7",
              },
              {
                id: "73ded12d-9621-4d9b-b3dc-bb762ddde238",
              },
              {
                id: "334c5f93-6ffa-48ac-846d-40b2f456474d",
              },
              {
                id: "2faf35ae-3afc-4d82-80ec-820a2a2ced60",
              },
              {
                id: "80c739ce-f4f5-40a3-91a1-164aa30bbdae",
              },
              {
                id: "f4998a16-0971-427d-8340-aa86716f7b7a",
              },
              {
                id: "96e0afa6-4262-42a2-8f8a-3e99a79b1e11",
              },
              {
                id: "2e028655-4a2f-4a26-9c96-99ea6836035f",
              },
              {
                id: "5effdf79-bf47-45ca-83d3-4c057db90e46",
              },
              {
                id: "817889d2-a120-4aee-9728-ad3be5557b69",
              },
              {
                id: "e841becc-6e0a-4333-b69c-285255b7dc40",
              },
              {
                id: "e2bd75b7-7ed4-4326-b4cd-97ebc3f5ae27",
              },
              {
                id: "6f95217f-6870-424e-97b9-1a0e667458e7",
              },
              {
                id: "25487c98-bd15-4ff4-8eee-e6f0d613ccd7",
              },
              {
                id: "8ecd2ca9-2232-4394-8a76-d4f7e29a63cc",
              },
              {
                id: "9d2795c6-a56d-484d-89b8-22fc3a85c0e5",
              },
              {
                id: "f84945ef-8359-40cd-8adb-58ddd7911efc",
              },
              {
                id: "b959f643-838d-4921-a205-20b67d088d40",
              },
              {
                id: "45e0ca0b-b4e8-49cb-be50-2a094b18266b",
              },
              {
                id: "1f379859-284d-489b-bbd1-e894aedb0182",
              },
              {
                id: "6b0cafeb-2bdd-4544-a23a-882fa44c27e6",
              },
              {
                id: "be7f66e8-9be4-4c04-b07b-99ac9fd094ae",
              },
              {
                id: "d4097371-163c-4729-98bf-5eabee9725aa",
              },
              {
                id: "2723f660-e0cd-4a12-b74b-78412387c447",
              },
              {
                id: "7e863276-441e-4f90-9f05-da1ea1d01a0c",
              },
              {
                id: "8a217e00-f895-47ca-9477-3b2aef66149e",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "51214d50-e866-4b05-b8c1-4cefcfd6c22a",
            number: 11,
            volume: "3",
            language: "pt_br",
            pages: [
              {
                id: "87549314-ccd7-4156-8906-7c6f264cc1c3",
              },
              {
                id: "f56e85b7-7ff0-4fcc-82f1-ccb7ddf88300",
              },
              {
                id: "68231e71-2314-4417-a4bb-9075d1bba8b6",
              },
              {
                id: "afb74472-f4c3-431f-9026-889dcd060ae4",
              },
              {
                id: "26e9bd33-11dd-4a79-abeb-a3a88a2ae88d",
              },
              {
                id: "e916f081-fc51-42e0-a3f2-10f52283d2dd",
              },
              {
                id: "8160e898-1d92-4cab-9ef1-7a6d2a31978b",
              },
              {
                id: "40bfcd06-a7e8-4b1d-ac3e-afecbdf787a0",
              },
              {
                id: "1730738b-c5eb-40b0-a4f3-e85d64c233ab",
              },
              {
                id: "d97f8f2b-8568-42cf-b157-def0d16378ae",
              },
              {
                id: "152c093d-5a45-4b1b-be75-10a98d8b0d6f",
              },
              {
                id: "2ca1ff6f-7716-4303-bfab-b367eb6af9c4",
              },
              {
                id: "186bb063-a489-4f68-95d2-7d9692ec5984",
              },
              {
                id: "45ce6236-64b6-4a90-895c-f052911d31ab",
              },
              {
                id: "6b25df42-2495-48a0-9c1c-c45c5a6812fc",
              },
              {
                id: "fc9075e7-31ff-4700-a91e-a2bcb9425a82",
              },
              {
                id: "52c6d898-dbe6-4ab9-a994-744f761086e7",
              },
              {
                id: "2830bf3d-eca1-4362-aafc-cf29dce43970",
              },
              {
                id: "51e9d9d1-82a3-4e4d-9437-e5303fa231b8",
              },
              {
                id: "98b7eada-d1f5-46a5-99e9-16ebdd013692",
              },
              {
                id: "dc5432f4-0787-4d94-a211-24d978da04b1",
              },
              {
                id: "133774f4-dbf0-4162-a671-af0fd21afdc7",
              },
              {
                id: "58194835-1682-4007-8440-b936b8bd9468",
              },
              {
                id: "29037315-d434-44e0-8066-b3fa133a4d7b",
              },
              {
                id: "443e1d6b-1319-493b-820d-4cbdea8882af",
              },
              {
                id: "fcf63a71-8deb-4d11-b91c-5ace046b79e0",
              },
              {
                id: "deb24602-02d0-4b35-ad8a-c20547adba12",
              },
              {
                id: "c3bc4120-e4fa-49ae-b074-754a9cc4f4fc",
              },
              {
                id: "209f46c8-b926-408d-a824-c0d1a5a23e8d",
              },
              {
                id: "1816c34c-dca9-4460-99b5-74fb6181242e",
              },
              {
                id: "ed05792c-7b68-48c3-b70c-bdd8a8544dac",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "187fb6ab-e28a-4cfe-9b31-5b2063e6f905",
            number: 12,
            volume: "3",
            language: "pt_br",
            pages: [
              {
                id: "317403b4-0c12-4c45-8913-74dee2449b7d",
              },
              {
                id: "cd807d1e-4f4a-4ebd-a298-e2d85ccdaee0",
              },
              {
                id: "854a593e-4823-441d-9134-779345f68ef0",
              },
              {
                id: "f331482e-6214-451a-8fb0-a64592103537",
              },
              {
                id: "50bfd4f9-5f97-4e5e-b737-cecae062a01c",
              },
              {
                id: "15372775-e2e2-4e2d-b427-3cd27586e82b",
              },
              {
                id: "a2db867e-8f16-4a0f-afb8-a7699f0fa94c",
              },
              {
                id: "a3d39113-b4b1-4146-9efe-cbaa809cfb1b",
              },
              {
                id: "b195a01b-c5ae-4018-8968-ff2a5493f13c",
              },
              {
                id: "f1efc202-db00-4b6e-a725-db349acfd8a0",
              },
              {
                id: "0a852680-2469-4c33-a7db-8e5f0fa92ded",
              },
              {
                id: "6dc23c26-5c04-440a-be5d-b4b35747ae6b",
              },
              {
                id: "6852ce1d-5079-403f-b6e0-67e700fd3149",
              },
              {
                id: "d43db2a9-997f-4852-8610-31dbcc6b0bbf",
              },
              {
                id: "e38176ce-edaf-4525-89aa-03eb4b58ff54",
              },
              {
                id: "3cec4602-51e8-4787-83e0-09736a97cdc2",
              },
              {
                id: "8c442974-d997-4826-bd22-52f621a36867",
              },
              {
                id: "7ed61efc-92b6-4308-a962-17618c2a2d67",
              },
              {
                id: "ea63e048-63f3-44fc-b8c8-1ca15aef9e88",
              },
              {
                id: "9ef2a7f7-85b9-4d0a-9493-615dddadb520",
              },
              {
                id: "d3cc0e00-f68d-4983-9f8c-8178c5c28378",
              },
              {
                id: "be75fc18-440b-459e-88eb-5a62fd746e0e",
              },
              {
                id: "4a2a817f-17ed-4782-8566-f86bd09f69ac",
              },
              {
                id: "9802b5ca-b5d5-47da-aacc-d8421524784e",
              },
              {
                id: "601b912a-7ccd-4e92-a920-efa925e09694",
              },
              {
                id: "839f767c-d4fd-4b72-a8aa-8509b0a4d39c",
              },
              {
                id: "08692e1e-33a3-4308-902f-fc2a9625e146",
              },
              {
                id: "41f8ed06-b888-4977-9297-2a4b82fd1d91",
              },
              {
                id: "9f6fe16b-ab0c-4dce-a99f-ec6d0e1453fe",
              },
              {
                id: "235e9ad3-762a-4c3d-b52c-26d07d6d420d",
              },
              {
                id: "23f8b7b7-a4b5-4f13-b208-36ff20fcc751",
              },
              {
                id: "cc21b8ad-dc64-4a7a-b637-b0416db14f10",
              },
              {
                id: "1ccb4183-ba13-4b94-9aec-6d1016b4d1a6",
              },
              {
                id: "ff4c3466-2b77-4155-a738-54646460fef3",
              },
              {
                id: "6db12a06-1c9d-4a56-b349-9f598ae6ce55",
              },
              {
                id: "faef77a8-2a00-45b0-8d97-8f6f4d5d54f4",
              },
              {
                id: "eef9f06d-112a-4a22-bd1b-9f5fc85077e7",
              },
              {
                id: "152afdf0-67b7-4bc1-a030-20338f4cdb54",
              },
              {
                id: "6ef9e19c-cae6-4b34-a505-89b9666942ea",
              },
              {
                id: "9623c0e3-b48b-468c-b265-c9c52535d899",
              },
              {
                id: "032b62c0-d73c-41f8-b796-bf86c2c0df28",
              },
              {
                id: "a2b409b5-0d24-44fd-8a7f-4ae75b678d46",
              },
              {
                id: "093287d5-c946-4495-932e-a7f1b308ae64",
              },
              {
                id: "83a7d42a-1106-4a7e-987b-531c8cd1045b",
              },
              {
                id: "08822429-8292-4956-95d1-443110e9ee32",
              },
              {
                id: "ca1ddcce-54ac-46c3-af31-3a5d9c5bcc4d",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "79cfd16c-dcb8-4b0b-8d1f-8bfa1a4a5828",
            number: 13,
            volume: "3",
            language: "pt_br",
            pages: [
              {
                id: "6d3fc146-0e7b-4ad7-b31f-a203b1ac4bf9",
              },
              {
                id: "465c6b56-ff76-42a8-b5c5-f5e4a824549c",
              },
              {
                id: "2ad96067-9f65-44f0-9765-87a51dd6fe6c",
              },
              {
                id: "7dbb97a7-4f80-4f76-b13d-52e32b58be1b",
              },
              {
                id: "b7d5d97a-5119-463a-a85d-4a8873810085",
              },
              {
                id: "1509045e-fb3b-48dc-ad54-d21604ecec07",
              },
              {
                id: "deeb4b7f-e59b-4d28-9823-57a3222108fb",
              },
              {
                id: "f9bbbb19-09c8-4bb1-881c-9dc7aea3ced6",
              },
              {
                id: "a3dc177f-0d8d-4aae-b407-5e3c1fbde26c",
              },
              {
                id: "60cbf6bc-f410-4b70-8e69-b07a034202fc",
              },
              {
                id: "b7ea73ad-22a1-44d5-847c-2c2f856884cd",
              },
              {
                id: "656f9da4-4ca7-4734-9bef-6dd4e4c5b24f",
              },
              {
                id: "c40cbfef-ebf3-41b1-a34b-dca2b54a4ac5",
              },
              {
                id: "738e3395-fc60-4494-be6b-71cd52aaba28",
              },
              {
                id: "3018097d-8059-4cf2-8ed6-6f8859b81e3e",
              },
              {
                id: "f47fd07c-55a5-4921-9d70-4b85ffae5862",
              },
              {
                id: "2c499df5-5c85-47d0-824d-b30e3390c4f1",
              },
              {
                id: "f5d85c1d-a710-477d-8932-e7a4bae7b4b7",
              },
              {
                id: "c2f23ef0-467c-46c9-b278-bac95294cbcb",
              },
              {
                id: "2b6a1a75-1d6b-4677-b8b2-ec9dd02f8220",
              },
              {
                id: "4f1eaede-97f3-4bcd-8046-5b924b7cfa6f",
              },
              {
                id: "67ae51ed-efcb-4dd8-a1a5-493f7b4d324b",
              },
              {
                id: "d199b3ef-ff31-435c-b6f4-7c704085ec6a",
              },
              {
                id: "f5af1d22-9cd9-47cc-ab60-0be949408724",
              },
              {
                id: "be15d6d5-f709-4f6c-8ab2-d3b27c4d7943",
              },
              {
                id: "a75f08c7-bfd7-4452-91fb-14d4f75165bb",
              },
              {
                id: "ce1c6293-c0d5-4731-9287-f882b99139f6",
              },
              {
                id: "93253ca3-bdb5-4b7e-a407-ac0fbc86bee1",
              },
              {
                id: "1f8e9f6c-b55e-4a5b-ad68-73f4f1c4a207",
              },
              {
                id: "ff71504b-c0a1-473f-ad4d-f69411dfe73d",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "f465facb-8364-4471-b859-07ae27fd279b",
            number: 14,
            volume: "3",
            language: "pt_br",
            pages: [
              {
                id: "3c1cd285-255f-4dcf-a302-5cf66f623ef0",
              },
              {
                id: "d8882c38-7172-49ed-ac80-eb7a49f3f620",
              },
              {
                id: "19a595d9-7a26-4a35-b5f6-0d066715df26",
              },
              {
                id: "edf514ce-95c3-44b8-bf70-3fd3351b3b72",
              },
              {
                id: "520f1dbc-007e-4303-8711-0cc4faee2701",
              },
              {
                id: "daea9bcc-b300-4470-a1d4-6e46ab5d6ba7",
              },
              {
                id: "3e2bd13b-1cd7-4fee-a2d4-c25613670ed9",
              },
              {
                id: "1262ddef-1b7f-4b9d-9f92-e4e918c2e3ed",
              },
              {
                id: "a332ebaf-be23-4c13-8716-eb85e9fd02aa",
              },
              {
                id: "2c25a935-0de6-4535-a7db-5f81fbafcc72",
              },
              {
                id: "e9a6ca38-8719-4e03-be77-41620d54e767",
              },
              {
                id: "99cbe936-5869-4087-9388-7bbb514cff50",
              },
              {
                id: "114296f1-1f8c-4a8e-addf-cc4534ad1501",
              },
              {
                id: "fb61fefc-ea23-481d-bd9f-85d631944c16",
              },
              {
                id: "fe401c97-9f92-4cda-a24b-1a68c4da50f5",
              },
              {
                id: "cc2bc538-f28a-4765-934a-9e9920504b78",
              },
              {
                id: "04df9389-0e04-42c5-9343-5ba604a5cca5",
              },
              {
                id: "5c1382e5-def6-4ece-9f2a-4b519d907acd",
              },
              {
                id: "5a4495c7-7c55-4c9b-9e2f-b38e95988020",
              },
              {
                id: "a4101a93-f3a5-4bff-b163-79d2c3c19050",
              },
              {
                id: "a0f6013c-a05b-4a1e-abce-40141cf6356a",
              },
              {
                id: "07456d28-e494-44ab-b2b4-270876db16a1",
              },
              {
                id: "944bf2b0-86c2-400f-be1a-b24964b31229",
              },
              {
                id: "fcae56d0-683c-4d83-b2b8-dc5c38963d80",
              },
              {
                id: "14c3dd13-d269-40b8-abac-02b9a6b1a6ca",
              },
              {
                id: "a46ae618-a9cb-4c3c-8a3d-fdd40bff97d7",
              },
              {
                id: "a3b2aa5b-4c43-4423-b3dc-d0d4c7d32ef7",
              },
              {
                id: "9a8e72ad-2c46-4604-a6d5-0b7705bd5462",
              },
              {
                id: "4fcd3373-5581-4bdb-bfc1-f1a3364a2629",
              },
              {
                id: "2c3276d4-f0a4-487d-aaa7-faf69561d344",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "1d185f75-0268-4ea6-bb17-3e1dde1daae7",
            number: 14.5,
            volume: "3",
            language: "pt_br",
            pages: [
              {
                id: "3136d628-a21b-46fa-b073-1ca216f93e0b",
              },
              {
                id: "615f2267-4dd3-4fd6-bfd8-369f86eff25c",
              },
              {
                id: "c28a28d2-1846-40f5-9f5c-539ac59eaef1",
              },
              {
                id: "ae087a3b-f992-4fa5-a01c-37d4e028dc97",
              },
              {
                id: "b8753d21-5399-4071-88ad-78d1092ba899",
              },
              {
                id: "b00b2232-e0c7-4bfe-a631-c1f4841dd2e1",
              },
              {
                id: "0772be7a-aef0-44df-8296-5d80ddca4972",
              },
              {
                id: "3775c9b6-f13e-457e-be8d-c1159b4c3ca3",
              },
              {
                id: "9db45e2f-cf19-4899-977a-e77c1387da14",
              },
              {
                id: "bb3cb273-7a12-4aa7-a2e4-f5f79e44a5c3",
              },
              {
                id: "23c54282-e573-4701-8eb8-d7473485dece",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "9864a8d1-392f-4d36-b6c2-8f4c4d8517f9",
            number: 18,
            volume: "4",
            language: "pt_br",
            pages: [
              {
                id: "3547bb88-9d31-4632-87b6-8abfbc698b9e",
              },
              {
                id: "4779dadb-03f6-4572-bb0c-270105665c16",
              },
              {
                id: "c239f40b-e665-4fab-941b-063c3f88e051",
              },
              {
                id: "bb1462ab-1497-4877-b90a-b0a8907a61f1",
              },
              {
                id: "cc555660-e175-4c5c-bb0f-fa3dfe46a80f",
              },
              {
                id: "3ebc314e-bb63-4109-ad6e-0a26851a3657",
              },
              {
                id: "8173e8aa-9ca5-4de2-94c3-68ae227ed090",
              },
              {
                id: "49fedf92-dbd1-4f1e-b0b0-7d8d9ea41964",
              },
              {
                id: "93307859-bebe-458f-b7b9-06dde006e3c1",
              },
              {
                id: "1e0d75c6-9cdc-406f-aa43-cd9720d0c65d",
              },
              {
                id: "8a0ce84d-3468-4263-befd-d28cdce8387e",
              },
              {
                id: "0884f8a9-60d0-46ec-8c60-4319ceb01707",
              },
              {
                id: "63a96910-44d7-4a34-946c-60481ba0d656",
              },
              {
                id: "411e1074-2c72-44c4-bdab-f93ea26e8fb2",
              },
              {
                id: "b29cca09-edc2-41fb-900c-360df1c8708c",
              },
              {
                id: "d0f0aa6b-aa5c-4e2a-98c7-de10485b5a36",
              },
              {
                id: "9d72af7e-a843-4fcd-9b17-84a9bba983ed",
              },
              {
                id: "85ad5047-f21a-4556-8ac0-a80e63cdc215",
              },
              {
                id: "8d6e1c26-5853-4f8c-99de-15bbdc56c0c0",
              },
              {
                id: "10c05121-9b52-4b24-92bf-e605a7dd6901",
              },
              {
                id: "91faabfb-c079-4c3c-bdf7-d95637dbb8c3",
              },
              {
                id: "bda82909-29fe-4df8-83b6-7380bd691654",
              },
              {
                id: "68e868e5-7edf-4e9d-b179-75b7fce3da96",
              },
              {
                id: "5766365d-ebef-4348-962c-0e6b316fd080",
              },
              {
                id: "6945280d-70e9-4d4d-a319-83a646645f4a",
              },
              {
                id: "7d27ecc5-1dc6-4786-b1c9-dd01f741a209",
              },
              {
                id: "055a7b32-0d5e-4bb9-ab17-53ff5ecd2ba1",
              },
              {
                id: "e96dc31d-36f6-41c0-891f-8a2e61991d12",
              },
              {
                id: "01593529-0dfd-4742-a9f4-67be943c2a90",
              },
              {
                id: "08e97bed-0b73-4bac-97e9-42f52494d64d",
              },
              {
                id: "903e0bbf-2928-4aaf-906b-7f3f44cfc16d",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "a273f9eb-0872-4e47-a37d-67bb5281df43",
            number: 23,
            volume: "5",
            language: "pt_br",
            pages: [
              {
                id: "b44fcf12-bb8d-4d97-8398-a34014947160",
              },
              {
                id: "2cb7e46c-e246-4fc7-b840-8fa6236bb361",
              },
              {
                id: "60ebcab5-a4a6-4d54-bf95-9c1f8bbb6055",
              },
              {
                id: "05b28f05-b406-4526-9106-ce6aa3cf2c71",
              },
              {
                id: "05c64c9b-05ee-4f65-85e5-c2b480880796",
              },
              {
                id: "81f8d8b2-f1ea-425c-823c-a5fdd08d7b02",
              },
              {
                id: "9e96e797-6eac-491b-8ea0-218401ee3e9a",
              },
              {
                id: "440d7c8b-343f-4fd1-988a-09d3c8b5efc3",
              },
              {
                id: "7321bb69-203d-4a0e-82bd-b2bb65d329ea",
              },
              {
                id: "afb361dc-e870-4df5-bb8e-35c1e0250e45",
              },
              {
                id: "4c0b9e6b-f751-4d5d-911f-d74bf3542d72",
              },
              {
                id: "2f8b887d-c063-453c-ac90-fc790dd70a3d",
              },
              {
                id: "72eb6eaf-63f9-4ca8-8b4a-fb8e105046fa",
              },
              {
                id: "0be258c5-36e7-4c42-9cfd-042acb788c8b",
              },
              {
                id: "fc6240a8-8cdb-4a28-a38c-9e1cd3b31b16",
              },
              {
                id: "4ce64ce7-109f-45b0-95f4-036338b568b2",
              },
              {
                id: "f0eef367-b4d6-45e2-be0c-de568eefd983",
              },
              {
                id: "78816df7-63e8-4e04-87f3-a3c1f99149ff",
              },
              {
                id: "c5b2a275-02a0-4a88-ba68-7b30ec0cf209",
              },
              {
                id: "c77e8445-db4c-488a-857a-e63f12d71b8e",
              },
              {
                id: "4ea31f5b-d0a1-4940-990c-3e1338169de6",
              },
              {
                id: "94f3723c-9b7a-415b-b2e5-ea3b5140c076",
              },
              {
                id: "61d3dbc4-7fda-4b3a-9ec5-918bd503cfc1",
              },
              {
                id: "cee849ed-ed13-408c-80fb-6fca595d0c49",
              },
              {
                id: "a74f61d9-aeee-4945-986c-9baa3ef68bd7",
              },
              {
                id: "fe72cc79-fe6f-4533-bfcf-95c9ca149d68",
              },
              {
                id: "de0cec95-fd27-4981-a58c-0c8695147132",
              },
              {
                id: "d1667383-ad0e-41cf-9847-4c00e3f1d02e",
              },
              {
                id: "9a06272a-cf19-47d5-9125-1eea5bb1bc60",
              },
              {
                id: "6347ea33-1ff7-4052-b6ad-cd69c46f841c",
              },
              {
                id: "52cd3a10-60df-45a5-9efe-186da782f60d",
              },
              {
                id: "9a96d43c-5487-49d4-87c0-74cab960ea49",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "e98318f9-ede5-4a76-962d-3144a15a7280",
            number: 27,
            volume: "6",
            language: "pt_br",
            pages: [
              {
                id: "bf363ec1-3a91-4691-ba10-56e47ab60714",
              },
              {
                id: "f8043d81-f81d-4f8a-bd9a-fd3c913303d1",
              },
              {
                id: "9a90811e-f75e-4f40-a874-063963bf6e7c",
              },
              {
                id: "f6246bf8-9c01-4753-8d43-201f77f826c0",
              },
              {
                id: "d8faba5d-a661-46fc-a263-5d04627079d5",
              },
              {
                id: "60546926-79c9-4978-836a-728997cba9eb",
              },
              {
                id: "200a7425-aafc-49e8-8df0-fab89cf7ff4a",
              },
              {
                id: "e37d830e-7f9f-467f-8b9c-1c079bb694b1",
              },
              {
                id: "92adcdab-7a56-4a6b-8c8d-78a7cf462e27",
              },
              {
                id: "630a4ad4-745d-4daa-9029-731d7937885a",
              },
              {
                id: "5749cbbd-460d-4c23-88f3-39b45edb4321",
              },
              {
                id: "a19a262d-8f15-4b0f-b602-3f3ea9dc7e4e",
              },
              {
                id: "85ada32d-922a-41dd-a96e-510fc6d00b78",
              },
              {
                id: "2a025139-6c99-40b2-8ccc-c5dd59f3cb07",
              },
              {
                id: "b19b63e5-e503-4917-9bf0-b0bc65f00db9",
              },
              {
                id: "fcb0af34-fcd0-4180-9a58-41c92f3f9150",
              },
              {
                id: "4557b1a7-80ea-451a-818b-aab0a5cb86e0",
              },
              {
                id: "49f5544a-d801-4b49-9150-e497c7a08c68",
              },
              {
                id: "4f389a83-424c-4c1b-b194-8b4d629a185e",
              },
              {
                id: "b16edd31-f306-4a28-b49d-961fe0e31656",
              },
              {
                id: "6ab40155-4f36-46b3-995b-2ae371ebb315",
              },
              {
                id: "b559b849-ba7b-4d8e-9a2f-64a87116957a",
              },
              {
                id: "8e91c59f-5d5d-46da-afac-34c7f1243218",
              },
              {
                id: "d64b7d94-9625-410d-a85b-2843e8cebbc6",
              },
              {
                id: "5e01c962-9d9e-4baf-9af5-fed3e61244ba",
              },
              {
                id: "0cc11b21-40f6-4ee4-82d4-da46ce08ebf9",
              },
              {
                id: "eb09e68d-430c-4212-8109-e64095cc50cb",
              },
              {
                id: "e1260f29-ce7f-4f10-a2bf-7b105fd2040c",
              },
              {
                id: "964c992b-4b03-4b0c-ad23-8ed0857846ba",
              },
              {
                id: "28444e23-4eae-4b9f-ad43-b65097b9e9c9",
              },
              {
                id: "7a8f42de-5a8f-4b34-9661-a6b02ac12bb1",
              },
              {
                id: "ead1fbf1-8af1-403f-94f4-b11701a6a6da",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "baf9ccba-ee05-42ea-9cec-4bdd70b12802",
            number: 32,
            volume: "7",
            language: "pt_br",
            pages: [
              {
                id: "29a4bdef-cbee-49a2-9f79-58b1f2e9086d",
              },
              {
                id: "7894df43-236f-426e-87fc-108f02d607e1",
              },
              {
                id: "c71a619f-dcbe-4aa2-8dc9-51cf24102c68",
              },
              {
                id: "884af4da-607f-497e-ba2c-491ae0abf857",
              },
              {
                id: "1a968133-9d46-4ebf-98a2-01145294647c",
              },
              {
                id: "57398751-3764-4fb2-a9b0-35c2f36eaf22",
              },
              {
                id: "622650ac-6e1b-44c4-b4fe-947f901f395b",
              },
              {
                id: "68dafa69-f6ba-407f-9539-30ddda7921de",
              },
              {
                id: "f9c8051b-9a17-438e-9bb5-40a673d2d354",
              },
              {
                id: "b59ca0fd-d717-4f73-9d2a-7f9b08817300",
              },
              {
                id: "77d1b6cf-576f-4e7d-87f0-a31d2c70e912",
              },
              {
                id: "9e39f2a1-c35d-4f1e-815a-11f776a6e157",
              },
              {
                id: "f7bc34b1-1e59-4d09-9549-cb1da1d85046",
              },
              {
                id: "be9196c6-e712-40ae-9cbe-a75aad6e6084",
              },
              {
                id: "a24558f5-aa50-4531-a975-74884a4c3a4c",
              },
              {
                id: "f4796dc4-16fe-48b7-b8ec-6a9f5992ed3d",
              },
              {
                id: "6465ddaf-9bbc-4336-bee0-5bf432a05fbb",
              },
              {
                id: "3b00765a-8c38-4d5c-adc5-80d5b1e032a6",
              },
              {
                id: "babd0554-db89-4db5-ac83-581a115e4d4d",
              },
              {
                id: "bf5e25d1-8057-412a-9959-3bb8778d6cb6",
              },
              {
                id: "36e1e100-71af-4638-96b1-a1f5d44e6a3e",
              },
              {
                id: "c97efe09-debc-4730-807c-0dc443306043",
              },
              {
                id: "f20fe4b3-f96b-48cc-a74f-f3fc5f61fb17",
              },
              {
                id: "32f59a50-ffd6-4b5b-bbde-1d1f82851c5f",
              },
              {
                id: "eeb09e1b-ff47-4dd9-be37-85ff61db7c80",
              },
              {
                id: "c74169cf-7781-49be-a42d-4d353db37606",
              },
              {
                id: "581742e9-fd2f-43b3-905a-ce5d04b0d2cd",
              },
              {
                id: "4d67fadf-cba3-41bf-93a7-4c06ca3b962f",
              },
              {
                id: "ea4ff4e4-5ef7-4c1a-9cde-effcaec919c7",
              },
              {
                id: "2e4dd546-ba06-43b8-98cd-40271a81a604",
              },
              {
                id: "890feeae-ea27-4c76-aecf-04ad1787cbb7",
              },
              {
                id: "9d283907-0f60-416e-893e-fab76d386a6a",
              },
              {
                id: "9bed9c1f-cb15-47e5-bedb-b6b0f2f552ae",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "89706ed8-4d38-42d0-ac36-734cb74e4b4b",
            number: 36,
            volume: "8",
            language: "pt_br",
            pages: [
              {
                id: "def8023d-cb42-4881-8709-b45ad86fef12",
              },
              {
                id: "fea2aa15-0192-4681-9576-8831253fcae2",
              },
              {
                id: "f91b9786-26c0-4e6d-a43f-b136aeab18e8",
              },
              {
                id: "9631d031-6850-4d45-a580-38dcf517e34d",
              },
              {
                id: "9cb9fd5c-f964-4bab-a8ac-6189426f9ab0",
              },
              {
                id: "91259815-f58f-46c1-ba63-4c8d000a62d5",
              },
              {
                id: "24f33110-6d34-48e2-bb31-a54fbcef3654",
              },
              {
                id: "7d933009-15cc-4057-b049-01ffe07cabe8",
              },
              {
                id: "568b0d11-cc10-4379-9e41-a5f0946824a0",
              },
              {
                id: "0d62e69e-73ef-429d-96cd-74f3df5768ca",
              },
              {
                id: "2e2de161-28c8-4f99-a92b-c360c795ec02",
              },
              {
                id: "0e7f4ffc-7120-4f1a-bac7-b7689244259f",
              },
              {
                id: "93d884af-b433-4bad-9e14-b24971de018e",
              },
              {
                id: "484daa4e-bc72-48a7-9525-da2f90c08191",
              },
              {
                id: "6eaf24d8-793b-4437-acc3-057bd49e8b21",
              },
              {
                id: "5c10f94b-8cab-41cb-b692-ef8759547b22",
              },
              {
                id: "fef0d31d-5a3f-4b09-9d01-ee7db3b49db1",
              },
              {
                id: "66847da4-d396-4239-abbe-c783d149afac",
              },
              {
                id: "bfa523fa-dfaa-443e-bfe5-0aa2907e93aa",
              },
              {
                id: "a1b06790-f299-44ee-aed4-541427a87918",
              },
              {
                id: "f1fa691e-4f7f-49d6-b09d-e7a7d3de172c",
              },
              {
                id: "d1ae8324-d353-4521-9aa8-eea5f7855670",
              },
              {
                id: "e3d952f6-f1a9-44f1-bc78-3e48b07a55d8",
              },
              {
                id: "e654c374-725e-40b7-b4b2-d2690ac6d4a7",
              },
              {
                id: "cae9493f-0c47-4424-88ed-b6cf0ec776dd",
              },
              {
                id: "50b1d48b-ad8c-4d8a-8d96-5488fa9731fa",
              },
              {
                id: "5aea0277-9822-4ba0-81d6-821abb01b5a0",
              },
              {
                id: "3d3e57c6-9ae8-4905-9b7f-fdf864ba70d7",
              },
              {
                id: "8677a63e-4b13-41c0-8dc2-6ed82859cd49",
              },
              {
                id: "919cd0cf-466f-4fce-9138-079126bc5e9b",
              },
              {
                id: "f0f9218c-4854-44fd-9fba-d665c7081d5c",
              },
              {
                id: "9a3d0180-9546-4fdc-981e-ef5beaa8a9d4",
              },
              {
                id: "aafb939f-bb6d-4663-b6b6-70d39c6ebcd3",
              },
              {
                id: "56e6b8a7-f1da-4d0a-b717-ede9ee466889",
              },
              {
                id: "b857069e-4004-4473-ae9f-e325d218b290",
              },
              {
                id: "ccb250de-4abf-43af-b81d-f472d40c583f",
              },
              {
                id: "b58142d6-a1f4-418b-ba20-c54a64af7eda",
              },
              {
                id: "a1464d87-ff40-4549-8f35-de933493c19e",
              },
              {
                id: "4a688780-435f-4f8b-b0a0-dfa680d69bd0",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "4f594924-f40d-4f8f-adc7-0b637dbb3911",
            number: 40,
            volume: "9",
            language: "pt_br",
            pages: [
              {
                id: "84950584-8338-4ee4-85d1-26258049e61b",
              },
              {
                id: "eb5a5ce1-77a3-4702-a14a-056eb0fe59cf",
              },
              {
                id: "05cc82d2-6272-45bd-bc51-f7102c7c47cd",
              },
              {
                id: "4498df61-d6b4-4b5c-b455-e430d271a9d7",
              },
              {
                id: "33983221-218b-488a-90e6-a60a54ad2271",
              },
              {
                id: "c8fe0a69-0bc1-4ae5-8f7f-099beaa42bcd",
              },
              {
                id: "bcbd8e09-3479-46e0-993c-6fdb1bdfcd15",
              },
              {
                id: "edded079-1d0a-4a8c-ba76-f136b52592ae",
              },
              {
                id: "15c852fe-9e15-43cc-bcc2-09bef651ba95",
              },
              {
                id: "8f982f62-8765-4d1b-aa67-62a98f30c666",
              },
              {
                id: "87077cbd-2df3-42de-956d-729f9b9da288",
              },
              {
                id: "2b9f8fbd-ab34-46d5-a811-15243ccc398d",
              },
              {
                id: "35440dba-454f-424b-9697-a314ef38b6e6",
              },
              {
                id: "8b392267-682d-4be1-a547-147c468b2d85",
              },
              {
                id: "38e9c3a1-680a-4dd3-abfb-97a0ad357c20",
              },
              {
                id: "3b587cbf-13f1-48b7-b42a-3d7b0dbbb8de",
              },
              {
                id: "86fa8e86-2b75-4abe-9848-4ae7de06db69",
              },
              {
                id: "17c86e56-d4b4-4aab-b81d-1a2503d75d3d",
              },
              {
                id: "475aeb35-eb7e-48e0-8dac-fd5ae5e60e19",
              },
              {
                id: "3ce2cae1-0dcd-4d05-8e38-2ded60439120",
              },
              {
                id: "42d7b9ea-59e7-4a5a-b051-cb5bce1103be",
              },
              {
                id: "2d8edca4-2d29-4bfe-9703-ca85f9c29863",
              },
              {
                id: "a9eb0fb7-a276-4997-bb12-95b8f4c39c44",
              },
              {
                id: "906f0c6a-8dc4-41c9-bdea-3c96561d4f27",
              },
              {
                id: "288e818b-32a4-4708-81c7-81ff7cb1551c",
              },
              {
                id: "9c16eee0-f4d1-4d58-83e4-c5ad5d2a65d1",
              },
              {
                id: "9503b82a-5ec7-4932-a212-132239e66afe",
              },
              {
                id: "da74abb8-27d8-4d5a-90fc-e24ce1673ba2",
              },
              {
                id: "0df9d53a-dfd3-4388-832b-dc899e5789c9",
              },
              {
                id: "0307cbe7-8af8-4f79-bc6f-268d042766a1",
              },
              {
                id: "adfeefe3-3762-4445-b185-b6734f91a610",
              },
              {
                id: "87323443-9ff5-411d-8243-4c40dd4f13e0",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "14f2c3e2-ad2c-407f-8e5f-14030799cc46",
            number: 45,
            volume: "10",
            language: "pt_br",
            pages: [
              {
                id: "c6744c60-4c15-4169-a191-ab9065658568",
              },
              {
                id: "d20e57dd-7dac-4839-9bac-70831942c060",
              },
              {
                id: "e5e4a648-4dfb-4b49-8159-81097aab1680",
              },
              {
                id: "bfe6a34c-32fe-4ac7-8915-247d2eb65e0d",
              },
              {
                id: "3e2d79df-d45a-4b5d-ba46-6dd593b7a8da",
              },
              {
                id: "34ac60a1-3da2-496d-bcae-7b69dedc1ddf",
              },
              {
                id: "8fa5c4c0-dafa-4c46-b32a-5f1eacb061a1",
              },
              {
                id: "98d861d8-e59a-44cd-b510-838aedadc372",
              },
              {
                id: "7aa9621f-c16a-4440-9f0e-25a7375a8d7e",
              },
              {
                id: "a099c161-6d31-4706-9865-ffa4ac00caa5",
              },
              {
                id: "88b37dbb-e527-4fc0-926f-c41b6066e6b2",
              },
              {
                id: "2f01bb32-b2ee-4cdb-be36-96075faac5ec",
              },
              {
                id: "9702f0c9-e707-4a75-9488-f21a033e9fa7",
              },
              {
                id: "b43490fa-7066-492a-8280-c313c366356d",
              },
              {
                id: "d4cbef9d-f943-44db-acda-0f2f8998ab36",
              },
              {
                id: "b6fd8b60-6568-40fe-8682-d6426617d691",
              },
              {
                id: "c93bc72e-6e7a-4253-a877-12bbe9965bd9",
              },
              {
                id: "084a060d-6cf0-4049-8396-52a76f3c86f3",
              },
              {
                id: "f986a0f2-ec37-4cf7-8ed9-0739ae42d786",
              },
              {
                id: "9e6142fa-b924-48d7-ae2a-ec11a70d2679",
              },
              {
                id: "89915b07-9f3f-491a-bdc2-287f82c8edc7",
              },
              {
                id: "d3203ea7-a1e0-463a-aed4-9718a05c42d3",
              },
              {
                id: "a9e3d313-f9ae-4d1f-91f3-fc1ad2016574",
              },
              {
                id: "3bf2193a-72bf-4616-a2ee-b72ab23da05d",
              },
              {
                id: "74274832-42b0-4df7-82bc-1a8b094f374e",
              },
              {
                id: "89a9bc45-2ce6-4548-a7fd-4a41f0762a97",
              },
              {
                id: "03737a8c-1b5d-4d71-acc8-21844321472f",
              },
              {
                id: "c6c12a9e-030a-477b-985a-6588bfdd2dd3",
              },
              {
                id: "f27a2e61-1af8-48c0-8a90-83ca381f743b",
              },
              {
                id: "cde64b5e-ce63-4c55-815a-5679a4084e2c",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "08a64483-cbad-4589-8e47-578fdddb4366",
            number: 48.2,
            volume: "10",
            language: "pt_br",
            pages: [
              {
                id: "78c0ff5f-7a0b-4b20-bc7d-d93f8ddd1097",
              },
              {
                id: "bbf288d9-1860-475b-8794-4beb8d35d5e5",
              },
              {
                id: "4d647d6d-3462-48a9-93e8-a30afe103bfa",
              },
              {
                id: "3f94a02f-c435-42d9-b426-6c306301fc78",
              },
              {
                id: "1a4ecabb-aaff-4d93-96f3-9760f3001443",
              },
              {
                id: "1f5190b8-5499-4a0e-943f-a0aead49d70e",
              },
              {
                id: "30e2fc65-053a-4d6b-94d3-657a891a5c5b",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "64d2842d-2fd5-44e9-8176-df538d5eae01",
            number: 53,
            volume: "11",
            language: "pt_br",
            pages: [
              {
                id: "d1c6fb44-04a3-4cdc-8c22-df1552c31d26",
              },
              {
                id: "e5fec68f-3dcd-4ffc-ba1d-b6d292cff14e",
              },
              {
                id: "c93934cf-aaf5-4cc7-918f-ba385e0403e0",
              },
              {
                id: "61cdc0e0-2706-46e5-899d-43176d807e97",
              },
              {
                id: "2785d448-ed82-4ed6-bb24-5a489694c66a",
              },
              {
                id: "2eb202f3-fff9-4ace-9054-8ead89c0547f",
              },
              {
                id: "500996ff-c4b5-4382-a8bc-ed7d56e6f72b",
              },
              {
                id: "c8ce1e07-915f-4064-b37b-28e57bae32e5",
              },
              {
                id: "15a0920c-3afa-4dfe-8740-0af0edd97c47",
              },
              {
                id: "4f99699d-3137-430f-8792-beb4c19eb3b2",
              },
              {
                id: "ff87acbe-b3ea-4f9c-835e-b197fc9be637",
              },
              {
                id: "733fc28b-3c60-411b-8afa-a9304e600f46",
              },
              {
                id: "932308c4-2edc-460c-9995-f864ff8380e6",
              },
              {
                id: "0896763b-92db-48c0-a3e6-f26149b01cf0",
              },
              {
                id: "90256fc4-03b0-4258-8618-492cad1d0722",
              },
              {
                id: "cd30024d-c670-4f43-8004-5bb3c567391d",
              },
              {
                id: "84aecfb2-ed27-47b2-93d4-7f59ffd880a1",
              },
              {
                id: "53b1e1f3-29df-4a8a-b277-a2779373a517",
              },
              {
                id: "fd8572e2-785a-4c89-b1b7-8643808b0063",
              },
              {
                id: "ef95aa7d-b26f-467e-b96e-fdf4ac2991ee",
              },
              {
                id: "6aa401b2-0108-40b4-ac90-e2a884c1df2d",
              },
              {
                id: "32a70c9e-46f0-4ba6-9e8b-1f63c267e05b",
              },
              {
                id: "5c0c6a40-7977-4282-a86a-201e0340b5c0",
              },
              {
                id: "77f72c94-0c3a-420c-b577-797a16bc61ad",
              },
              {
                id: "08aa93e1-c03f-4446-be7a-c027ead2684e",
              },
              {
                id: "dc9e9631-21d5-4ff2-8df0-132b7737295c",
              },
              {
                id: "f98e0e02-c613-41b1-978b-90d1851c4c7c",
              },
              {
                id: "c204d611-f7da-4146-8fac-b7cba390298a",
              },
              {
                id: "b11caf74-b284-4f80-a526-c5c58a1b7f1a",
              },
              {
                id: "49c39242-a886-461a-93d2-eadbf2b31593",
              },
              {
                id: "fd2b9c8e-d1ee-4b8b-b49c-aa35e8ca02a2",
              },
              {
                id: "5ec71b2d-b6b6-44de-bd7c-85b40c43ca11",
              },
              {
                id: "f725c16c-0a6b-43af-9966-cf03b276af78",
              },
              {
                id: "81852a8e-b608-47ca-b73e-54d1a11a88e2",
              },
              {
                id: "ddf994a8-a650-4cd6-a0ea-fd881167393f",
              },
              {
                id: "43315af5-fbcc-4e99-b70a-5387ba80ebec",
              },
              {
                id: "1dca732d-2251-4add-9f57-8e0c106aae1e",
              },
              {
                id: "9530da59-4b75-4ff0-8aa9-1b95d1a4710b",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "cadf5fe7-5a3d-4598-b9c9-d52d256d34b5",
            number: 57,
            volume: "12",
            language: "pt_br",
            pages: [
              {
                id: "c3026aef-9006-454b-ba15-11ada118c326",
              },
              {
                id: "8a5ae9ad-0d3d-4566-b0fa-704dc77d6bf6",
              },
              {
                id: "001efa97-855e-48cc-87af-f8cf71a9f849",
              },
              {
                id: "a314eee4-98b9-4cb9-a987-849cbe8a49dd",
              },
              {
                id: "a54a0c4d-3711-4cf0-9642-822213662e05",
              },
              {
                id: "76ea4325-f864-40d8-b514-848480cbc977",
              },
              {
                id: "05890906-ecc3-4f2e-9e75-d8c69365b902",
              },
              {
                id: "f61a1364-6575-401b-90ab-253062555675",
              },
              {
                id: "78d0113e-b8af-4fb4-ac43-a3d4209f820d",
              },
              {
                id: "20e50d12-556e-41bc-82fb-9e153c4ebf4f",
              },
              {
                id: "c6705c0f-e170-430f-a4e1-cfaed43024dd",
              },
              {
                id: "d8d80b15-c407-41c1-8441-5d37b05b163d",
              },
              {
                id: "737b9ad7-2ab6-47cb-a6c9-933601030dcb",
              },
              {
                id: "4630f850-81e7-4b80-bb01-30a500309de5",
              },
              {
                id: "55743d70-68f8-45b5-a9f1-4d2ab3944694",
              },
              {
                id: "ffe00724-cb13-46e5-9cac-3d8e9f2655c6",
              },
              {
                id: "817c0fa6-a177-4f04-afd3-c24e0039372b",
              },
              {
                id: "9664bce9-1d63-44a4-86eb-8fb82bd2283a",
              },
              {
                id: "68bcb663-a0fd-42e0-8c77-e369f413681c",
              },
              {
                id: "3e7112f4-c309-4aec-87d2-bbaf4024c1b4",
              },
              {
                id: "1fa2ece3-0cfc-4cf6-ac81-90f31c6b4b52",
              },
              {
                id: "7a41e1a5-6938-4b59-bb13-4164ecf83ebe",
              },
              {
                id: "3aadb6d5-ec49-4531-8633-aa8ada2d379f",
              },
              {
                id: "3e3dbdfd-a9ed-48d0-9744-83f3ed498481",
              },
              {
                id: "944a5191-b345-42a3-a460-f29ff3958276",
              },
              {
                id: "9bef9d26-446c-4dab-9c7e-3a6245e39c0f",
              },
              {
                id: "48ccc9f0-4fd5-4b36-b912-3ab644893cc1",
              },
              {
                id: "bc798972-4f4b-4924-a296-5b83189c7e85",
              },
              {
                id: "7f1527e9-baf4-454a-be31-4708e1cbc2b2",
              },
              {
                id: "e67fd825-a036-466d-851b-792979f78abe",
              },
              {
                id: "719ae29b-db8d-4e36-b3eb-9a365be7adad",
              },
              {
                id: "c20de164-fc46-47c7-824f-426e3004d636",
              },
              {
                id: "f67bbb06-530f-474f-9cc6-89e8ab9768e1",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "a96ae752-abf7-4c0c-8cfd-3002a947bcdc",
            number: 61,
            volume: "13",
            language: "pt_br",
            pages: [
              {
                id: "021dd89d-7d0c-4e11-9a5f-e4eeb42a3070",
              },
              {
                id: "f0a3fad2-e953-4101-a005-e5dee46bcf29",
              },
              {
                id: "d0a8525c-a372-4479-8dba-d1fb0350eb7b",
              },
              {
                id: "9926447f-66e7-4903-a3b6-7a1be4d2e89e",
              },
              {
                id: "649bba07-b147-4659-b688-5227155e1958",
              },
              {
                id: "b8c020eb-1222-4661-b6c0-cb8f3367ba9d",
              },
              {
                id: "0d930796-52d6-4a7c-a009-f81bfec7dda6",
              },
              {
                id: "9cc97a82-a51e-48b3-b28d-07d9fa6962ca",
              },
              {
                id: "975c1531-111f-4140-932a-e8cf449160db",
              },
              {
                id: "faae3674-302e-4eda-9f95-3a589f972515",
              },
              {
                id: "354be48a-f358-4c4d-a48c-6b2c419f2902",
              },
              {
                id: "d738972a-4861-4068-9c43-4f62cae56646",
              },
              {
                id: "f9ccdb6d-2859-4c0e-a6b4-0114296dddde",
              },
              {
                id: "b648e2cb-2793-44a8-8b02-af941fc36b53",
              },
              {
                id: "dce9d8a9-e635-4e2c-a0d1-02df0ba02fe6",
              },
              {
                id: "c736296a-683f-45bb-a395-7eb5f77b7621",
              },
              {
                id: "2857b9ad-c23c-4209-9691-007f927b5d64",
              },
              {
                id: "1e8fe06b-35b5-480b-9474-e52c18c4c8b2",
              },
              {
                id: "39a0f90b-fb10-45a8-b008-77a9ec90bfc1",
              },
              {
                id: "e9e5b9c6-ab3d-4578-9116-61f3a563dd07",
              },
              {
                id: "411369e2-8d93-44be-bbfa-7668a27a5191",
              },
              {
                id: "941d2f09-04a8-4cf2-969b-c0cce3e48ecc",
              },
              {
                id: "41dd943b-74e7-4377-881a-d005b342fcce",
              },
              {
                id: "9aab3e66-21c0-4954-af36-e29c2cbbd51e",
              },
              {
                id: "860a887a-b79b-443b-bf56-1e3b47a9f72f",
              },
              {
                id: "64e50ef6-c02b-4674-9b93-d64cdfbd5f81",
              },
              {
                id: "c4e6b051-fbba-4736-91ab-51428e2e1ea6",
              },
              {
                id: "0cf7ac08-8f0c-4dde-b31c-ed6e06d3ddea",
              },
              {
                id: "23cee2c5-0827-4bfc-a102-dccd0f6645fa",
              },
              {
                id: "bc46b51f-0206-4e87-a48f-b47a29aea1f2",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "68163dfc-8152-490e-8d44-6e3ebc6aeef6",
            number: 65,
            volume: "14",
            language: "pt_br",
            pages: [
              {
                id: "bb2273c6-f22f-4560-a978-8f76642e27e8",
              },
              {
                id: "500c0446-9c92-4fc0-b4f2-3d211c92b004",
              },
              {
                id: "5fadb724-d97b-4de8-b189-89966b530e2e",
              },
              {
                id: "a61c75fa-801f-4747-bc45-1133b600c485",
              },
              {
                id: "4b2a18c2-46a7-4972-b6d1-1c1ffcc52bc9",
              },
              {
                id: "133b4ac7-b1ab-49f1-98ef-cb5bed82cd12",
              },
              {
                id: "90a51133-24af-4efb-89d1-1f7ae8e5ca69",
              },
              {
                id: "67f78787-d021-41e8-a5ca-dae64e2111b8",
              },
              {
                id: "1ec35895-ed40-4288-8b97-b4e543a29cc7",
              },
              {
                id: "c741863f-5e46-482e-acef-c63db40c1e78",
              },
              {
                id: "024ee384-76d1-4488-800a-1f7eb312bcef",
              },
              {
                id: "7a1cbb73-551a-420d-a230-2a731e7e34a2",
              },
              {
                id: "9781e847-d278-47a5-8b18-4d6a7deea000",
              },
              {
                id: "9ef41690-faf6-4d7b-96db-747a60c7239b",
              },
              {
                id: "af053a3c-c769-4ae8-9dee-af7fa004a3be",
              },
              {
                id: "792064e2-e81a-4ab9-9d66-0a55bbfb9511",
              },
              {
                id: "06c1ff90-f8af-486d-affd-48b4ca831068",
              },
              {
                id: "7e8984c4-8aed-4ca2-91f0-9e00299ec3b0",
              },
              {
                id: "a6460452-9e73-47da-8bb4-d3c7dd31c029",
              },
              {
                id: "4b004e8a-e13c-4de8-94f0-70d83600a334",
              },
              {
                id: "19f706db-530c-4bbc-b5ae-fe0c017e4a5f",
              },
              {
                id: "d5a4e708-fe72-4b74-a1ad-156b3a0f07ce",
              },
              {
                id: "d615324b-6335-4501-9999-e216e60d607c",
              },
              {
                id: "694cda17-e4ce-4f22-a259-584070bd0209",
              },
              {
                id: "1da9229a-5cb1-4f29-a942-cf2f9c7bb00f",
              },
              {
                id: "06c6af04-b705-4308-8acc-d6f1f0b0ec23",
              },
              {
                id: "e6d6a09b-89c4-4b9a-8f99-6498aa3165ea",
              },
              {
                id: "3a518526-49d4-46d6-8763-e4a1d99124d5",
              },
              {
                id: "50085a9b-81cd-44cd-be30-9e1cfb5a3f48",
              },
              {
                id: "eba5ea65-248f-4a02-90f8-ddabd2482935",
              },
              {
                id: "78b92177-4e4b-497e-ab56-86bf99f6f290",
              },
              {
                id: "2a0022c1-f628-4af0-9359-01d8c0cd6363",
              },
              {
                id: "38a8cfc3-66d5-43fa-b72a-c460d005441a",
              },
              {
                id: "3d4e8cfe-023a-4677-b276-ecba73de73cb",
              },
              {
                id: "63e26122-6572-4792-9498-5e0c88c266c0",
              },
              {
                id: "d87cd440-3909-4ba2-a89e-004acbb65e7d",
              },
              {
                id: "8201b38b-0e48-4bb8-aaaf-8dcff248b958",
              },
              {
                id: "3aa5ac9c-ac81-4122-951a-3b153fdc4938",
              },
              {
                id: "64276ef1-27fd-4039-81c4-9453451f41e3",
              },
              {
                id: "8a1165c3-ed0d-420c-8498-4ea131a53d42",
              },
              {
                id: "d63def39-5d21-4419-922e-4a27eff0183b",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "1de7b8bd-a575-4a44-a94e-9240afa015f7",
            number: 70,
            volume: "15",
            language: "pt_br",
            pages: [
              {
                id: "5e72ccb5-1133-4872-9b86-47ad740617cf",
              },
              {
                id: "d5ba9f92-44c0-4122-86ef-eac2d71a934a",
              },
              {
                id: "5e217013-ab5d-4914-adff-d243279874dc",
              },
              {
                id: "b5b51d8e-c68f-4911-8eaf-67b6e973270a",
              },
              {
                id: "5d73048e-95d2-4c92-907f-3357adc14718",
              },
              {
                id: "e2361d1b-2aa8-4823-99d7-ddabb35cb619",
              },
              {
                id: "9e22cc99-ff10-4532-8cfd-8f1e0035b17d",
              },
              {
                id: "75628378-3ea6-4b5b-b26d-8b1f770404e0",
              },
              {
                id: "f8bebd06-b2e6-4730-bd22-6cc9e293f025",
              },
              {
                id: "c27897d1-acc7-4071-a27a-b1ae4e38923b",
              },
              {
                id: "2e25a652-44c4-4059-8975-cdca4d63798a",
              },
              {
                id: "56a88b1c-0860-47b4-ae56-ac121e3dbc16",
              },
              {
                id: "197ceea8-ae99-4805-b76d-860bc633cb94",
              },
              {
                id: "bbfdeaa5-d9c7-4026-b8a8-cbafc2eb89dd",
              },
              {
                id: "5abeeb7d-47bc-43ce-b6dc-a4e4dfb3fbd3",
              },
              {
                id: "9f8f52e9-4dc3-4398-9bb0-ad39a86adfbe",
              },
              {
                id: "85b39693-37bd-4270-9752-46549a0b6065",
              },
              {
                id: "8852bc86-7c26-4fce-af21-d585460e55c5",
              },
              {
                id: "b9bf9af7-c286-4fe0-a62f-835c8debdb35",
              },
              {
                id: "13a84920-e7ea-4397-a5f4-a8c7768f56a0",
              },
              {
                id: "9f6a2b31-f06b-4b25-8051-02679e820b47",
              },
              {
                id: "bb028807-5952-4a58-b4a3-5a491d4a9db1",
              },
              {
                id: "d9bd70c6-c743-4f39-ba70-65b173d51512",
              },
              {
                id: "cf11aa6f-be8a-42bc-b846-7ceac7b6abbe",
              },
              {
                id: "810a0856-5eb6-474a-aa06-b06a0767d8b5",
              },
              {
                id: "300ad245-4bae-4d19-87cb-66e183b4e201",
              },
              {
                id: "39697be6-8efd-413b-ae43-f865e1933f54",
              },
              {
                id: "8dbd038f-e944-475f-876f-229f00d3f3ae",
              },
              {
                id: "3f87a014-2b3c-47ab-9279-2438626c4c3f",
              },
              {
                id: "ca2c75a3-3088-45b3-a51a-ade603df1350",
              },
              {
                id: "e1585f35-c3b7-4a24-bc8d-d2177a790a1c",
              },
              {
                id: "a1ecd628-3442-466f-96e7-7ab8a0199403",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "d912e3d3-4062-42ca-97ff-0bf61edb8fe8",
            number: 75,
            volume: "16",
            language: "pt_br",
            pages: [
              {
                id: "b0c162f4-93c1-457b-aca7-d084e071860b",
              },
              {
                id: "623c9523-1507-4557-9370-0bf6c1db14dc",
              },
              {
                id: "0d4e16da-c9cb-4d95-8dcb-bbaba48d2fb3",
              },
              {
                id: "0e593b58-d6f4-48ce-a6ab-5e32c96a7f62",
              },
              {
                id: "a8ee0928-d60e-4543-a0b8-bbc3a756a168",
              },
              {
                id: "3a6da4bb-e06c-4926-9ed2-8b5f2189b5e9",
              },
              {
                id: "8b8eb7f9-2b81-4e41-99a4-0d2ecf695ede",
              },
              {
                id: "4042f682-d43e-4ce5-a2ea-c073c68cb72e",
              },
              {
                id: "dc46434c-ba2e-46f2-8373-5ccfb9ba35c5",
              },
              {
                id: "64805de1-51b9-4b12-b144-0b6f2e1ee8c4",
              },
              {
                id: "a1e49dbe-a530-4bb9-b920-40d7ae0da724",
              },
              {
                id: "ddf6b32f-fe1b-4163-b3c8-4b3465aba537",
              },
              {
                id: "886f1492-d025-449d-8d69-5832169f672b",
              },
              {
                id: "025b4ec2-c28c-4a17-be75-7580e55c615a",
              },
              {
                id: "de93d61a-6e16-43ba-8ef0-622498b70e56",
              },
              {
                id: "24905e08-e9a3-4d4b-8ad0-5cf78b8583f7",
              },
              {
                id: "1e947db7-bf47-4ade-8e40-d1c08128262b",
              },
              {
                id: "da28d001-c449-4043-80d4-f198c1856f65",
              },
              {
                id: "1bd5c0d9-fd7f-4cc2-a35c-4abbde882fe9",
              },
              {
                id: "ea93130b-7d98-4f20-b7bf-2f4c3e652cff",
              },
              {
                id: "54af3515-b9f7-4ee0-84e9-1f71b4fb9080",
              },
              {
                id: "b92384b4-4329-4c3c-85e1-042ef8569e8d",
              },
              {
                id: "c91a5c24-2638-4f12-b3fe-c9e82cd833bb",
              },
              {
                id: "89c4325a-7f8c-4d7a-8e94-3f028b9ecc1a",
              },
              {
                id: "853d030c-6c33-4bda-9122-66e27d2ed24e",
              },
              {
                id: "4186b30c-1a77-4937-b466-97810facdbf1",
              },
              {
                id: "2911afc1-d0d7-46e3-8a7d-907c4465e795",
              },
              {
                id: "3f630d1e-e631-400f-b11c-d9bea939314e",
              },
              {
                id: "2b5981a6-d0b9-4fbd-addd-74599190da7c",
              },
              {
                id: "f3311485-35b6-4ab9-9115-8be344e4b87d",
              },
              {
                id: "d8e050e9-12e5-49af-8033-17a0cf984a6e",
              },
              {
                id: "c8f57818-2be7-4af1-82fe-ebfd0955c2c2",
              },
              {
                id: "d626fa4e-bc25-4aed-b687-91a8bbc0aa1c",
              },
              {
                id: "470e9a28-e19f-4fb2-9992-826c01734506",
              },
              {
                id: "fad4f10f-7b98-4bd1-a33e-84bb2fd64065",
              },
              {
                id: "45fdebbc-93db-40dd-984a-b40d6de613d6",
              },
              {
                id: "fa47bc78-a31e-43c3-bc10-97ea4da5d9e6",
              },
              {
                id: "49af3f83-74ea-4102-89be-b2fd66fb9685",
              },
              {
                id: "0aad72ad-f4f9-41e4-b324-28f5e8786234",
              },
              {
                id: "add0c279-2a92-481e-9771-70c6845496cd",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "3e7948a4-645a-4291-96d4-8eed541162d5",
            number: 80,
            volume: "17",
            language: "pt_br",
            pages: [
              {
                id: "2d04d063-b5e9-4fbf-b49f-0058348967e9",
              },
              {
                id: "6d50e5e2-1da8-40b7-9942-2033971ec24b",
              },
              {
                id: "5256c79b-0515-478c-b98d-4f24f009c6ad",
              },
              {
                id: "9625bd1b-c0c4-4817-bb14-57c47cf80a48",
              },
              {
                id: "8ac388fa-b171-4368-bc61-a380af7810dd",
              },
              {
                id: "28ece220-5fb8-4c46-960a-e8a483d1fef3",
              },
              {
                id: "e55364f0-4f30-4351-bdf1-7793fae47804",
              },
              {
                id: "0c1116df-a14b-452f-bf4f-55e6b5e26bd1",
              },
              {
                id: "c752dcdb-472b-4a3a-a466-306ace59324c",
              },
              {
                id: "014c7531-e7a2-4085-9702-984a9358b846",
              },
              {
                id: "3a9e07a3-4c54-4393-96ed-86ebfd539dc6",
              },
              {
                id: "1a5bea75-93eb-4e04-a48c-bbd31c0a4d22",
              },
              {
                id: "a69bb0d3-5357-4044-8cfd-fc524b1384ae",
              },
              {
                id: "9897fec5-efb0-4f81-85fa-a825ad3db330",
              },
              {
                id: "81b97719-e86e-44c3-8c0f-d253fa0825b7",
              },
              {
                id: "a9a5ca61-4748-49bc-8c93-05ca3db054e6",
              },
              {
                id: "7f97effc-e2c9-46d3-a0f6-edbaa3998488",
              },
              {
                id: "32357184-fad1-4364-b3ae-9c9bbf56b87f",
              },
              {
                id: "4fe46860-94a6-4cb8-b12f-fb793df6d7a2",
              },
              {
                id: "411d1160-957d-449d-bcfd-0fda3a3db1a1",
              },
              {
                id: "fb3cf6bd-ab0d-4e1d-9713-5579ca12ad0f",
              },
              {
                id: "1bf6e0b3-55b9-42ba-a20d-1f822b5337bb",
              },
              {
                id: "eb8ac4b9-b980-4266-9263-76e21a72342d",
              },
              {
                id: "1d8632ce-5c23-415e-abba-1ca936eb35c1",
              },
              {
                id: "e517b4f0-951d-4a65-999e-f4dad392012b",
              },
              {
                id: "409e5ec4-d131-4221-b4bd-75379177f1d8",
              },
              {
                id: "eed77fab-d15d-4ee9-950e-062c01410fcc",
              },
              {
                id: "caba59f6-6885-4249-99a5-e48f7afd1289",
              },
              {
                id: "85315672-7238-435c-a451-4371ec23405b",
              },
              {
                id: "23755dab-7649-4680-8af8-830c939caa44",
              },
              {
                id: "0e8febd5-22eb-4d81-a930-3fbfac36df44",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "e8521cc4-b28b-4e60-bb72-bebee1d44fbb",
            number: 81,
            volume: "17",
            language: "pt_br",
            pages: [
              {
                id: "ea7e960b-6d8f-4d78-b20c-4c031a4e958e",
              },
              {
                id: "9a1080c0-84d7-4a0e-87e3-b96cb3e2e5a8",
              },
              {
                id: "83ded211-9f0d-48bd-86c7-169c5d53d8ec",
              },
              {
                id: "a60d30ed-8c42-4814-a204-d6e6db6309c3",
              },
              {
                id: "159237bf-444d-4095-b4cf-2538b425d5cd",
              },
              {
                id: "ff8432e9-4105-4b0b-bae6-bafac1f5b2d0",
              },
              {
                id: "8899beeb-b195-40a7-94bd-a21485d0d6a6",
              },
              {
                id: "d57b69ca-df68-40a2-b6cd-b3e3a0bebb48",
              },
              {
                id: "2dfdb33b-1820-46d6-af60-703dd09a25df",
              },
              {
                id: "60eb6b79-c19d-4f1c-862a-a0f85114f607",
              },
              {
                id: "0514770f-524d-427e-9da5-4f225a34f706",
              },
              {
                id: "8e67e95f-fafd-41a5-b91a-5824f42c4795",
              },
              {
                id: "00527373-5a3e-4f0a-9a79-3e2f04417ca2",
              },
              {
                id: "61251f7a-6778-4faf-b1ea-9a0ade5fdd8a",
              },
              {
                id: "1455af1d-a38c-4602-91a1-7df6e8aa7c64",
              },
              {
                id: "9a8592a1-748a-4418-9af9-078125bbe162",
              },
              {
                id: "34592f09-09bb-4e74-aba3-b2077438be5b",
              },
              {
                id: "c033fd22-1d07-482e-80cb-8c8c0a062118",
              },
              {
                id: "930061e0-1c91-4e4a-98f0-df890c5b6fe3",
              },
              {
                id: "e159d9f8-f38a-4d7a-b86e-ef34922488bb",
              },
              {
                id: "34059fe4-a1d7-4388-bcaa-c92da519e316",
              },
              {
                id: "d784954b-0dd5-415d-8d13-65f734f8c1d9",
              },
              {
                id: "5f58fd62-34a6-4709-957d-607077eec431",
              },
              {
                id: "71c75ea2-19e7-4cd6-a31b-1f7724ed3483",
              },
              {
                id: "12aa8adc-7243-44e5-8ca1-ec373debdd77",
              },
              {
                id: "1c251f89-8590-4699-9de9-645500f2f6b8",
              },
              {
                id: "e67abcf9-c5a5-4fdc-b37f-acdd96c78179",
              },
              {
                id: "178a59ed-709b-414e-9a9e-d40d194a20d3",
              },
              {
                id: "186aea67-4776-457c-8320-54864ae30c10",
              },
              {
                id: "946d4ca4-117a-44f2-bdf3-fd2223b2bc90",
              },
              {
                id: "2ac13c2e-ec7a-4174-ab52-1f71ce2206af",
              },
              {
                id: "28816d46-5857-4890-9e1b-e06af8667a8b",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "baa41718-c340-403b-812b-98ad75537a15",
            number: 82,
            volume: "17",
            language: "pt_br",
            pages: [
              {
                id: "aa3c62e5-d31c-48b0-8400-66376e4d7242",
              },
              {
                id: "33be4ff6-7c53-4b37-8818-fb678a6a5a4d",
              },
              {
                id: "0328eb2e-68d8-4c6a-9b33-340af47e11d6",
              },
              {
                id: "ecacd067-c5ce-4dd0-a7dd-770f1c60973f",
              },
              {
                id: "68f38d00-ffe8-46e2-a63a-71c0c92bb626",
              },
              {
                id: "d69e98eb-8d9f-4049-8a52-b095fc7ef93d",
              },
              {
                id: "aae619f2-40f7-45dc-96fe-be1a94e8b48a",
              },
              {
                id: "de92c047-6fc4-418c-b91e-c9f80873fe4c",
              },
              {
                id: "51f1b911-bbff-4aaa-b215-4a515b0beeb5",
              },
              {
                id: "bc963772-f99d-4d63-8df5-8f6f8972ceac",
              },
              {
                id: "aaf42d45-a3b3-4a24-9ac1-636bbaa69f89",
              },
              {
                id: "043f241e-be43-4fe6-b587-a24eacea4225",
              },
              {
                id: "fdfe89d6-1b61-441c-a3f0-eddedd0355b4",
              },
              {
                id: "96e2d93c-e452-4579-b363-c84916b03764",
              },
              {
                id: "6ede2449-7863-46e8-8a36-886a3f740beb",
              },
              {
                id: "3bc9a8a0-8339-4b67-87ab-f7a8b2dd2966",
              },
              {
                id: "cca3681d-9b00-4bc6-8490-fe40629293c1",
              },
              {
                id: "0f122a15-f731-4720-b8a9-54b7b77be8c2",
              },
              {
                id: "32b08969-7242-493e-9c8b-23312c8d46c0",
              },
              {
                id: "011bd3bf-bf23-4fa3-bec4-242f1aa2a4fe",
              },
              {
                id: "f9b24856-361c-418b-bd0e-6f5dad00151e",
              },
              {
                id: "b4f2f552-8a05-45c2-ba0c-ce34c2aa9d6b",
              },
              {
                id: "aaa919fa-58ab-4485-8b01-e69b2afa05e4",
              },
              {
                id: "e169fa9c-6160-42bc-bf23-ffb2e44b2c39",
              },
              {
                id: "afd199f5-03e8-4089-84c2-2292e0544cf9",
              },
              {
                id: "c9ab6405-ade7-4103-8e0e-212ce189aa58",
              },
              {
                id: "95fe4d27-6a28-470f-b671-60d31686a1bd",
              },
              {
                id: "dbcfa058-f112-4d30-9a59-133ec2751f1e",
              },
              {
                id: "309b393e-59c1-4688-9acf-14a4cb04e2c6",
              },
              {
                id: "fb0039a9-9824-41f9-8013-86de55746919",
              },
              {
                id: "c6ad645f-02be-427d-970b-add40368452c",
              },
              {
                id: "5053fcad-c59d-40e5-87b3-6d6c57552a0b",
              },
              {
                id: "057c3021-b534-4666-a9d9-a5a17bee39d3",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "58801d78-8618-4932-8abf-81b572ebfc84",
            number: 83,
            volume: "17",
            language: "pt_br",
            pages: [
              {
                id: "928b54c3-5a6f-4f50-b0ad-5377d515c03c",
              },
              {
                id: "3bc61d2c-e889-4003-af0d-48e4783d95db",
              },
              {
                id: "1495b9d8-52ab-410a-b220-cd741ae1a28b",
              },
              {
                id: "6b8469ae-3932-43a5-a2b1-e585ae871d3e",
              },
              {
                id: "7fcb1ef5-d9d3-44e7-9038-fa14b09c0d3a",
              },
              {
                id: "1a24d2a5-fde8-4890-b69f-e7ab7e6b4e81",
              },
              {
                id: "f11b82ef-0bc5-4975-8a76-f487b3830c42",
              },
              {
                id: "c49c8e83-b5d8-4fd4-b583-f20739740370",
              },
              {
                id: "aaf94b03-ea7f-4a3e-9759-bccd202c58c0",
              },
              {
                id: "de431b87-162b-478a-b601-e670639b0ac9",
              },
              {
                id: "28c544e8-7271-404b-a32f-69ccfe144481",
              },
              {
                id: "b13b7dab-f85f-4a0f-b9bd-7b897c558ac5",
              },
              {
                id: "d485694c-6812-4eb8-a0cb-634990c3e603",
              },
              {
                id: "fd3523ca-4264-4b16-a9ca-f54c4349dc35",
              },
              {
                id: "a6ba3ce7-627a-41dc-bcde-16ca2b48df6d",
              },
              {
                id: "d109cf85-8202-4853-9788-31ee256a0d08",
              },
              {
                id: "1521deb6-eed3-4d2c-a72e-41655f1e4259",
              },
              {
                id: "6db0b309-13e8-4b9c-ac10-7eae61ba5568",
              },
              {
                id: "81b38112-02cd-423b-8942-33e4e0626548",
              },
              {
                id: "6dcfc463-f998-4181-84a5-ca685effb448",
              },
              {
                id: "9617d57c-50bb-44d8-a5a6-2f5c3491a5d6",
              },
              {
                id: "c8ef89d4-4f43-412e-93b4-0093143a0f90",
              },
              {
                id: "0478d056-512b-4ddc-85cc-f886432c658d",
              },
              {
                id: "1e51ba87-67fa-42f1-9735-24d954ff2e57",
              },
              {
                id: "6be3167b-ae70-4b61-a3e3-e708718629ba",
              },
              {
                id: "801a083e-bbbb-414a-9a0b-2af4657e4263",
              },
              {
                id: "e2a275f2-80c2-45f4-bb3d-581d5f6280fd",
              },
              {
                id: "7c348caf-006e-4193-9743-14d62398f074",
              },
              {
                id: "26346ecb-5241-41cc-9c67-44bc4234e790",
              },
              {
                id: "70665b58-b958-4eca-9386-4b72f408c6c3",
              },
              {
                id: "7fbbaf3b-f414-4f6b-a2c0-c795b6d81d93",
              },
              {
                id: "08c35f22-3be7-47dd-bd58-d02f957e0164",
              },
              {
                id: "ed2602a0-3fcc-420b-aed8-57da77880143",
              },
              {
                id: "09765351-5591-4cab-b097-03aeb16bc0e6",
              },
              {
                id: "21dcc28b-57f8-455b-91bb-da9776e4836c",
              },
              {
                id: "e2cd64f0-bf65-4ae8-a48c-4a151718fc26",
              },
              {
                id: "1f94287b-828b-4983-813f-a468d6cb35d5",
              },
              {
                id: "655bdea7-37f2-4b69-aabd-5f94b779604e",
              },
              {
                id: "5e232801-917c-4c68-8e66-13eafbe0965b",
              },
              {
                id: "6ae18453-a09e-42e7-b8d5-679136bd98e6",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "ba19cc88-55b5-4922-ae01-8351618ad5bc",
            number: 84,
            volume: "18",
            language: "pt_br",
            pages: [
              {
                id: "b6751589-2d96-4cb0-b6c4-5cf411b56159",
              },
              {
                id: "958653ab-6d9d-4158-88ca-629c3f6bad93",
              },
              {
                id: "8c147572-47a2-4927-810a-e93f140fb27f",
              },
              {
                id: "cbd761ac-cfe5-48d2-89e1-272f8f006e03",
              },
              {
                id: "c0a1552d-03c1-440b-93aa-c60399dc7cbe",
              },
              {
                id: "e221a803-6a2a-4fca-9acb-7fa4eacff1f3",
              },
              {
                id: "67cfbc27-7f52-45c3-8c8f-2670a74486f5",
              },
              {
                id: "3b309108-133e-4f68-bc0a-e572c6c89266",
              },
              {
                id: "bec64b30-f708-47ed-93a9-f94e3859352b",
              },
              {
                id: "80797864-0d47-47dc-ad37-cd5884da75ae",
              },
              {
                id: "be58c279-613e-4a37-85ee-e17fd263aea5",
              },
              {
                id: "1d386153-276e-471e-96bf-a4c2ef6c104c",
              },
              {
                id: "97f0b604-36ee-4897-9351-87d43aa4911e",
              },
              {
                id: "182e4d11-732a-4d54-92dc-290d373751c8",
              },
              {
                id: "6efd96c7-7341-42c4-a786-429fa41b083d",
              },
              {
                id: "9bd3772e-1123-4316-aaec-318f9a47da26",
              },
              {
                id: "788ca679-cb9f-4b2b-bdc8-3b0e8d7ed9aa",
              },
              {
                id: "49dce427-8c25-4599-b86a-c6a3a660490a",
              },
              {
                id: "8bd5fa1e-2505-4380-8606-7b8faa30c695",
              },
              {
                id: "bae805b1-a03a-496b-8be6-de99d80abc83",
              },
              {
                id: "89d1f922-d7cd-4941-82af-d7d1d386d803",
              },
              {
                id: "5c9a86fe-d83e-426b-a55b-1205c9c42a61",
              },
              {
                id: "9786ae9e-05df-41d1-b76e-d683d1733f07",
              },
              {
                id: "16b94295-aa92-41dd-b17a-d943569355aa",
              },
              {
                id: "f7045c10-a430-431d-901f-f38db0d400e4",
              },
              {
                id: "51ba3152-7f9e-4b76-b2ba-6df20de7b217",
              },
              {
                id: "415fd233-0257-4da8-b43b-26719a2f4fcd",
              },
              {
                id: "05359640-f05c-41b6-b97a-cb7f435dde62",
              },
              {
                id: "9d12c21c-a31d-4e1d-9996-545ab3f907a9",
              },
              {
                id: "86db2a17-0863-49d8-8327-ea9bb24b5f42",
              },
              {
                id: "94d82e39-193a-44aa-a8d8-d2b0e1dc5d5b",
              },
              {
                id: "f38526a2-4430-4e31-bf6c-ce911c528c4f",
              },
              {
                id: "ee71a61b-ba6d-48f6-92e5-2b2362eab34b",
              },
              {
                id: "64381539-c6ba-49d6-b2dc-9b29476ba2a9",
              },
              {
                id: "02523c88-0e0b-4fec-9ded-267a23919f86",
              },
              {
                id: "e7c33cb3-002b-465d-81cb-b1b645212583",
              },
              {
                id: "c5328d13-2ec1-471b-9447-ad767713c5f6",
              },
              {
                id: "637a8a4a-0135-46eb-ba7b-bbfeb97bcde7",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "c77c3631-23e8-4e09-8a19-bfc7db14c7ae",
            number: 85,
            volume: "18",
            language: "pt_br",
            pages: [
              {
                id: "876cae99-7221-49b3-8406-93497741dc8b",
              },
              {
                id: "17b12b0b-9c87-4897-bf3e-89f28668bb21",
              },
              {
                id: "9d3a7bd4-84ae-4820-992c-c0237e315ac2",
              },
              {
                id: "fcc5d4af-6512-471c-8c4a-a444475b948d",
              },
              {
                id: "f954d402-c625-492c-880f-3ffd73645180",
              },
              {
                id: "7265cb39-ece4-4efd-a1ba-01b5ff24b93d",
              },
              {
                id: "5dc47929-7715-4df0-bb71-829a89e9279c",
              },
              {
                id: "d721f9d0-0f7e-46fc-a6b8-bc629fd4c5d0",
              },
              {
                id: "7c80042b-f34f-4f7f-91f6-bf511eb5f7da",
              },
              {
                id: "c49374c0-8ebe-47eb-a2ab-7436ac85afe0",
              },
              {
                id: "08e9f68b-a321-4612-aa14-0096a700033d",
              },
              {
                id: "63e40278-53a1-4447-a552-fddac1aa9eee",
              },
              {
                id: "45b39ac6-d582-4a1b-a29d-a1fe2bbe2b37",
              },
              {
                id: "b25af8ae-8172-4dee-8750-9332e07da43b",
              },
              {
                id: "18523ee4-900a-4d8c-985e-dceb5becf19b",
              },
              {
                id: "859e8a07-6fea-4abc-85a6-7e4c0f55cf97",
              },
              {
                id: "d4fe321e-4cba-499d-b1bc-db3cf46ebd7a",
              },
              {
                id: "67a75dfa-e10a-43ac-bad6-e0e1a9c9779c",
              },
              {
                id: "f134282f-cab9-4991-8b04-c52270ffe908",
              },
              {
                id: "50e73d15-e5cb-447f-8af7-913b4e209ed1",
              },
              {
                id: "1204850d-7034-4fca-9bec-1673654a1b1d",
              },
              {
                id: "02ea433d-c2ac-419d-ad8d-0b6018087e18",
              },
              {
                id: "8980a5ad-f784-414e-9bd2-b5c3be765779",
              },
              {
                id: "9f505074-dca7-4169-b8ba-073347548340",
              },
              {
                id: "e7b9ee54-1188-466f-ae7f-810a1023b9df",
              },
              {
                id: "2222dc5a-8db8-45ab-a1b1-92464cd6f7ba",
              },
              {
                id: "0c25ef77-e6dd-4e28-bd41-df3b1648bcd2",
              },
              {
                id: "399bb870-95a8-436c-bd8e-22ef149d03eb",
              },
              {
                id: "c5febbf3-0c05-4577-8aef-85132da2d196",
              },
              {
                id: "f5b7576f-3556-4ac5-b649-5541f2027b2e",
              },
              {
                id: "226b8ef5-740d-4f5a-9ebf-0ba72746719b",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "cc150a93-f595-455f-8e88-d64320eac62d",
            number: 86,
            volume: "18",
            language: "pt_br",
            pages: [
              {
                id: "f2401120-840b-45a9-9430-67d44f5cad49",
              },
              {
                id: "9b0a6305-542c-43c1-9f23-b2e36b48ffa9",
              },
              {
                id: "21737d48-50a8-4da0-96bf-a93333f62b3e",
              },
              {
                id: "b619d05b-22d4-4370-973f-b4331d5d8401",
              },
              {
                id: "399569c9-5896-4975-b10a-35cb808cf080",
              },
              {
                id: "6d487d77-bf93-4ba5-80a5-40d5d235dec9",
              },
              {
                id: "84b0e446-d2e4-4bd1-9737-8baa19174477",
              },
              {
                id: "cfd6f2a0-4b7b-45e1-b875-ef09e764f726",
              },
              {
                id: "85e32a9b-9b98-411f-bb7b-81785ed5aee3",
              },
              {
                id: "ab6b1065-a630-4e27-8d38-c664473950e0",
              },
              {
                id: "b590a015-92b1-4fd3-8aea-144d32fe1e19",
              },
              {
                id: "3e45122e-9b4d-4ef3-862e-8cc9e899650f",
              },
              {
                id: "98eb6fe4-c63d-47da-8347-87623d17942c",
              },
              {
                id: "8797bff1-b8a4-4ebf-8eff-0c0ef184898a",
              },
              {
                id: "d23b4bbd-1469-455c-a257-d37dacaa84b0",
              },
              {
                id: "39640064-8e8f-4263-8f59-ab582ac88880",
              },
              {
                id: "5eff1052-fa5e-49e8-aa73-45e6deb1b619",
              },
              {
                id: "907f3a25-7d22-48ca-a4bb-207ee7199e40",
              },
              {
                id: "a4bb802a-dcb8-44f7-812c-dc96927c4692",
              },
              {
                id: "6ee44520-2ef2-4b47-a2e8-cb7437971480",
              },
              {
                id: "5c4724b4-46b6-4bc0-979a-832d39d3569a",
              },
              {
                id: "40e83af1-ef69-473f-8257-f1686d37485b",
              },
              {
                id: "152800a5-12b0-4bc3-b256-fba70212004f",
              },
              {
                id: "6b3bcbcf-66fa-4b0f-b406-e59a1fdb9d91",
              },
              {
                id: "715309b3-4b00-4034-9a98-39bc1e6190d7",
              },
              {
                id: "2fec6be9-67b0-401d-a888-f12ed0fee016",
              },
              {
                id: "f71a4b94-76eb-4cd0-9ced-9033725d5822",
              },
              {
                id: "7d7b6f58-16a2-490d-8caa-78e801a5467b",
              },
              {
                id: "d8c0761e-c03d-4b24-8143-da66defbabfc",
              },
              {
                id: "a7f3b606-ea43-4a6b-9275-291954e1e84f",
              },
              {
                id: "46e6097d-a628-4346-8ebe-729343c51dca",
              },
              {
                id: "dec9639d-1b11-4db2-8b48-28c816df5197",
              },
              {
                id: "48a395fe-2815-46d4-bb7c-4ce2c0d91cbe",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "d1258292-54e8-429f-bd0a-57952da8fc1c",
            number: 87,
            volume: "18",
            language: "pt_br",
            pages: [
              {
                id: "5e940fb1-27a3-4324-8f62-967a5f03d9f4",
              },
              {
                id: "dc4ee9ba-1518-4d21-994e-9ab752df28b9",
              },
              {
                id: "de3bf584-cfef-4074-b329-e3aa376ff338",
              },
              {
                id: "ab8f5aef-66d6-4b5b-bd88-f73155a39401",
              },
              {
                id: "9807c229-f7b8-43a5-93af-ecba7392297e",
              },
              {
                id: "f0f5ab39-273a-40af-acfa-8c3686bb8ba6",
              },
              {
                id: "732f1af3-c91b-489a-8c41-adb57a7b6a36",
              },
              {
                id: "0b8bf2f4-6444-4fea-8c88-eb4e60ce10de",
              },
              {
                id: "4623c063-98a7-42f2-a40b-8700163372a7",
              },
              {
                id: "f373dddb-5ef0-464c-9945-563494049b27",
              },
              {
                id: "5f8b35ea-3efd-48c2-a990-203c94fdb040",
              },
              {
                id: "33d4b378-9bb9-44ea-9980-c691409eb2a5",
              },
              {
                id: "66a7bb47-39f6-45a2-a6e8-145b7bd43fa4",
              },
              {
                id: "19d8ad04-73c0-4cb1-a581-bcaf7286748f",
              },
              {
                id: "656b9902-a055-49ea-8c1d-bfac593b4108",
              },
              {
                id: "c9d8cdd3-851f-4944-b14c-8a8f0a7e05df",
              },
              {
                id: "f4d5b455-c9df-4b07-8b84-a400b69167a4",
              },
              {
                id: "323d59eb-589d-43af-80d1-7aa97e19f24e",
              },
              {
                id: "7b1a2a1c-d11a-4b85-bbfe-3aefc53a24be",
              },
              {
                id: "ae5e2560-854b-467c-ba10-672e793aa81f",
              },
              {
                id: "0f2e3e01-9c16-460c-b1da-b0e2b3f181e7",
              },
              {
                id: "c299c20a-5527-44d5-acd5-254bd3d64cd9",
              },
              {
                id: "926e19ae-391f-4ecc-a2fb-f3aa3030dc91",
              },
              {
                id: "dd47869e-d1a3-417a-87a0-5a8f5f74a37d",
              },
              {
                id: "0ea3430e-8081-4b0d-94fe-eba42b2dd6ec",
              },
              {
                id: "18272a11-06f8-46d9-97e9-7272cf3739de",
              },
              {
                id: "7203d04a-ca3d-4bf2-911f-8570ce478a8a",
              },
              {
                id: "d6a899d7-6443-47a5-a3cc-7923d59c0928",
              },
              {
                id: "ca3798ea-1d5e-404d-ba61-02afc4fd546d",
              },
              {
                id: "5b575d47-2426-462f-a557-4a0ccf18764d",
              },
              {
                id: "41ab6df9-7381-47a2-bb7d-c0fc14f85be7",
              },
              {
                id: "1c1c0794-2340-452c-b8fa-41eb23400411",
              },
              {
                id: "c07527ff-bda7-4de9-841f-b8db792ef1f0",
              },
              {
                id: "12697888-9df9-4224-a5d1-daea2acc13e8",
              },
              {
                id: "5d310782-9c6b-4f0b-a735-608a2d5be624",
              },
              {
                id: "fd81c338-5730-4200-9d9b-7266791a2663",
              },
              {
                id: "21ebafef-075a-493e-97f2-8c5abea1e0cb",
              },
              {
                id: "a08963f3-6e8b-4425-95b8-9200e84eec4d",
              },
              {
                id: "f3ed2715-cac8-4da9-9774-3ef9c2175544",
              },
              {
                id: "3680cb48-9f7e-42ca-a1c6-6b827d5cf1f5",
              },
              {
                id: "5a67d6aa-b6cb-4c4a-820c-3418eaa59ad5",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "93f7d982-5a2c-4045-8cdf-1d1b98bb9aff",
            number: 88,
            volume: "18",
            language: "pt_br",
            pages: [
              {
                id: "27def316-10e6-4053-ad22-192b1255df5b",
              },
              {
                id: "d0f22628-a490-40b2-8ed3-75d2ade5c93f",
              },
              {
                id: "dc6baaa9-6358-4d04-b38a-9dfdb24ba7ce",
              },
              {
                id: "4d53b7be-c846-40a0-a136-e75400fb255f",
              },
              {
                id: "d63b44a5-5771-4d28-8d21-3c6b7bd41c55",
              },
              {
                id: "38145c7a-6059-4745-b3a8-e334e727d026",
              },
              {
                id: "0f1b4971-024d-4da4-b2ed-1867858d0112",
              },
              {
                id: "c19feeab-c432-4cc8-9396-f30adff556d0",
              },
              {
                id: "076bf1a5-da69-461e-b7ba-85865c5215d0",
              },
              {
                id: "410aecb0-b6cc-41c3-82ee-6093b65b51e8",
              },
              {
                id: "b6b002cd-8bdc-4b06-ac12-4bd408bae14c",
              },
              {
                id: "1218ad3c-2e5b-4b12-8e07-7ac23057dba8",
              },
              {
                id: "7282052b-14a7-43b5-8872-6b522eed8435",
              },
              {
                id: "578b58b8-d4b6-44bb-a7a6-aa7d17c9828e",
              },
              {
                id: "1eee2a15-95b9-4b52-816e-26459835ad45",
              },
              {
                id: "b85d4b76-6825-4cc8-af2c-e4a1cc45da92",
              },
              {
                id: "e20618e9-1f51-457a-b563-4dae2f6a6337",
              },
              {
                id: "9aefa7dc-1fbc-47cf-adf1-3b7f4e3675d3",
              },
              {
                id: "acde48d5-c75d-4ddd-ad78-bf0c2c71d643",
              },
              {
                id: "ce5d04a4-6cb2-4281-a945-54d1d3c0c53c",
              },
              {
                id: "5573300f-b87f-4cf3-9fc8-b96030ae2450",
              },
              {
                id: "a2ab926c-49e5-428c-ab2b-3397fd63c454",
              },
              {
                id: "345b5505-b584-4d5e-8f29-8c25358c0c00",
              },
              {
                id: "f012d30a-3331-4182-bfb6-f1ecb524e837",
              },
              {
                id: "6f14648d-94e1-4c4d-8816-478dca8d2297",
              },
              {
                id: "8a92fe35-f5bf-45dd-a8ed-1b3e6f739337",
              },
              {
                id: "ae29f62b-893e-4a44-a845-b6c10bcaa02d",
              },
              {
                id: "20cac10c-8ffd-4b24-a24c-1847a86c5df3",
              },
              {
                id: "8c96797b-0e96-417d-b17b-9f43106c8612",
              },
              {
                id: "b9e85b62-4676-4fcd-817c-4d5e3ff3ee5e",
              },
              {
                id: "10b63e5d-aaef-4508-a14a-53c0c3cdc70e",
              },
              {
                id: "141b9350-3459-411a-801a-b02dc40bfd6c",
              },
              {
                id: "beab877e-0dba-4709-a4a7-f801d84e6191",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "0e264c21-6d18-49d0-8480-52cf66a75025",
            number: 89,
            volume: "19",
            language: "pt_br",
            pages: [
              {
                id: "3448d9f8-76fa-45cd-b826-85069f1856f9",
              },
              {
                id: "f5451f14-0788-4c20-a956-1a8e89cdca25",
              },
              {
                id: "95cbd45c-2ff9-4881-a991-89b047f0c665",
              },
              {
                id: "89917329-83b2-4081-be3f-203da7363144",
              },
              {
                id: "c503f7a5-7afa-4092-a7d6-b52671f7b68c",
              },
              {
                id: "38b85a55-c889-4bda-bf0a-acbd2ea16aed",
              },
              {
                id: "616667ee-cfbe-4081-b9be-b9cf8baa4d11",
              },
              {
                id: "165d9fa4-34af-4406-a8ef-667bdb79e4ff",
              },
              {
                id: "1e3d8e4c-6c1a-4928-8677-ba8de038baa6",
              },
              {
                id: "fa17403f-f462-4b5e-a1b8-8fbf1e93ead2",
              },
              {
                id: "3f6f7975-8ff9-469f-a2cf-745d32666d64",
              },
              {
                id: "cfd16e8a-174d-4024-b047-78ab7f586870",
              },
              {
                id: "fb6d533c-ee28-4384-9e48-6006dbc33420",
              },
              {
                id: "a7bd0eca-1acb-4862-bcf7-32243765787c",
              },
              {
                id: "ff433042-f32c-4d27-ad1b-8a60c949bc6a",
              },
              {
                id: "b6108741-654f-4f15-bba4-0f50f53395d7",
              },
              {
                id: "107d3073-4a12-4b0f-9e69-ffd563250dda",
              },
              {
                id: "d4eac3cf-0b87-4b97-94b1-a89c94af2411",
              },
              {
                id: "e5019fa1-72c1-4eb6-a1a2-17f03fdef823",
              },
              {
                id: "34a44bc8-b199-45cb-909c-c11fab0a75b9",
              },
              {
                id: "d24ed295-1a58-4417-a059-a75b89f22051",
              },
              {
                id: "0a6b76ed-28ee-4906-954d-8a679b5f9ee3",
              },
              {
                id: "d4583208-7a5f-43a0-85fd-d271f440c40b",
              },
              {
                id: "85415d17-f50e-44ad-9364-9cfb0fbef96d",
              },
              {
                id: "6e035256-dcbd-414f-ae94-f91ec8a7f558",
              },
              {
                id: "de5c08b3-3b3a-4916-966f-b05e3ce63b09",
              },
              {
                id: "169d1be8-4fb4-4bce-9868-9d2004fcaeae",
              },
              {
                id: "9fd1e088-33d9-4c79-8c21-22a844f19473",
              },
              {
                id: "3c8e66ad-c408-44f1-b720-abebe527e88e",
              },
              {
                id: "ca35d401-8a35-4fd4-9bfc-f3e16b50b39d",
              },
              {
                id: "b272de49-9d70-4fbb-9973-c5ba88d16663",
              },
              {
                id: "21823446-66f3-4db0-9023-3a61911aff6b",
              },
              {
                id: "8528a1ff-f6c6-42d7-bfd5-d6810c85070c",
              },
              {
                id: "3329c87b-819d-49d4-9e9b-90eeac503675",
              },
              {
                id: "58af05c1-a791-4045-b387-ae4729d1b1f2",
              },
              {
                id: "aaf6ca81-2d00-4f35-bbf0-7672a21eff08",
              },
              {
                id: "5703c0c3-2450-487f-ae2f-d8831299504a",
              },
              {
                id: "4b21ac41-4099-419d-9dba-ef568cb3345d",
              },
              {
                id: "5a9f0e92-48cb-449f-bec5-346bc65d2aff",
              },
              {
                id: "cdf86cb8-e7ba-44a6-9367-372b46328a30",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "bacc20cf-7d79-4287-a86f-ff3bc68029db",
            number: 90,
            volume: "19",
            language: "pt_br",
            pages: [
              {
                id: "9aaa254a-c40c-43f6-a3ad-3ef598d28d36",
              },
              {
                id: "8bf56427-07e3-45b0-88d3-e1c0952bed17",
              },
              {
                id: "d84bc28b-bbf0-4665-9ae9-8efc8b73757d",
              },
              {
                id: "f84b2aa4-19a0-41f6-9d09-6a2a5673455d",
              },
              {
                id: "c103762b-82d4-4212-9822-247dcecc34b9",
              },
              {
                id: "2f73d5a2-8498-4ce6-a146-ad8108559ca1",
              },
              {
                id: "ab0bbbb2-f9cc-4c3e-b2d7-0f0a3f4a3fa2",
              },
              {
                id: "9f3db4bd-95c6-49ec-bfc6-bef4ca2eeb94",
              },
              {
                id: "6c106fb6-3612-4d51-b00b-606ebc291a1f",
              },
              {
                id: "d18d04b7-c143-44eb-a973-0ea02eadb3db",
              },
              {
                id: "57b92bd8-ccd2-4e79-a273-b143331c57da",
              },
              {
                id: "03f5a13d-5d8b-4c48-9c95-ce166d012365",
              },
              {
                id: "b671ec32-6bac-4bc9-b741-54fa4d039b0e",
              },
              {
                id: "62294457-f649-40c8-b77e-27977b435639",
              },
              {
                id: "c3fe00c5-c976-44f9-8d9f-16a976c70e9e",
              },
              {
                id: "e6b95fc2-f99f-4a68-9ebc-7c3e28a8e319",
              },
              {
                id: "9e211778-d56f-45f3-9dff-7cbba1f03341",
              },
              {
                id: "324538f4-d79c-4396-a885-4fad17513f66",
              },
              {
                id: "8aa14ccd-5648-4d21-be21-5f2afb3a3dc9",
              },
              {
                id: "c96ec887-9a7f-4066-aec8-cd9ee0a79158",
              },
              {
                id: "91f77d71-e7a9-401b-a379-f0d00dbff034",
              },
              {
                id: "e2878406-be80-4c62-8d28-5c2d027e711c",
              },
              {
                id: "048573d7-f3dc-4f33-9705-52f1bac8a766",
              },
              {
                id: "e527efe0-d91b-47b4-96b9-76f37b4b5f30",
              },
              {
                id: "d3278a25-7e9d-497a-92a4-edf4be214e06",
              },
              {
                id: "028d3d13-d0f6-426f-ab09-9e241479c7eb",
              },
              {
                id: "7e01f9ac-4472-4c7d-b7bc-0d3bd81e55b9",
              },
              {
                id: "a7ccdf97-2c29-47fb-8f7e-0d53ce0517f4",
              },
              {
                id: "7c99f12c-7445-4722-ba9b-6a0abbd52c16",
              },
              {
                id: "b91f985b-609e-4948-936c-9237479769c3",
              },
              {
                id: "2dfec173-81cd-4025-b7b6-5fdb9eeabf93",
              },
              {
                id: "1f20cfb7-1c84-4dbb-b77d-bdd8d60d6330",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "3e996a4c-e443-4a7e-a85b-0c9efb73e896",
            number: 91,
            volume: "19",
            language: "pt_br",
            pages: [
              {
                id: "daf8e1d8-40c8-409b-b522-8e1af1c9940f",
              },
              {
                id: "597f6d06-3ba2-48ab-adaa-73b190d7cd11",
              },
              {
                id: "3cd16045-e3e9-4e77-bfb1-bb8b864a9009",
              },
              {
                id: "f7137837-1c72-465e-a666-d22f0bc30434",
              },
              {
                id: "3b5fc15a-0c6e-4409-9fcf-ec89999ccf6a",
              },
              {
                id: "63629358-0d3e-4b4a-a425-53fe2f2b1af1",
              },
              {
                id: "62a0c810-3473-4809-81d4-829b141024c0",
              },
              {
                id: "6d5e6232-6243-43f0-86fe-641cabe6ba76",
              },
              {
                id: "33903ddd-ff14-4620-b419-1ba5356beeb7",
              },
              {
                id: "a89cec98-e18f-4a57-b638-488eed109055",
              },
              {
                id: "78ac613d-cc65-4321-b199-a736219c189c",
              },
              {
                id: "243da33f-e1ee-40cd-a051-23900debcf17",
              },
              {
                id: "7fcd89ee-adfb-49bf-b17f-34b577fd4692",
              },
              {
                id: "be1dc76f-b879-4bc0-9c01-ee1d195cf1a6",
              },
              {
                id: "23014d93-e221-4d5a-832f-b227d5e5ac3a",
              },
              {
                id: "54039970-cff6-419a-a929-4184f67f3b40",
              },
              {
                id: "43ba0a46-a1d6-472c-848d-a5a25d808293",
              },
              {
                id: "05dc2523-7c94-4706-96d9-f5e28961d0bd",
              },
              {
                id: "86e76874-48f1-4105-81c5-f21bc393134b",
              },
              {
                id: "f6d4da7a-2bac-461a-ab39-be3a41bcd14d",
              },
              {
                id: "0b536ea3-ee1c-4c6b-89ec-5818e0670979",
              },
              {
                id: "52651b96-b139-4272-888e-e4a7ca77f7b8",
              },
              {
                id: "e30f0afb-4f5d-4600-91b8-5f8cff1a616e",
              },
              {
                id: "34efd447-3455-497e-a8c1-0a388d8b20a9",
              },
              {
                id: "d4fe91b4-d545-46e0-bf90-d36827ade86b",
              },
              {
                id: "e7ef663e-2414-45b3-9b10-ecf04cbf36ec",
              },
              {
                id: "2a4d687a-d48d-4c6f-b1d1-45bb65044e1f",
              },
              {
                id: "524a1203-6fdc-4100-9be6-ac0a55f54eab",
              },
              {
                id: "2d8d48d3-73e0-47bb-b5cb-8fe9f7b15e25",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "a5e58a1e-4aba-4fa0-90aa-babddfa878f9",
            number: 92,
            volume: "19",
            language: "pt_br",
            pages: [
              {
                id: "c919bb00-208b-45ac-b8bf-6f6a70c5a196",
              },
              {
                id: "b0cedf17-7cc3-4c45-aa44-235f6afedb22",
              },
              {
                id: "1b72dc73-48b9-44f9-9136-489a9a8f19fc",
              },
              {
                id: "b80e7013-17d5-4548-bb57-3e0f73913cbe",
              },
              {
                id: "651a7f51-80fc-4f61-a138-5683e7b0e0ee",
              },
              {
                id: "74369e32-b22d-49b7-9b14-db77d7e60006",
              },
              {
                id: "b8748ed0-acee-48fb-b85a-84de997b42df",
              },
              {
                id: "3526d196-0ea3-4d41-ab9c-ffb147dd8f29",
              },
              {
                id: "0137ab0c-609d-4b9a-8f27-6d89dff4e6f8",
              },
              {
                id: "d32584fd-0a80-45f1-b4ef-2089845502d7",
              },
              {
                id: "5f7def70-187d-4ca6-8e78-8222efe5ab7f",
              },
              {
                id: "dec247a8-4ab4-4fe1-ae45-766c95d0d9dd",
              },
              {
                id: "23cf1ba9-32bb-486c-8d8d-d55eab33ceb0",
              },
              {
                id: "584ffc6a-e9e2-4d13-ab8c-a8bd01cfc817",
              },
              {
                id: "5b33e4d1-5fc1-49d0-897f-390d6bd172a8",
              },
              {
                id: "67df13b5-76dc-408c-b223-e4d96fa99f25",
              },
              {
                id: "cbfb9324-7ff0-44bb-b1a4-5bc9d7801c1f",
              },
              {
                id: "e51be464-102f-4118-bffb-5beeab7d548c",
              },
              {
                id: "a6b15622-5be2-4d91-a066-ac693824180a",
              },
              {
                id: "ccac3397-21aa-4d2d-bbed-b714293fec03",
              },
              {
                id: "25bf0801-466e-47b3-97d2-cb3dbf03c5cc",
              },
              {
                id: "ffaf3188-5f7d-4556-80c4-53765bc937a0",
              },
              {
                id: "05567e3c-9554-4336-9311-d1dbf18108a4",
              },
              {
                id: "b84ab165-c8dd-4dc1-89d6-c54f3d449ac7",
              },
              {
                id: "b138a78f-6051-4012-b746-882745213ac3",
              },
              {
                id: "9412f22d-f2f5-497c-abb0-5e9c489f1726",
              },
              {
                id: "9ca11bfe-5bcb-4c4b-b43e-c82556432d93",
              },
              {
                id: "0c2fbc44-f81b-4779-9050-fb5e073733f7",
              },
              {
                id: "d6a56290-782d-4006-bb00-be54f0d51a87",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "d0b93017-86a1-43aa-9f30-315d4d43699b",
            number: 93,
            volume: "19",
            language: "pt_br",
            pages: [
              {
                id: "2f1495e4-ddfe-496c-abb6-9c9d6b8e6e48",
              },
              {
                id: "60232567-7e92-41db-b0c5-896938075daf",
              },
              {
                id: "6bf24475-d643-45ef-8e04-23eaae476c48",
              },
              {
                id: "73afb01c-85a6-477a-83e2-462b1e24b79d",
              },
              {
                id: "d0100224-c3d5-4bd8-9259-541cc25e1c67",
              },
              {
                id: "13665e8f-4915-4d93-ba30-4bc288c1060f",
              },
              {
                id: "7ee2adb6-6074-4f28-be9c-22abbc6d58d0",
              },
              {
                id: "655b3129-f75b-4d4d-83c5-58530d1c5c8b",
              },
              {
                id: "1a77873c-d3c0-466c-8ab4-7036f9108cf2",
              },
              {
                id: "b012aef4-ab14-4fe7-bbfc-0b0c15296f03",
              },
              {
                id: "eb5ab15b-dd4b-4768-a93c-10307a9e11a8",
              },
              {
                id: "e153ddec-ca08-4419-9912-b36ea772995e",
              },
              {
                id: "7138658b-15a0-41a0-8a9c-04b2d734dc34",
              },
              {
                id: "41a78355-d25b-4ae7-ba07-46f29fdec4af",
              },
              {
                id: "5f858cef-536d-4805-969e-9bc4a6df9a42",
              },
              {
                id: "1164d9d2-c88e-439d-a8b7-0cbc149ee17c",
              },
              {
                id: "8901705e-b132-4c2b-a25c-bce9a105d58c",
              },
              {
                id: "77830076-0f1c-4e74-8beb-d273c3e5bd77",
              },
              {
                id: "b6456a7f-c46f-4556-abb1-b0d1ea13047c",
              },
              {
                id: "2e9dc508-a0ba-41a1-ae9e-945ab820d184",
              },
              {
                id: "66065345-fb94-44a9-bda7-e4e71ee35a9c",
              },
              {
                id: "52d573dc-0fc2-4327-9b72-0119f2b907b1",
              },
              {
                id: "947bbe54-0b1b-4376-a33f-9b297fb5d710",
              },
              {
                id: "3e787b1b-c128-4b9a-88c3-04dbd2c66428",
              },
              {
                id: "d996f7f3-3313-4c55-b551-8666a3fc0d18",
              },
              {
                id: "1cb01b6b-4fb0-4532-9a17-c928bac138c0",
              },
              {
                id: "076d8309-f3a4-4d61-9ddb-c882d85973a3",
              },
              {
                id: "cb45cca1-4343-45b0-a46a-88ee908962fb",
              },
              {
                id: "c87344f9-5f3e-438f-9a56-5d1e13e50b11",
              },
              {
                id: "185621b4-d936-4b0c-b896-3524c43711e7",
              },
              {
                id: "bd3a9770-4158-4555-a2bd-969bc801f307",
              },
              {
                id: "e478460e-a8a1-43bd-9439-1b8e8842c634",
              },
              {
                id: "d1625c9a-8528-4718-91ed-38d9cf5d8556",
              },
              {
                id: "e2e6a386-86ea-4346-9125-17f08f0febc4",
              },
              {
                id: "877cd19b-2cac-4eb5-8610-66f50e226761",
              },
              {
                id: "06c98be9-15a0-4e91-b345-5e2a692563df",
              },
              {
                id: "c541bbe2-9097-41a6-b15f-1dd3b916f48c",
              },
              {
                id: "6d9e120b-2a62-4516-8cf8-4259c322d62a",
              },
              {
                id: "158d3e03-9e8e-4811-94d0-d6f01ee65a11",
              },
              {
                id: "29e6fcd1-be8c-4ae7-82a5-085d1148570b",
              },
              {
                id: "f2dfb04a-325d-4b71-89ac-46cda2aac4c7",
              },
              {
                id: "c5574210-cd46-4c86-8fc7-550aa66433ef",
              },
              {
                id: "a19a5b0a-0539-4bb9-9e66-209c178ad766",
              },
              {
                id: "77905f98-3261-4397-93a7-9e2f0e7d79a7",
              },
              {
                id: "5ea0f5de-c879-4df4-aedf-8bf2cd0d529e",
              },
              {
                id: "cdcfef94-8bdc-4e98-9cea-43cf8b76356b",
              },
              {
                id: "98f1a465-f449-43f6-9c6b-18f9cd1e3971",
              },
              {
                id: "293dd52b-c2fa-42fd-9db2-1a4e5a5d7d41",
              },
              {
                id: "7de4f554-f60c-4ca5-94fc-40fa38850af6",
              },
              {
                id: "e2dd7b62-9051-4a5d-bf3c-d1db9fdc027e",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "a27fb05e-f819-4e09-bf71-d21a88a4b0a5",
            number: 93.5,
            volume: "19",
            language: "pt_br",
            pages: [
              {
                id: "52d4bc21-7fba-40d6-a883-078d8b3dab2f",
              },
              {
                id: "f2ae2917-b186-4d6a-b1c5-02aae9f10ca2",
              },
              {
                id: "ee8c59a3-0831-4dbe-ba5a-f8e2fd3da2df",
              },
              {
                id: "89d94272-3a6f-46c4-8ab4-4fa8299a9e78",
              },
              {
                id: "b2702412-84a6-4777-b409-3d31c549e327",
              },
              {
                id: "20166c02-9073-4f1c-a90e-40e2afabd4bc",
              },
              {
                id: "d163513e-4d4d-4904-96eb-5acfe8e94708",
              },
              {
                id: "ce5f0a35-0ad7-4d19-b4e0-da132649dadd",
              },
              {
                id: "3ea083ba-fef5-4538-b22e-dd6f83e85fba",
              },
              {
                id: "0b0c3d74-1cec-4c71-9b45-5dbe9b61a03b",
              },
              {
                id: "5c64e4a1-2e1e-42b0-83c5-563aefe8f3fa",
              },
              {
                id: "44b48788-9934-4c7a-a1ff-6c0df86fa9ee",
              },
              {
                id: "9b9a6cff-0271-4eaf-8c38-20714251335f",
              },
              {
                id: "de75eb14-00de-4981-80ed-6eedf615431e",
              },
              {
                id: "c488511e-8dc8-4eda-9b8b-9b71d6f34633",
              },
              {
                id: "a6336284-d8f1-471c-84be-629ef5186714",
              },
              {
                id: "656df1ee-c23c-4307-817e-556d28d1f82f",
              },
              {
                id: "14f724d4-bb9d-46d7-8bf4-06958270d81a",
              },
              {
                id: "83d500b0-ac9d-4a0a-8854-e234f6462118",
              },
              {
                id: "a2428335-94f5-4eed-bbab-ef8074ada1db",
              },
              {
                id: "2b575904-1581-4d06-97ff-e57cf335a752",
              },
              {
                id: "a9d1755a-e591-4d30-afbe-bc5be1c2d175",
              },
              {
                id: "804a4724-f413-4451-b0bf-d4732f36fc82",
              },
              {
                id: "410e7ab3-4eeb-4382-8ac4-670c2c3e6a6b",
              },
              {
                id: "e75661ca-1082-4093-a751-e2c115ccc9ba",
              },
              {
                id: "8de2ff42-5d4e-410f-beb0-9fa97befb70b",
              },
              {
                id: "f16b711e-e2a1-4587-b34a-3f6bac8c8862",
              },
              {
                id: "17f266f3-800e-4e5a-afc5-0cee04f3c89a",
              },
              {
                id: "dcde816c-cf38-4fbe-9a4e-a388c7ef9149",
              },
              {
                id: "974025b1-c62e-4459-b44e-46ace0c2d377",
              },
              {
                id: "04407e38-70a0-499e-b8db-713564beed57",
              },
              {
                id: "b0721d70-a4e2-4dd3-b8a8-a97777bcc170",
              },
              {
                id: "5232ba68-ed6e-408b-a0b1-5e3d04300627",
              },
              {
                id: "33901514-6821-46c2-b123-f7cc4b1acfb5",
              },
              {
                id: "d65b5c6c-1815-4de3-96f0-a7b127ccc681",
              },
              {
                id: "cac42f78-22df-4930-8099-a0754fd1d426",
              },
              {
                id: "fbb45399-cfe8-4daa-9f02-c77dcc43ac08",
              },
              {
                id: "469bc9e2-8e8e-48e2-a837-f8987e485024",
              },
              {
                id: "69603c64-01dd-44b9-8e20-e1f712bdca0d",
              },
              {
                id: "a1b7758e-23bb-49eb-a004-21f9630f9e53",
              },
              {
                id: "d9cf01db-76c6-4cdd-8a2d-4553c53f1fc3",
              },
              {
                id: "e18cbd17-2ecc-4ed3-a356-3c8ed3f913e1",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "df2df81e-a4ac-4af3-910f-10cb29ef9236" },
                  create: {
                    id: "df2df81e-a4ac-4af3-910f-10cb29ef9236",
                    name: "Chrono Scans",
                    description: null,
                    website: "http://www.chrono.com.br/",
                    email: null,
                    discord: null,
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
        ],
      },
    },
  })
}

export default { execute }
