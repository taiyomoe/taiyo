import type { PrismaClient } from "@taiyomoe/db"

const execute = async (db: PrismaClient) => {
  await db.media.create({
    data: {
      id: "254abda2-11ab-4a39-bc7f-ea6f4b72cfee",
      synopsis: {
        en: "The conclusion of the Feng Shen Ji series.",
      },
      contentRating: "NORMAL",
      tags: [
        { key: "HISTORICAL", isSpoiler: false },
        { key: "ACTION", isSpoiler: false },
        { key: "ROMANCE", isSpoiler: false },
        { key: "MARTIAL_ARTS", isSpoiler: false },
        { key: "ADVENTURE", isSpoiler: false },
        { key: "DRAMA", isSpoiler: false },
        { key: "HORROR", isSpoiler: false },
        { key: "FANTASY", isSpoiler: false },
        { key: "SUPERNATURAL", isSpoiler: false },
        { key: "TRAGEDY", isSpoiler: false },
      ],
      type: "MANGA",
      status: "FINISHED",
      source: "ORIGINAL",
      demography: "SHOUNEN",
      countryOfOrigin: "JAPAN",
      links: {
        mangaDex: "8efedcc7-dc18-417a-a32d-a37e111ddb6a",
        mangaUpdates: "https://www.mangaupdates.com/series.html?id=ygzojjg",
      },
      creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
      titles: {
        create: [
          {
            title: "Feng Shen Ji III",
            language: "en",
            priority: 1,
            isMainTitle: true,
            creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            title: "The Legend and the Hero III",
            language: "en",
            priority: 2,
            isMainTitle: false,
            creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            title: "Легенды и Герои 3",
            language: "ru",
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
                where: { id: "e4cda019-4b55-4623-97b4-1cef10f95ebb" },
                create: {
                  id: "e4cda019-4b55-4623-97b4-1cef10f95ebb",
                  name: "Cheng Kin Wo",
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
                where: { id: "a68bfaec-bea8-44bf-9fc6-20fbfd890a58" },
                create: {
                  id: "a68bfaec-bea8-44bf-9fc6-20fbfd890a58",
                  name: "Tang Chi Fai",
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
            id: "4ccb110e-2bcb-481a-bf9b-134e1ea96206",
            volume: "38",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "f415c7d4-fc91-4502-8ea9-bd526b921f2c",
            volume: "8",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "2d147787-f0df-4577-9ba6-0984694a57ad",
            volume: "56",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "b9d81db2-eb6d-4d41-9d08-11ffd8623dfa",
            volume: "40",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "bc4f08d7-e829-40db-842b-b30e67bab2d8",
            volume: "33",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "f1c6f10a-18a5-4601-9c68-c5ed1e9e727c",
            volume: "11",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "362808d6-10a6-462d-bb33-abd19dc316b8",
            volume: "52",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "2ecc8993-bb7b-4f41-a1a3-4eb93f196fa7",
            volume: "48",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "ef387f7e-2ad4-419c-b7a4-3c3db459929a",
            volume: "55",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "d6220296-6953-4665-8099-1086fdf2a718",
            volume: "18",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "93d18059-b652-471d-92e2-b9a74c5a750f",
            volume: "46",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "d921aa96-d374-4fc3-a729-4b11866ffac9",
            volume: "22",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "89699d8f-a018-481d-abb3-ab7694ec3f5a",
            volume: "31",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "5b6acbb1-7e64-4992-b2c3-274ba2bda97d",
            volume: "28",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "6f53f3b9-db95-4be6-8f6c-155338ece063",
            volume: "32",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "1cf71f8a-40f4-4ee3-93d0-206f0ca7cb46",
            volume: "16.17",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "32e2551a-691a-44f3-949f-ad882c67eaf9",
            volume: "72",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "93d9a856-397d-42dc-b3c3-11ff9ac17ab0",
            volume: "27",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "77836670-690e-438d-9813-4941db8f4caf",
            volume: "41",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "33e6a094-2456-4998-ac8b-926f4d0595c2",
            volume: "50",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "9a3782fe-a0a3-47d7-b8f6-cb6ce7290d5c",
            volume: "14",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "f2ad5767-7377-404d-9c0f-ae89de6a8f32",
            volume: "53",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "86c50e92-0498-487a-bd06-0aa92d9b2e36",
            volume: "6",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "3c7d1776-7af6-4517-b092-a8b10ad9108a",
            volume: "12",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "42d4fc0c-edac-4a59-8510-809869ef9e67",
            volume: "23",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "5d659e26-e6de-4390-8aa6-e56742e5d553",
            volume: "39",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "eaabced4-e48f-49fe-8a9e-55698ce537c5",
            volume: "24",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "ee3f92fa-87d9-47e3-b063-5bd7efc17587",
            volume: "13",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "b4afb5f0-6dea-48de-a45d-7512877b4431",
            volume: "25",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "358f31e4-63f6-4238-aff9-2c697a50304d",
            volume: "42",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "35d12564-700d-4868-b78a-e06bc09239f7",
            volume: "21",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "2889d1a3-2987-4b62-97d2-c0ddd433ec89",
            volume: "45",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "2e6a267d-f6e5-44d1-8893-f3b86eac42be",
            volume: "9",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "f22e1f8c-9fa7-481d-bf16-c49594e29bdd",
            volume: "60",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "89751b32-990f-4420-9d58-b422ae0b77b4",
            volume: "77",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "f9230d2c-4b15-451f-be9e-94630dd10a81",
            volume: "65",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "7f43030a-99e3-44aa-96b3-ccc13c49015c",
            volume: "15",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "6721dd34-7cd3-4694-8e43-e3adf2cf3114",
            volume: "7",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "9dee292a-e884-42ff-bf95-0949fcdbf375",
            volume: "59",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "81577458-3c16-43ea-a59c-e733bff4ca66",
            volume: "20",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "b33811c4-ee38-49d1-b2a5-720fe55aca49",
            volume: "34",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "cafa34d7-d389-4231-b4a1-4a49482cc68e",
            volume: "35",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "82a76cdb-1605-410a-b0a5-8f14aad0c5e7",
            volume: "44",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "e9e9db6b-96a9-4c8d-ae1c-0a87e5b7b5fe",
            volume: "26",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "e0d08b7f-d2a7-49e0-9dab-536e35e674f8",
            volume: "5",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "5b2585de-ba80-4c55-896f-3ab784d511c8",
            volume: "64",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "22fd8652-cd70-4b7c-bfcf-6b8ea90ee855",
            volume: "19",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "10dded1e-3cd5-4cb8-9ac9-50358e1b543d",
            volume: "30",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "4dac87ee-6793-420a-9eba-dba43e770dbf",
            volume: "54",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "049e2c14-c1b3-4426-81a1-1972e8b025e5",
            volume: "66.67",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "51cd588c-4f09-4877-b6dc-e0c433d9fffc",
            volume: "49",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "c671dee0-72f8-47af-8072-33874869d627",
            volume: "74",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "445dc329-d0ec-47e9-9e24-cbcbf4d36f7f",
            volume: "51",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "df953320-82e7-4cde-a47c-e1b1a27ee70e",
            volume: "3",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "2ad2194e-61f8-4003-ae1f-0fde004550ca",
            volume: "36",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "3b034464-a161-42ef-b2a5-7d969e5c4d29",
            volume: "47",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "4901889f-7409-4335-815f-6fc26ede6f95",
            volume: "1",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "5abaacab-8dc6-48aa-acc8-f02a72d962c1",
            volume: "63",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "980e3753-9938-44cf-af2d-5fbf68e857db",
            volume: "61",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "d6e1043d-5367-4ee9-9457-22acd87a909b",
            volume: "4",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "dc307c48-d108-4c75-a496-8186225bd6a6",
            volume: "62",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "c720ce24-c02b-4949-b524-2d62b9aebc99",
            volume: "10",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "d81e2a29-c4ae-46d4-8cda-e0659bfb9f25",
            volume: "58",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "1060ac3c-f0d9-40c6-a40c-dbc33f5d7ce7",
            volume: "73",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "205c9788-05ce-4c20-971c-d7630d593c36",
            volume: "2",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "fb3f55cb-4afe-4046-820d-aa57b606eeea",
            volume: "80",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: true,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "a624258a-1f25-41ce-a376-c8ccb7fec94e",
            volume: "70",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "53eceb57-2348-4eda-80cf-e610397bb64a",
            volume: "75",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "b4bb195a-bc68-4d2e-821b-de09d6a09662",
            volume: "79",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "eb91b491-05c6-44cb-88d7-e1fc58128448",
            volume: "71",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "dd80351d-5d6e-4e90-b755-25e7ef6ac2eb",
            volume: "68",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "8a70b421-bef2-4699-bc29-94f32e08d791",
            volume: "29",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "ba6c45d8-86df-4e7c-87e2-332c5411806f",
            volume: "37",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "0bf5922e-c692-41c3-824e-f4721a0e4a66",
            volume: "76",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "49643e89-3356-4cb0-bb58-7e9d7bfadd6a",
            volume: "43",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "e46a00a5-2a9f-4d8d-a85f-26ba1414553f",
            volume: "78",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "204b38c6-2b48-4417-94d8-9de65a16554d",
            volume: "69",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
          {
            id: "c22d40b5-a66a-435c-8daa-e7cb1361c4d4",
            volume: "57",
            language: "zh_hk",
            contentRating: "NORMAL",
            isMainCover: false,
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
          },
        ],
      },
      chapters: {
        create: [
          {
            id: "05fdb5dc-e4dd-40d0-b30b-d68e5d8662dd",
            number: 1,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "db439536-04fd-49f7-bec8-3e89c0a10ea1",
              },
              {
                id: "4c2486be-ca58-4632-9de5-4e2c33e01a15",
              },
              {
                id: "896f7168-d87b-427c-a9cc-49cd894d40eb",
              },
              {
                id: "7fcb6b67-4289-48cc-8348-1d1e7e6a1a5d",
              },
              {
                id: "67825e6f-0394-4792-9a0e-40fbf3dbd169",
              },
              {
                id: "ba60da83-8720-426e-9038-a12884f49b76",
              },
              {
                id: "02341268-7a88-4846-908b-7bb4ee9fbbe3",
              },
              {
                id: "fc0eb931-c9ea-4b23-9ca4-79e702ce686d",
              },
              {
                id: "ba75f8ad-e9c3-4f42-9ae9-1909d4359978",
              },
              {
                id: "179fc566-bcef-498a-8092-6d5538517e33",
              },
              {
                id: "5cc3acec-1d5e-47e9-9459-cee30267e4d3",
              },
              {
                id: "270741bb-e9d7-4d28-9126-31be1b2b36f7",
              },
              {
                id: "f25d4613-826c-4456-bcac-e045faa53b39",
              },
              {
                id: "ea58d685-0d3d-404d-bb6b-0764b1b888da",
              },
              {
                id: "1291a618-f435-4f38-be14-6a2cce328bd0",
              },
              {
                id: "ec5b393c-6411-4de4-92fb-100d40b7fb09",
              },
              {
                id: "47a6cee0-7b20-44f1-8c98-b3092471637f",
              },
              {
                id: "785df14d-d033-4fdc-9af6-8e5e66baa5b5",
              },
              {
                id: "1fe95d56-a392-4b28-82e4-d4bdbf1b0fdf",
              },
              {
                id: "e846169b-e1fa-472e-8e56-7a606ba757a1",
              },
              {
                id: "fef7c9c0-4258-4e9f-ade9-c724103e95e7",
              },
              {
                id: "17ed997a-d0af-41aa-81fd-1020db26855e",
              },
              {
                id: "8e9c81fa-7f0f-429a-aaa1-ae9b66dbd73e",
              },
              {
                id: "d4df5bd9-e96b-432e-8203-872a9fceda63",
              },
              {
                id: "7ac5d0a4-19a4-4df4-a36b-8c481d6c3218",
              },
              {
                id: "0ded0406-cea5-4624-9d10-9a218e81f543",
              },
              {
                id: "f470404e-75d8-4ed9-8521-7dec6c37c8b2",
              },
              {
                id: "2caa29cf-6512-4db9-900d-665b884c7e93",
              },
              {
                id: "ab37a3ee-04f3-47e2-a2c1-3eb0e361f646",
              },
              {
                id: "365c3e44-9070-448e-ab40-f16e973bc16a",
              },
              {
                id: "8724d8fb-d625-4d51-b017-81af66c04c92",
              },
              {
                id: "93ee659d-ddf5-4dcb-8540-811fb56b9d14",
              },
              {
                id: "55cf03da-82b7-4b0d-abb7-72408e276593",
              },
              {
                id: "adaa5f4c-6f45-416a-af44-cf8ab8278310",
              },
              {
                id: "ad8e8b4a-5552-4abc-8f07-f9cfa5f12488",
              },
              {
                id: "d8dfa4f9-0691-437c-961a-cab0a7408c7d",
              },
              {
                id: "15f16f6a-fffe-4629-b8e5-db180b6407e0",
              },
              {
                id: "d740cf08-f13d-4f0f-a9e9-fd07e475559b",
              },
              {
                id: "d928cfb6-e730-4a07-a0e8-9376c704bca6",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "ddee9474-8303-4968-9729-ad33621f2a00",
            number: 2,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "4adf050c-bf2a-404f-b3ab-a18636165537",
              },
              {
                id: "db234789-d918-4239-9240-0377c93dd5fe",
              },
              {
                id: "1d8c9575-2819-4aee-98dd-3fb7736724d3",
              },
              {
                id: "53eb59a2-6112-4f3b-8c8c-e54546791dd1",
              },
              {
                id: "732788c4-d3a3-4d34-bda4-eb8474112e55",
              },
              {
                id: "0bf3bcbc-c3f8-438a-b88d-17f5833b6d2f",
              },
              {
                id: "ff60f837-b09d-455a-bce3-c74ca470d251",
              },
              {
                id: "048eadc9-3c77-4946-a828-e34d579b321e",
              },
              {
                id: "1c93cfc0-6be2-4ef4-b144-2e896cfe8f78",
              },
              {
                id: "78256000-e49c-4878-a866-b4e976a37641",
              },
              {
                id: "190cda99-e0f7-4a28-8c36-d75b050b4ebd",
              },
              {
                id: "d2c498a0-71db-4b97-8c0e-14610803f0d1",
              },
              {
                id: "78578e7b-6926-4294-a946-891a37e46e61",
              },
              {
                id: "e7a159c2-9acb-4f51-b48e-17f103b9b1a4",
              },
              {
                id: "afce6cb8-7243-4afa-90ba-c6a9879a15e5",
              },
              {
                id: "5457cd31-f933-46c1-8761-b17b5d19f602",
              },
              {
                id: "b0ae45a8-09b0-4885-9abf-eea721f0f357",
              },
              {
                id: "f9569b3c-da55-4a10-8d05-acdd95d9a482",
              },
              {
                id: "7e546687-161c-485e-b9a9-847465564d95",
              },
              {
                id: "50da2154-caf5-4417-ac15-8ed2af7d8d1c",
              },
              {
                id: "1bfe4727-519b-4c85-b491-5a4f90944372",
              },
              {
                id: "cd6d7380-99a9-498b-952c-9b66aed8d1e8",
              },
              {
                id: "8ff870f0-8318-4419-8c5d-8b3ac0d22500",
              },
              {
                id: "abf0e9e5-beb5-4047-99ed-a674a822ed63",
              },
              {
                id: "8a3ab016-6d09-41cc-85e8-443f510c9b7f",
              },
              {
                id: "db713284-7834-46c8-9802-a92f6bf0e5c0",
              },
              {
                id: "ea0257f9-8a34-4e48-950a-987219824e6c",
              },
              {
                id: "e84a02f1-f939-4e02-88c5-22253323d95b",
              },
              {
                id: "502dce2e-2575-457b-ba82-1d131fcf666c",
              },
              {
                id: "03df6fbc-e7b4-4494-9d12-0786c25787ee",
              },
              {
                id: "a5fe4104-d9fb-4973-9161-6f3cb96f78e2",
              },
              {
                id: "835e36b4-f4ad-4cc9-813c-4be0f5705518",
              },
              {
                id: "5683d143-4aae-47ce-8e4f-707801f51a40",
              },
              {
                id: "03748b51-cbc2-426f-ad99-51b480030864",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "9e6a9fd3-b5a5-4c8c-9d29-8550fef69228",
            number: 3,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "70bc974b-2330-4002-a084-9a2deeac92ea",
              },
              {
                id: "a4047a2a-ba6a-4c86-98d4-ae3437f7ef02",
              },
              {
                id: "3756e54e-13ae-4c9d-9807-2f275ef4daab",
              },
              {
                id: "0af500b8-275a-4c2d-9cde-3d5b2ed32658",
              },
              {
                id: "c8b01f25-fc9b-40e1-9638-d9319fd5187f",
              },
              {
                id: "73c326c4-a691-453e-aeec-a6cd7a948ed5",
              },
              {
                id: "34048987-4a02-4e04-b0bc-ce12368acb41",
              },
              {
                id: "4b320dc1-3873-43fa-be7a-ae0e8b6c77f2",
              },
              {
                id: "2c4381bb-f24d-47b6-b681-b0e1c7bbc3f6",
              },
              {
                id: "4ecbee43-c567-4e03-b7e3-e67a1d36b091",
              },
              {
                id: "aa0690a3-b765-4f8e-869f-b08288563ef3",
              },
              {
                id: "ec7096e2-f5ea-425c-9c8b-6b342d49929c",
              },
              {
                id: "701abdc3-1b01-45b6-9cdb-405334fd1283",
              },
              {
                id: "a2b3e1c3-c13c-4640-8218-10a1aeb4880d",
              },
              {
                id: "91bd2e6c-51fe-4c7c-9067-f8f23a4242ed",
              },
              {
                id: "6286b3ef-4b68-40c0-8b42-220f0ac556ba",
              },
              {
                id: "b81f4dd1-7975-43d2-b447-a50ae60d1836",
              },
              {
                id: "a8220aab-3611-4cea-af6d-89862b317f28",
              },
              {
                id: "4365d23c-4b5a-4d03-ac58-6a6e6bb5ee86",
              },
              {
                id: "1c559c84-1b14-4db3-8869-d5ca6b99883f",
              },
              {
                id: "0a8c68c3-a6cb-45a1-980e-67628b4fed3e",
              },
              {
                id: "35bb0715-126d-4638-bb47-41ae4ef7b918",
              },
              {
                id: "27434546-5e8f-4daa-998b-704903f40ec3",
              },
              {
                id: "5c1d4a71-dde8-4859-93a6-2baf20577498",
              },
              {
                id: "683528c8-c155-4c34-ac7a-de19c400a855",
              },
              {
                id: "459b3e05-07e5-4272-845d-81e62092d4a0",
              },
              {
                id: "da27302d-10c1-4379-b824-bea0a6c0c91d",
              },
              {
                id: "74226b95-be75-4ac6-a92d-800655dfaaf8",
              },
              {
                id: "bb4738fe-7a51-45b5-9c3d-107f48e49103",
              },
              {
                id: "49763845-4188-4e17-af93-27e06c45ed70",
              },
              {
                id: "2d14056b-83ce-44e1-b594-d549e37f833e",
              },
              {
                id: "8a385173-4a11-4862-aaac-27d12bf24050",
              },
              {
                id: "7949dd94-fa94-4642-b7cf-4b891fb0f885",
              },
              {
                id: "d4348462-9fd1-4b88-a2ad-0414127c0869",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "04745162-fc7b-4464-8781-5ab5067159c9",
            number: 4,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "7379d103-c350-4744-88c8-80404a1f78dc",
              },
              {
                id: "683febc5-0d9c-43d8-8a58-e3b09c7c0eeb",
              },
              {
                id: "f6d8f098-1ae2-4f4c-9f54-a10870256149",
              },
              {
                id: "abadd0e8-be10-4f40-8128-24da84dd7ed1",
              },
              {
                id: "d98aff6a-68e1-4b55-aca1-478e3602e851",
              },
              {
                id: "c8b160f4-dbf2-4671-8f4d-6e45b83e2031",
              },
              {
                id: "a67c76ea-3004-45e0-8373-4e44887ae941",
              },
              {
                id: "32dc2a55-4965-4143-839a-8aeaa3a698d9",
              },
              {
                id: "644e9c3e-716a-4f0a-87e4-70a4fca1a2f0",
              },
              {
                id: "dc73840e-69de-4b9e-82f2-57541cdb68b5",
              },
              {
                id: "c675f586-05dc-47ea-9c48-42a51a263fd9",
              },
              {
                id: "f9f434e7-16e6-40b3-a46b-a5782b4d70f4",
              },
              {
                id: "0c466dc4-661f-4aeb-8296-5a550c9e4b3d",
              },
              {
                id: "42ac55c6-fa82-4162-953a-8eaba5608d94",
              },
              {
                id: "29f4eb08-28e5-4b57-bfff-e8780d024488",
              },
              {
                id: "cfdc4451-1eee-4157-a4a2-86037d029816",
              },
              {
                id: "501949ce-8f7f-4538-9d2f-8215be25d749",
              },
              {
                id: "47f16a94-42c1-40fe-af3d-f00e257c21bb",
              },
              {
                id: "08155865-1779-468e-bbf7-775d52577849",
              },
              {
                id: "067ea4fe-95b4-447a-95c3-ed881d5191ae",
              },
              {
                id: "279d8ae3-5ef4-4450-ad06-326a50a5227d",
              },
              {
                id: "bf18915f-d728-4e06-b5ba-5540f32f2d82",
              },
              {
                id: "adbb8519-1add-4644-9b75-ed9eb0a5d03b",
              },
              {
                id: "dcea362a-5d2f-44ca-8426-d177f042b59d",
              },
              {
                id: "2a11a3bb-58c0-4859-abe8-301c74d1eee8",
              },
              {
                id: "64a91e0a-c893-487f-8237-e875750e61ea",
              },
              {
                id: "142221e7-cab8-44bc-81aa-87bfc297232e",
              },
              {
                id: "fbf8b444-53fb-4d22-9b06-a0f34c80e2c2",
              },
              {
                id: "06d2ae01-a337-4fea-9935-e7d044333612",
              },
              {
                id: "5c57433e-99c5-414b-84cd-b3f2592a4bf9",
              },
              {
                id: "43cfa91b-a82f-4c1c-87c4-80abe6e180c7",
              },
              {
                id: "00ed7c5e-f880-4588-a160-6b28881282de",
              },
              {
                id: "c0fc7cb8-b4ee-4e87-8791-7947b9da9c0a",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "61d064e5-9e58-4d58-98be-8ca302bce453",
            number: 5,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "39ef43df-7828-41e4-894b-17acb45e8574",
              },
              {
                id: "3ac9610d-16e5-46ab-a0d0-eaa79c7bf069",
              },
              {
                id: "a6953d02-ae89-46b2-934b-1e1eca9046a9",
              },
              {
                id: "827dc2f8-38ab-4756-a678-18c1ccef8c28",
              },
              {
                id: "af4757e6-50be-4b68-8a63-2e3e6f45a7e7",
              },
              {
                id: "59f8a880-b0bb-4675-9b54-deff6e861c56",
              },
              {
                id: "e54a3dc2-95fc-4875-90ef-4d0f885aa78b",
              },
              {
                id: "234a65d8-f14b-493a-8b63-a904644170e4",
              },
              {
                id: "deae4cc9-110a-4450-ad00-6f78a4f0bb74",
              },
              {
                id: "0ff7902d-30ea-4a01-99d6-59dd9f436ffa",
              },
              {
                id: "6cda6aa9-0b2d-4973-b89b-06ac9dbbe093",
              },
              {
                id: "503a0d4e-7567-4355-b3b7-fd3d07ade784",
              },
              {
                id: "d28ea025-7bc8-4600-a99b-d03c80aeeab1",
              },
              {
                id: "ac27932f-4791-4783-a455-0ddfa5eb57a1",
              },
              {
                id: "9a9c24d7-8715-438b-bee2-10c5a751e37e",
              },
              {
                id: "dee71e82-70ca-42e0-b962-3e1c720562af",
              },
              {
                id: "bc420d49-8745-4ca6-bb44-43d98e210080",
              },
              {
                id: "3d231087-0e32-4ed1-a68e-3267dc5afae6",
              },
              {
                id: "51b63682-2898-4879-8ce8-5256f821338c",
              },
              {
                id: "a1d3786b-c059-45e7-92b5-4bbd0c1a5712",
              },
              {
                id: "9cccd27d-3bb0-4b31-8a6d-36d6bb9413fd",
              },
              {
                id: "eb996a5f-f7e2-4159-9b0d-26a975a753a6",
              },
              {
                id: "9aa517d9-78b8-4ed1-a45c-21bfd65a0f39",
              },
              {
                id: "f3e1705d-df55-499f-95e0-174c51aaf2ae",
              },
              {
                id: "9774c993-e6bd-4ae6-a823-447badda4caa",
              },
              {
                id: "b0b44ae4-3ca8-4d9a-82c8-6f35f9aa6535",
              },
              {
                id: "08804257-c571-4a9c-93ee-ca6c87d0eae5",
              },
              {
                id: "3ef89859-10fc-4d0c-9e8c-9919ecb7b16a",
              },
              {
                id: "ea46edd9-7a79-43cd-8082-0aa9aa68f040",
              },
              {
                id: "2946958d-07af-450b-98dc-f7c1bce72d0d",
              },
              {
                id: "e5f079b4-e772-4289-9d1d-8317f8cc1089",
              },
              {
                id: "e63e5ab9-4678-446e-8930-83248a6607ae",
              },
              {
                id: "276d9972-c996-45eb-8831-1885b2a0113f",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "73711da8-7b78-470a-b47f-f32a69503176",
            number: 6,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "c4490340-b5db-4457-9dde-e1aed97411f4",
              },
              {
                id: "65f5a6d2-6629-414d-84fe-2d0dfc913aaa",
              },
              {
                id: "8a99c2b1-3836-4cb8-827b-095e1dcbf2e2",
              },
              {
                id: "b158186d-84fc-4343-bcf5-29f35f8b693d",
              },
              {
                id: "c636b00d-97e4-43e7-95d1-97b2b95037ba",
              },
              {
                id: "b1d16f3e-88b6-484a-9944-eeed761f9c07",
              },
              {
                id: "f06cf7ac-81b4-4bce-8425-cb60ae32d731",
              },
              {
                id: "aeac3dcf-524f-40c6-beda-6de5d6d27aad",
              },
              {
                id: "78c7c72a-bfcd-4822-bb91-af2b729c4050",
              },
              {
                id: "de5b85d6-5a34-4d03-bedf-5eac13332617",
              },
              {
                id: "7c1a198a-5782-4507-90c6-face53ffd70b",
              },
              {
                id: "ab9d70e9-27a5-4879-8e08-740c283e918b",
              },
              {
                id: "d59a2997-92f2-4858-899a-2fcb8e2f78ce",
              },
              {
                id: "6250086c-6bd4-45ce-8024-1623c09076fe",
              },
              {
                id: "69456895-d646-447a-99d8-58809c538f3d",
              },
              {
                id: "0d28dcc0-ec53-4dab-962f-050210ef2d26",
              },
              {
                id: "3c9e77be-4c40-4f24-a357-c3ff91af2d26",
              },
              {
                id: "a2d6009f-cfe7-4367-8e42-3df2ae5f83d5",
              },
              {
                id: "eac67412-3b7b-40a0-bbfb-1e0661eaf49e",
              },
              {
                id: "79eab680-cb5c-4bb4-b002-a44decc78e97",
              },
              {
                id: "a9250a34-a087-4ab1-8b23-4e2f33813349",
              },
              {
                id: "d17d54d1-76e5-425c-b608-eadefc5a5c77",
              },
              {
                id: "15c7df46-c98e-46bb-9de1-4cdc2312e3b6",
              },
              {
                id: "a293a416-45ec-4fb2-bad5-475a402d5684",
              },
              {
                id: "abe1f280-e88f-4dc5-baf5-d8970bd712b1",
              },
              {
                id: "83b77398-7f14-42da-94a8-e9df7e707544",
              },
              {
                id: "13023108-715d-4eaa-beda-4162a1bff760",
              },
              {
                id: "c2df5e1a-b37f-41e5-a0ed-4680a2a5a669",
              },
              {
                id: "8354a7e9-56c9-4617-ba88-b797b39e9fee",
              },
              {
                id: "3799bee4-bdf5-4ec4-ab0e-dd807895a15b",
              },
              {
                id: "7fd25195-ccd8-4efa-9b84-6bd5706e13e0",
              },
              {
                id: "1c6da149-f4b9-4b16-8561-0b9794565cca",
              },
              {
                id: "cdb3be42-c791-46d5-85fb-1e1ccbbf374b",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "afe3f609-3efe-4fb0-b888-896dbeb5f6e5",
            number: 7,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "602de955-fcaf-4cfe-8e82-a55fa7ac1066",
              },
              {
                id: "a185b738-315a-484c-9c45-0f2bc692ec13",
              },
              {
                id: "8b3ec048-b673-4b49-b07f-93888268e6b7",
              },
              {
                id: "8a1c19cd-cbfb-4be9-8e48-53913d769a1b",
              },
              {
                id: "c9d833df-c390-4f40-9fc4-0df40b611509",
              },
              {
                id: "cb0a8f6d-985e-4013-a7c5-6db730269293",
              },
              {
                id: "33ed0705-7e93-413a-99fa-84400c1ce746",
              },
              {
                id: "5a745a78-4400-447c-9edb-0f20ab5e22dd",
              },
              {
                id: "cdffd7b7-2c7e-443e-b732-72a278583b4d",
              },
              {
                id: "5f0fa74c-c813-4b9c-a53b-d76f8ab916e3",
              },
              {
                id: "a6245f19-219d-40b0-bdc4-4cc4de671f53",
              },
              {
                id: "9985301b-d341-44f7-bd67-8dff8e9ac3fb",
              },
              {
                id: "acd04ba1-a3b7-452c-8ac9-c24eefc77ea4",
              },
              {
                id: "a19f1b23-0936-4716-a8bd-310c49c66692",
              },
              {
                id: "b63fa68b-0ee5-4507-83c7-1d8e7a84bf4a",
              },
              {
                id: "bfcf12a6-bb85-4154-b540-df027cd787d0",
              },
              {
                id: "5ce46b4c-ea86-41ec-8348-b52115729b8d",
              },
              {
                id: "4ee19017-6eff-4abf-8876-7739d605d55a",
              },
              {
                id: "7f70722f-2655-4941-8106-2f61a0969fbe",
              },
              {
                id: "47dec363-0dde-4b32-bc70-aa5db68b6ba8",
              },
              {
                id: "c2b01b3a-5cab-4489-b135-43150f6a846e",
              },
              {
                id: "467d8bb0-2ec5-486a-9139-859d8a9b8263",
              },
              {
                id: "dfea9daf-e3b0-4892-8d41-e909bf50b1a6",
              },
              {
                id: "89a1eadd-f2b2-4a06-8030-8a6acacb10c8",
              },
              {
                id: "57dff0e5-5328-4f2e-947a-5dfa96283ada",
              },
              {
                id: "3b29fc53-0900-4657-a870-fc005b5a553e",
              },
              {
                id: "2d8557ac-b2b0-45e2-a3b6-ed9e13124104",
              },
              {
                id: "bb5e2151-916d-4572-865f-faf1f0da6791",
              },
              {
                id: "7fadbdc8-3d91-4116-bcdd-8e684886a83d",
              },
              {
                id: "c5ff8ef8-6e29-4cff-bc19-f9a5e225c980",
              },
              {
                id: "cc5a5b64-5a7a-4826-87e0-e567520d2a6f",
              },
              {
                id: "c7330866-6435-470f-b4be-3055cd16395f",
              },
              {
                id: "ffb4c2bd-a54e-4f05-8f65-5efc4d351cb0",
              },
              {
                id: "25d4e3ab-f51a-4f46-af15-3efbe0f015f5",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "ec135290-8005-494a-83ba-8f6a8f244acb",
            number: 8,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "b8814faf-8f35-4329-adb0-7859c7385db3",
              },
              {
                id: "9bd030da-e78c-4315-8c66-cee465ce3079",
              },
              {
                id: "d7d24ac5-7927-4916-bdb3-1ec4f2acdff5",
              },
              {
                id: "6612f375-11d9-41c1-a0bf-af25d5d1ffb4",
              },
              {
                id: "d13f49cd-0885-4ddd-9c9d-06f799809a08",
              },
              {
                id: "a85a91ce-0b74-4d3b-9985-7126ccc61975",
              },
              {
                id: "8ed1e0e2-cdd4-4fae-bfc6-a63aa279eb51",
              },
              {
                id: "3389bcb7-054d-48b0-8fc7-19cd62c68cbf",
              },
              {
                id: "a3907761-cb54-44e4-b4de-e941094699fb",
              },
              {
                id: "7f1d06ab-7fe4-46f2-905d-176187dafedc",
              },
              {
                id: "017d0a31-5ed0-426d-9fc2-351ec5478912",
              },
              {
                id: "818c23fb-a768-4d92-81b0-287b0885fd1f",
              },
              {
                id: "437b3954-bb92-472b-bc6d-f4d6f153c7e0",
              },
              {
                id: "a8a18751-7540-4704-977d-aaf553cf716c",
              },
              {
                id: "cf91ea51-3c6d-49a9-9ea9-ecbf8f8f796d",
              },
              {
                id: "285448de-34e9-41fc-8fda-33795177119c",
              },
              {
                id: "f7e42543-2b2d-499c-8588-40929b1124bf",
              },
              {
                id: "836d7f43-f7b1-4be0-b546-b73a66bfc0ac",
              },
              {
                id: "eeabcd7e-6ce6-498d-a357-1330fbe9fbf3",
              },
              {
                id: "51921713-d9b3-4ee6-bfcb-abd9f6c4fd37",
              },
              {
                id: "e9613141-cc65-4ab9-9d78-40cc2f0289cf",
              },
              {
                id: "dd95017c-96a4-4a26-8253-42b5b1802f16",
              },
              {
                id: "9553d268-9376-4ad4-afde-e2e2fd64d53b",
              },
              {
                id: "02ca6c05-6f2a-4502-a923-66d0e9c9c210",
              },
              {
                id: "09cb672a-0eb9-483f-a1ed-86606c51c441",
              },
              {
                id: "0a004afa-b3f7-4c9a-99ee-061b17d4af60",
              },
              {
                id: "581aceb3-c8fc-451e-90f5-5bf4f33125f4",
              },
              {
                id: "498896ba-6d09-46e3-ab6e-7a242ba03190",
              },
              {
                id: "714c25da-ed35-424e-a1f8-0ee4490e00e6",
              },
              {
                id: "53ae6db7-89b5-4a10-a73a-b052192034a9",
              },
              {
                id: "acce65b5-c989-4eec-bf9a-868039c3f3b9",
              },
              {
                id: "0b339055-8f68-4b08-9d8c-f810330ed6dd",
              },
              {
                id: "ebe3c4a9-df06-474a-abbc-fb70df43f8da",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "a4dd69f9-8966-456f-acf1-5b339670206a",
            number: 9,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "64c493ee-d026-4190-aa40-96515e181a79",
              },
              {
                id: "81d99514-3843-42bc-9fec-317d3c58f087",
              },
              {
                id: "68bf64f5-c936-4320-b376-e20ef2bfc18b",
              },
              {
                id: "97dccc16-1524-4833-8294-b2f7786233a1",
              },
              {
                id: "3c807482-d4e4-4718-aa2e-613eddd5b579",
              },
              {
                id: "9ca51cef-b89a-4bc8-ac22-92224046bf6b",
              },
              {
                id: "3828a3ea-b0ac-48b4-8107-f5c70f423859",
              },
              {
                id: "bbece6f3-e72f-4585-9583-9b91dad9b9e3",
              },
              {
                id: "cce64be1-a4d9-4dec-ae77-9807153c9567",
              },
              {
                id: "4fa62899-b49b-4885-b29a-625b4762b9a8",
              },
              {
                id: "ef80f392-3f97-4acc-bebb-57261fe7ef89",
              },
              {
                id: "2ce64f3f-b7fa-4e39-9213-e9f5eafe2fdb",
              },
              {
                id: "b69fefe5-d9ea-4409-b260-3cff58c6f0ff",
              },
              {
                id: "82a6a9e7-8b98-4ab2-988c-c404866921c8",
              },
              {
                id: "230bede4-05de-4489-9c62-89d78165cb93",
              },
              {
                id: "3745155a-5809-4b39-84ae-8862cb8d1742",
              },
              {
                id: "36e8d3d9-5db4-43ce-9332-3c5fbecf4d44",
              },
              {
                id: "e5743e2b-e080-4701-80b2-62f0d0522a36",
              },
              {
                id: "5c38861e-95a8-4d03-b02f-7565636d883d",
              },
              {
                id: "6ed936a7-edf2-4410-84ec-5757339bfac8",
              },
              {
                id: "86b2354c-f3ab-4f65-88df-e2c5e7d65f3e",
              },
              {
                id: "01a8a4ee-f633-4288-a45e-20ff5108eb58",
              },
              {
                id: "96b6121b-29ca-470d-839c-47b91fe25e51",
              },
              {
                id: "c2a3683d-7513-4b83-b0de-90e5366ab278",
              },
              {
                id: "f6a7caac-2f19-4aeb-8c59-39df3a038bdb",
              },
              {
                id: "319482a9-ee78-477e-8a54-ce3a717fcbde",
              },
              {
                id: "c8508f7f-29cc-483f-8ee1-24dc9a4af263",
              },
              {
                id: "30b35d21-5412-4596-a0a7-d658dfe77e60",
              },
              {
                id: "98c49613-7557-4668-9f4e-ed71a886c02b",
              },
              {
                id: "06f45905-d98d-48af-a121-a3ad9bc7aad8",
              },
              {
                id: "cf05b22d-c9e0-4100-8cb9-c58f4e547f03",
              },
              {
                id: "32dc87f9-922f-4026-99de-5ade088f604f",
              },
              {
                id: "23e25cc5-d5a7-4169-8491-c2a93ae303f2",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "da55535e-bb42-49e2-9b86-c80d5b12fe14",
            number: 10,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "de829523-f0c1-4eb5-a50d-f4642ca7e1ff",
              },
              {
                id: "688dc6fd-84aa-4fc7-96b6-2273c279d3e1",
              },
              {
                id: "5dc11b4a-19f1-496e-990c-0e5e831c53c0",
              },
              {
                id: "edf3b9fa-570c-443a-924a-c8a2ca441572",
              },
              {
                id: "9caea324-07cc-4944-a644-8759ae276a43",
              },
              {
                id: "3720ee21-4aa2-4505-82ae-779801f25339",
              },
              {
                id: "0fd9a39b-d56e-48eb-a643-199bf705a664",
              },
              {
                id: "0c2f473e-3e18-4528-acc9-c39fa85c2548",
              },
              {
                id: "f28f941e-9321-42bc-842e-de23cc89c2a0",
              },
              {
                id: "0674ffb5-aec8-4988-a701-90306f8e6ff8",
              },
              {
                id: "daf24285-a117-474e-a200-d432d9661149",
              },
              {
                id: "c7121d73-cc5f-4a93-bbc5-9679a624cd14",
              },
              {
                id: "9b0f8495-6801-4559-aa5b-aaee8b227397",
              },
              {
                id: "c9fca31b-3c55-4fe8-b13c-7a68fc2a2dbd",
              },
              {
                id: "1711cff4-b17f-4d40-a847-655375cb4dd4",
              },
              {
                id: "b0a74f38-3b83-431d-8e6a-18a38590ebb9",
              },
              {
                id: "ca4f6316-b1a7-4ac1-aa7c-e8b84e351989",
              },
              {
                id: "7c906a3b-8da9-4edd-b55d-9c6adc1d7c67",
              },
              {
                id: "3dbf70e4-1122-4758-95e5-1144220d5b80",
              },
              {
                id: "2be6cb8a-3a95-4193-a9e9-3ec2d1946b83",
              },
              {
                id: "a3f0b018-bcd9-478d-9f92-834ea6650ffa",
              },
              {
                id: "77badfbb-a36a-4e1f-bf5e-82f403560252",
              },
              {
                id: "baceb5d8-1049-4acc-a1d9-ad410945a8f9",
              },
              {
                id: "70ee9b3c-2d5a-40b2-8f5f-40f63e4f1062",
              },
              {
                id: "5388b813-5afc-4aff-911e-34fb798b78d5",
              },
              {
                id: "ffb670a5-6ec4-49cc-b485-a1d49931bfcb",
              },
              {
                id: "21ef5bd8-5626-4e02-a8d2-d9d2c9e31c5d",
              },
              {
                id: "675e1f75-ead9-4f37-98f2-f04be04c61db",
              },
              {
                id: "e48c0faf-0881-4305-8c23-4790535cd119",
              },
              {
                id: "bde22345-4cf4-439e-9b00-8bc3ddeb0b05",
              },
              {
                id: "c496d0f3-09c8-40a7-8fea-1efe3d7de08f",
              },
              {
                id: "c665250b-5b03-4bb5-846b-a7fc73040abf",
              },
              {
                id: "e128aac3-d9c3-48b3-a59a-3431edeb1209",
              },
              {
                id: "0b229b65-91e4-4941-a073-f9a54c9ef038",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "f3da4345-36c3-4015-9b47-2024fcdd0bbb",
            number: 11,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "12b8506c-6a1f-477e-a4e0-325670c2685e",
              },
              {
                id: "ee99d710-374b-4a26-b5a9-61fc7e8b383f",
              },
              {
                id: "b114a85a-c663-4fee-8976-08d8dbbbca46",
              },
              {
                id: "5ed1dfe7-fbb8-42d5-82b4-41f8829b36eb",
              },
              {
                id: "acc63d31-270d-4828-a163-f2453da28eef",
              },
              {
                id: "269ae869-ccf7-4851-a66f-3b096d0a752b",
              },
              {
                id: "0bfc677e-979b-45f9-871f-67aeb0264336",
              },
              {
                id: "f912b6ca-1bf4-4e08-b4a4-c2f837256d35",
              },
              {
                id: "34ebe6c5-8759-43d2-ac91-74e6b9bd88e7",
              },
              {
                id: "a3c222c7-e489-488b-b77e-13200bd58e7c",
              },
              {
                id: "55825da7-90c4-4474-ad3b-7dda3ae61b17",
              },
              {
                id: "5e3ee141-5328-4a99-ab87-fed9f7b31fa7",
              },
              {
                id: "42750fdb-9b31-4db1-83ca-cc31af6e0ccd",
              },
              {
                id: "3c179ec6-548f-4cc6-960b-b09ad45953e0",
              },
              {
                id: "c48e53fa-dff4-4018-b6b0-f59b19b0383e",
              },
              {
                id: "060c0e95-46a1-4f52-a709-6f5064b77a9c",
              },
              {
                id: "df615b6a-aab1-47d2-afe3-58b74e3a82db",
              },
              {
                id: "c90183dc-e070-44aa-bf37-291ccd40d9f6",
              },
              {
                id: "e727f473-ed37-4af7-93a1-39e3797bf45e",
              },
              {
                id: "960e90e7-b71a-45d0-8180-85e435fb1af3",
              },
              {
                id: "d7a9f3b0-0a11-4d56-b5be-86d3dcd69873",
              },
              {
                id: "2c2beaaf-797b-472a-8d27-c98e94f3de32",
              },
              {
                id: "9f70ccf4-9662-4ee9-8c11-5bb9b2d6ef24",
              },
              {
                id: "18dbe9cd-ddc3-4f31-b84f-c9e2b6d17ee1",
              },
              {
                id: "87683f1d-0972-4a99-b183-ec5576c21c2c",
              },
              {
                id: "92dd5988-abd6-479f-80ba-e87d01112cc9",
              },
              {
                id: "9dbcd5d3-458c-483b-a4e3-7b9674f500b5",
              },
              {
                id: "6316c4c2-c56c-4e6d-800b-610b2b3894b3",
              },
              {
                id: "69f2fbf6-3ab0-4c67-93a3-1c53f69b2a5f",
              },
              {
                id: "9f4eb0d6-2c8f-4ee2-94f0-899a6a75c636",
              },
              {
                id: "4a2a312c-32d3-496c-beac-75ea9b89046a",
              },
              {
                id: "b0dee2bf-42eb-4bf0-b632-2fd52b456b0c",
              },
              {
                id: "fbb43633-7c5e-4301-aa23-ce8165266b1d",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "e0ddfd94-f6b7-43e0-b207-68c2fa6bb607",
            number: 12,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "b9859b32-33d5-4714-a658-367dc427e479",
              },
              {
                id: "6c8802f4-02b9-42a9-88be-6dddb4ffefa6",
              },
              {
                id: "4eaa9487-56a0-4372-aa08-f4638f26423d",
              },
              {
                id: "f76ce1a4-2e58-42fb-a33a-2b437d443735",
              },
              {
                id: "7686429d-8001-4da3-b168-9d0d4214797f",
              },
              {
                id: "2a9c50ed-07d9-4041-97c9-d8124de52868",
              },
              {
                id: "742a331b-581d-4bf8-809c-62fad3cb9040",
              },
              {
                id: "a6f5d4f1-725e-4913-b69c-bea426a758a6",
              },
              {
                id: "5573fc69-f8bb-4bd7-9082-a2c451e8793e",
              },
              {
                id: "75e6930f-22f7-4422-acb5-05ac5c48bf07",
              },
              {
                id: "e8697fef-3d65-4aa1-85b0-875aae469e88",
              },
              {
                id: "a7e66077-8465-43f1-9c98-0933d4549a4c",
              },
              {
                id: "42271962-e7b5-4cb7-b46b-678cd4dcf870",
              },
              {
                id: "2495b0cf-bb88-43f4-8c9d-55f24367e265",
              },
              {
                id: "87d8a194-0231-4cc9-a37a-290b6387f2bf",
              },
              {
                id: "10f4cb39-230d-424c-bb2c-8761cd5515e0",
              },
              {
                id: "8980fe43-871a-45a4-ade5-50af6ff492cb",
              },
              {
                id: "403f9ad1-5e7d-4a2e-85fc-8fba1aeceb09",
              },
              {
                id: "353eb7c3-603e-4bfb-8f17-9cf6460a4a04",
              },
              {
                id: "01c2af6c-8f5a-459a-9961-9ba146c137b0",
              },
              {
                id: "1a7b97b6-0fc2-4aac-ae67-dc3a0ca2b7fd",
              },
              {
                id: "d133abe0-c351-4076-9f4e-e1da0f37b988",
              },
              {
                id: "ad23cda9-201f-444d-80f6-030347679f09",
              },
              {
                id: "3b4ff5fb-8b91-46f6-a30a-3d51c62fe742",
              },
              {
                id: "fec36cf9-57c7-4f97-93e8-ad2e0f1e6c2d",
              },
              {
                id: "6a5256ee-49ba-4d01-9517-cb03f7f7f9ed",
              },
              {
                id: "54662020-3332-4dd2-8ebe-5e3fb3a3b8f4",
              },
              {
                id: "6a68d616-4a75-4aba-ada2-e39be1811d7b",
              },
              {
                id: "40e0481c-b399-4251-8a25-14a76c435d94",
              },
              {
                id: "8c61d4c6-7d5c-4230-be5d-08b16da2eefb",
              },
              {
                id: "275b20fa-3a3e-405d-a6f3-5bedde49264d",
              },
              {
                id: "532d6718-3dca-41d6-a581-38d77ee3b51f",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "db2fa07a-ce36-45dd-bb8f-32415fe0060f",
            number: 13,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "bcc3bbdf-387a-4225-9a38-1c6ff23d4876",
              },
              {
                id: "638ad08c-57a5-45e7-8ae4-de40c8eaef8e",
              },
              {
                id: "ccfc886f-9c41-4db8-a586-30c28e5187b5",
              },
              {
                id: "02ea357a-a027-4b2a-9087-9f8cad0633e1",
              },
              {
                id: "8809aaf9-ed23-4e50-b55b-7eafd782e342",
              },
              {
                id: "450e7caa-f259-46e6-b1b5-5c49aa39ad7b",
              },
              {
                id: "e00cc817-0c0b-4910-a769-30f1da756d84",
              },
              {
                id: "18b18bd1-4b83-42b5-824a-c13ccbdace14",
              },
              {
                id: "f7fdfb57-2b58-42ff-9f7b-7a3c35ca2cad",
              },
              {
                id: "b5ddf1b4-9a4f-4c90-936f-4a6ca8cdcc4c",
              },
              {
                id: "662acc2d-116a-4a19-9811-7e0b8e140829",
              },
              {
                id: "b9a1d7ed-2b6e-47ac-a64e-a4e5f99fc83d",
              },
              {
                id: "835243ff-c32e-4809-b125-937f39e413cd",
              },
              {
                id: "65b00c53-1d8c-4db0-af3a-c974cea10f02",
              },
              {
                id: "8dd19c7c-6662-43d9-85c2-ce07e50158a1",
              },
              {
                id: "746a151d-5127-4a5f-b2c6-6bdd8da04f30",
              },
              {
                id: "505f65dc-51aa-47c6-a2f6-79e910edbf9d",
              },
              {
                id: "273ea8d2-6dca-4614-9497-49d8df93d80d",
              },
              {
                id: "5b5d1e93-27f6-4642-a776-1744fdc30d6e",
              },
              {
                id: "0b2552f3-65cc-4d49-802a-5037b0649933",
              },
              {
                id: "615eddd4-a9d2-4e94-8ebd-2c96d8066078",
              },
              {
                id: "29db7e11-b633-4d8b-8c13-73598af0e46c",
              },
              {
                id: "a457f9db-9521-4124-89a5-eef9f647b0d4",
              },
              {
                id: "8cc58154-4bb6-48db-8268-c046bd4b195c",
              },
              {
                id: "14de1b46-24fe-43a2-9420-d1211bdb072e",
              },
              {
                id: "8a61a92c-048b-4c11-9c9d-08e534958ccf",
              },
              {
                id: "8e5a5e99-1a9f-4f78-b36f-334611426f5f",
              },
              {
                id: "dc1630a9-1178-4ccc-9aaa-96f0b60390eb",
              },
              {
                id: "3d2dba99-4fac-481f-bb0b-5012a66020f1",
              },
              {
                id: "a5107b40-5796-4258-b405-8e0167c09f91",
              },
              {
                id: "940a56e8-58ff-42a9-b8aa-4b00e3ba4d9f",
              },
              {
                id: "0accb0e7-a457-4870-b7d0-611dd7352c1e",
              },
              {
                id: "8d15026b-843a-41c3-b4ce-175614515da2",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "31f42584-224e-41a9-b3c1-66f823071fb5",
            number: 14,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "3f8bbe15-5760-447a-95c6-32f9e2b2624a",
              },
              {
                id: "5cc12d97-406a-4621-8b41-8c5e8b0a66f6",
              },
              {
                id: "907d9e53-25b5-4271-8a8d-5b11ee9c4bf5",
              },
              {
                id: "33cf0a5c-9574-49d9-9d4c-00d7d43bf940",
              },
              {
                id: "039f1735-c233-438d-8d9f-75d82fbe64f9",
              },
              {
                id: "8e44a7d8-2707-4b4f-ad8e-c166f45745d5",
              },
              {
                id: "c51ba5ef-cd62-4d80-9d43-b5f95d019f96",
              },
              {
                id: "3d059ba1-ba8d-45b9-b6cb-dea7dcc793e0",
              },
              {
                id: "861d11b1-4208-41d2-a725-0d53b85886a5",
              },
              {
                id: "4dcd2dd6-4e69-4ad2-940c-896f6eb73ec2",
              },
              {
                id: "baa7c4b3-b2b5-4390-8ca0-4df4cc119744",
              },
              {
                id: "20b09d9c-4a75-4af3-921e-98ddb544f8b5",
              },
              {
                id: "447ca23c-3568-4c8f-ad2c-622e05645e2a",
              },
              {
                id: "9ae5e926-9b06-4751-a661-9453e4a2bdf2",
              },
              {
                id: "6c8d1a5d-532c-4fb6-9df3-2890531d17f2",
              },
              {
                id: "154755cf-8ae6-4c65-a750-05000227ccde",
              },
              {
                id: "71a2d8fe-2069-48a8-8d0f-93314ddb8550",
              },
              {
                id: "f55bcd57-edff-498f-9daa-42437105c76d",
              },
              {
                id: "6e145e6a-0b25-4ce6-8ae0-d40403ab16de",
              },
              {
                id: "6e89cf29-a524-451b-9ab1-dc1f213a25a6",
              },
              {
                id: "a8b751ff-325d-4e81-99d1-cad2b3bea94b",
              },
              {
                id: "912d6961-83cc-40b8-aac9-0d93d50a0f43",
              },
              {
                id: "6424fbac-e91c-401c-95d8-e185829b92d6",
              },
              {
                id: "85a1fcaf-b159-4310-974c-98e58f4082ea",
              },
              {
                id: "bf804cef-a3a2-4e80-a79c-d512aae89090",
              },
              {
                id: "accf7946-b2cc-40de-afb0-ba291061737e",
              },
              {
                id: "84f48a94-c8c7-4f72-a2e0-823667d4dd2b",
              },
              {
                id: "eee1a53a-bfa5-4bdf-babd-014f4dc318f0",
              },
              {
                id: "26f0f78f-eca1-4e6e-900c-38491cb31916",
              },
              {
                id: "8c8ddfa7-b28f-430a-b1bf-746ac112a863",
              },
              {
                id: "7a8430f2-07fb-4c5f-9615-b2e208135b86",
              },
              {
                id: "e4e83313-789e-4d2c-a935-77ab1fc5abe7",
              },
              {
                id: "79c328ff-148c-45a4-a346-34bd01589f17",
              },
              {
                id: "44afba8b-7fd8-4334-a771-9f60384d30ff",
              },
              {
                id: "e50cf6f9-1e4f-4a42-9469-d0e263b04bef",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "c0e5766a-97db-46ec-a547-1be91702f9b8",
            number: 15,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "5bee0fcc-59e8-4e4d-8ba6-7c97d5b0e726",
              },
              {
                id: "02bfd3b4-e0f6-46db-bb88-4fda82a6d55d",
              },
              {
                id: "2de5caf1-294e-46b4-97aa-18a3cc7f583f",
              },
              {
                id: "90bace49-baf6-4bd8-93b8-20f3140de7fa",
              },
              {
                id: "c9d7a989-ea58-4538-be47-6bc45810cf0e",
              },
              {
                id: "5de6177a-5aaf-4a1c-8bb8-5bb3413c41b3",
              },
              {
                id: "3b1d368c-5a88-40cd-9586-886735e3d1f1",
              },
              {
                id: "6c44f880-d210-4078-8571-5e3f3781d8c8",
              },
              {
                id: "560e8f76-d7d6-402a-9b79-c6f87560a277",
              },
              {
                id: "8a800b8e-56ee-4e57-9ca7-d80c376ecef6",
              },
              {
                id: "e4823a31-9a7c-482d-8098-61e027fb77cc",
              },
              {
                id: "213e1c8b-b262-4400-844e-c44c19659858",
              },
              {
                id: "6cfa2f76-77c4-435f-9a5c-110918e94025",
              },
              {
                id: "b2f386d4-da27-42ed-a7aa-73ce5cea109d",
              },
              {
                id: "c49f565e-3cd6-4149-8236-2669a88976a4",
              },
              {
                id: "50f71325-22ed-4ef3-9c57-dabc027ff7b6",
              },
              {
                id: "c9925b0d-a4bc-440b-883d-441da37eac73",
              },
              {
                id: "879ef975-146d-458d-850b-cbef78f81945",
              },
              {
                id: "7861c191-e2c7-473a-a09a-1fb2001b1739",
              },
              {
                id: "05941c73-54bf-472f-a711-08ed8e0efa97",
              },
              {
                id: "67cf4559-d25a-47bd-ab1a-5ca479c2f79d",
              },
              {
                id: "da1670df-d98f-480f-b391-07315f309eab",
              },
              {
                id: "054ff095-7f3b-4706-9059-dcd2c98f0e9a",
              },
              {
                id: "94dce8eb-e165-418f-8cef-a5af3f1d2b64",
              },
              {
                id: "a6def912-6ba1-409f-b88a-b183dbec89fa",
              },
              {
                id: "946cf616-9844-468b-add1-a53a60f108d9",
              },
              {
                id: "f8498317-b676-499a-863e-1ef1e42f302d",
              },
              {
                id: "24864509-fa76-4c6f-8f76-e503403e3e0f",
              },
              {
                id: "303b0865-7f90-4340-ae9a-35c16d9eb459",
              },
              {
                id: "af476471-6189-4432-9982-9bb8b96cf979",
              },
              {
                id: "2dd6b928-4e09-4d07-b7b9-ab85181f0144",
              },
              {
                id: "9a94a955-d9c9-4e11-92c7-7097cdc5bdb7",
              },
              {
                id: "92fa6530-57f3-48ae-846a-2bbcf71f31f2",
              },
              {
                id: "3c75235a-cecd-4bd5-ba73-884877b89bd6",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "3f0ec857-e7a3-45f1-9347-4d6b97002f98",
            number: 16,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "cc5e9b15-4e97-4d4f-ab8c-78515fff2555",
              },
              {
                id: "4f74bf7d-c3bb-4bc2-a973-8b7b45b31554",
              },
              {
                id: "78ea1fe5-ae0e-4c8e-bc59-1f69ce46a08c",
              },
              {
                id: "5ed54cce-4f6c-4988-8a33-a5941f798429",
              },
              {
                id: "3326e3ff-1b5e-4c3c-9506-4b2170db4e86",
              },
              {
                id: "d464eeb0-234f-462a-bd80-e07613bf9503",
              },
              {
                id: "6c7ac51a-40d3-4e1a-b4ba-778742011dac",
              },
              {
                id: "333adc75-ddf5-415b-9057-bde6ba2d323f",
              },
              {
                id: "e8944a21-815d-4a72-adff-a34acab827be",
              },
              {
                id: "4171062a-5ece-4492-88d0-a18a4fb2f822",
              },
              {
                id: "24f32050-28f2-4c83-bd20-93d301f2c276",
              },
              {
                id: "80c465d3-ea15-4dfc-95d2-35ca668148eb",
              },
              {
                id: "480d21af-bb6c-4b70-8d1d-bb8530bfa983",
              },
              {
                id: "d7e40cba-35f9-4367-aefe-b94a1f7ba1df",
              },
              {
                id: "94e41989-4e6d-46ea-930a-237f74af39de",
              },
              {
                id: "a9f63c11-a727-4a4a-a008-2c3f0ab15774",
              },
              {
                id: "acdfdd25-0686-4776-933a-c52e1f7e8b09",
              },
              {
                id: "ca58fcde-4291-466f-be4b-f1e11e7e4eba",
              },
              {
                id: "6b2449c2-4196-4a42-a957-7bac26fb563a",
              },
              {
                id: "16fa7c71-9dc2-49ba-bdc7-53a2ad2e7ffc",
              },
              {
                id: "8a3121dc-7865-4d3c-8d67-56065d80658e",
              },
              {
                id: "a3b23c3e-5d4f-43e0-b770-a8df24a00a57",
              },
              {
                id: "c8d75f6a-598a-40bf-a892-f34386452843",
              },
              {
                id: "45d3ff84-c715-4f1e-bd7c-a0977de9bf16",
              },
              {
                id: "d5313ebb-217c-4497-86f2-cd6fbaeed52b",
              },
              {
                id: "00c84e0d-6df4-4047-8f4f-3cb2db33eeb7",
              },
              {
                id: "bb251fd8-b0e5-42e1-b0de-79924ef3f448",
              },
              {
                id: "3604344a-9384-4248-87c5-bdee6ae3249a",
              },
              {
                id: "0b750597-c9fc-49ce-b7e8-6fcd9f893cf5",
              },
              {
                id: "3e804f08-6cce-4d77-954d-eae518b0d6df",
              },
              {
                id: "32b22db6-eb3e-4d2e-a5d6-dcd86690ac28",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "ff9ab9d9-5467-407d-a8a4-4877c5646779",
            number: 19,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "ee2f12a8-0480-4cf7-a359-4aebf91cc2f1",
              },
              {
                id: "f35dd671-87bd-454f-a389-22b788649bd0",
              },
              {
                id: "8393ed90-f915-47ab-b948-acd35e8fbe9f",
              },
              {
                id: "f0ad48f4-eda3-4bce-83f8-c825b33a19bd",
              },
              {
                id: "b0671c85-1fbe-4d12-a948-8eaf054a968a",
              },
              {
                id: "c8b5667a-0205-4c2a-be39-95deb162be41",
              },
              {
                id: "028e31f2-ee6a-4375-92ef-dd2ead4080dd",
              },
              {
                id: "fb2d41b9-5a64-42d7-9af2-c5fcaadc15c1",
              },
              {
                id: "c0f376ef-e84c-4c29-8b91-e8c28b5adcfb",
              },
              {
                id: "78b07482-9957-4221-bcd3-923dc06866c0",
              },
              {
                id: "b7d1c1b2-b373-4775-a5d6-ba2ca55ab1e4",
              },
              {
                id: "19cb2743-8579-46e8-bc45-5f54231e6185",
              },
              {
                id: "3a35778a-0a1e-43e1-9506-de5a9e65c433",
              },
              {
                id: "893ca2ee-1bdf-4098-aaa9-30d8ef5c65aa",
              },
              {
                id: "4f2de6b7-008f-4861-a30b-61f2e10bab36",
              },
              {
                id: "4ff23200-5ed9-4f94-9cfd-8ecc40da0b89",
              },
              {
                id: "43a75fb8-5ae5-4c87-82ab-86da79b8f71b",
              },
              {
                id: "a0ebaa56-af83-46d5-8c14-a0a127925982",
              },
              {
                id: "008c755b-7ef2-4674-8a99-1c3c4c386b33",
              },
              {
                id: "a4379ecd-64fa-4b59-8fd1-79ce59fabe8d",
              },
              {
                id: "2fb9f77e-2610-4e46-a61d-cde4a10524e0",
              },
              {
                id: "d1ec18b8-ff88-40ee-82e4-7f0eb737cf59",
              },
              {
                id: "f26ddcf8-44e2-4e8b-a79f-8148d0cb8c7f",
              },
              {
                id: "18e96134-bfa7-432c-a3fa-112ccfc435c2",
              },
              {
                id: "e129a9dc-915e-4b4d-aa94-9c6a2e0f53ca",
              },
              {
                id: "452eab47-abad-48c8-9711-81ee92f44770",
              },
              {
                id: "a59a477e-48dd-42b6-b827-b0888f54458f",
              },
              {
                id: "6390d1c2-972f-43ce-9744-5f9a1883996d",
              },
              {
                id: "7f763e52-5f7b-43f5-8591-87e40b373fd6",
              },
              {
                id: "2557f8d3-8809-49e9-be4c-0f1dfb0c6548",
              },
              {
                id: "cbd335c2-a03d-46a9-a9fd-915d728c5939",
              },
              {
                id: "ccaf0331-57f7-4aa1-9477-415354f727ae",
              },
              {
                id: "701293b9-876e-436c-903e-e721956c6d54",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "062d2251-7a75-4bab-a0cc-6d4223909165",
            number: 22,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "311b32d2-cf11-41ce-806b-3563d29db73d",
              },
              {
                id: "bdd19c91-f75d-44f0-86c4-19b50d3c70d0",
              },
              {
                id: "6438ead1-524d-4571-b60d-c715a8969f18",
              },
              {
                id: "09e5324f-cc89-4c65-b82f-58688b922c69",
              },
              {
                id: "16aaafd6-4b80-4490-8c62-678860cb247d",
              },
              {
                id: "dcbd7af8-bff7-415c-947f-c7df9fa1b6df",
              },
              {
                id: "9ad8421e-2363-4a06-80cb-f7df06fcd04c",
              },
              {
                id: "8bbdbd04-7c6c-49e1-8dde-8ff2705bbc3a",
              },
              {
                id: "e6745dc6-f40e-47a5-9f1a-b2a7849b7d22",
              },
              {
                id: "42d2e437-4aa8-4a32-9e1f-f63a5ba76913",
              },
              {
                id: "53170e27-60ee-41ae-b177-25b3ad259d83",
              },
              {
                id: "02e6c49c-0b4b-4c59-b0b4-5c85bb32c488",
              },
              {
                id: "98bb8255-1643-49f5-a141-af62bca71110",
              },
              {
                id: "d7f09946-2275-44de-8758-e06812e45b2d",
              },
              {
                id: "07e50307-2fb4-4e05-a90d-df57280818f5",
              },
              {
                id: "854ff5c1-7a64-4115-be3c-a2e91adb9efa",
              },
              {
                id: "23b1c306-28bf-4044-8d37-35397c083c79",
              },
              {
                id: "c925db74-237f-4bd2-983a-d3fad08db480",
              },
              {
                id: "8189b24c-4a4e-4e4c-a0a4-b40c562fcca3",
              },
              {
                id: "a7c8cee1-4f3b-49d0-8397-8ae559483fe0",
              },
              {
                id: "e68b30e2-ecae-4e22-84cf-3c1e5da859c0",
              },
              {
                id: "7ab2f6fc-0395-44aa-89bf-294d1f4bf190",
              },
              {
                id: "5d4c97ca-3b3e-4770-b675-2cb42e500f15",
              },
              {
                id: "4c1087fc-2a76-4b2e-8083-d274768ea406",
              },
              {
                id: "4da0b279-e20d-4c01-85dc-f9bff5d1b9ee",
              },
              {
                id: "c77feb59-6129-4582-b044-27a48d259925",
              },
              {
                id: "61c1f7d6-ff40-4ae4-bafa-e302a8581f99",
              },
              {
                id: "e94c44e8-3074-4000-90c5-d9c2c8cfe16a",
              },
              {
                id: "a86f704e-7bd4-4db4-85e0-d838febdce89",
              },
              {
                id: "aeb27c0c-86ab-45c7-a4c0-cd4c47e20a94",
              },
              {
                id: "9a195197-d6d1-4593-aa1b-1c3799653a11",
              },
              {
                id: "dfa5fa6f-9799-4d06-a232-25f35e5dcf0e",
              },
              {
                id: "e07b355c-6529-4bd9-9452-d15a23f825a8",
              },
              {
                id: "3357d915-3325-4bec-b325-742bc238412b",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "7db2dc97-c6ac-4378-9802-129cdaebffdc",
            number: 26,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "632d59e9-bb06-46c1-8779-a185fa9085f9",
              },
              {
                id: "52e49fe5-b110-4666-868a-f05913d8b92a",
              },
              {
                id: "ac29f481-1f4f-4fae-954f-d1feb5ad9434",
              },
              {
                id: "9e181dea-9bb6-43ac-ab7b-3cd261d940fd",
              },
              {
                id: "71d74353-2b30-4db6-96b4-c3a058926a2d",
              },
              {
                id: "979e01fd-0ee1-48ed-a3bc-ef4865d9060f",
              },
              {
                id: "178317b1-05f7-4082-bf6b-c0fb704b11c2",
              },
              {
                id: "9df1897f-2bac-40e0-91d9-e8945ce3fda2",
              },
              {
                id: "4caad3b6-23a7-444e-ad05-441d85f96c57",
              },
              {
                id: "51ea602d-164a-4b8e-8a37-9ea8c1fabbed",
              },
              {
                id: "2cae4c9e-1c4d-450c-88c4-d30ff1f61156",
              },
              {
                id: "6b8b3dd6-1732-46c8-bf00-c28199ea71f6",
              },
              {
                id: "8f29e374-6701-4a00-90a9-5457f0b0bda8",
              },
              {
                id: "db8a9909-cb5d-4441-b5f9-c8af380ae1d5",
              },
              {
                id: "7ce5b904-3c59-48fa-88ce-13570881a803",
              },
              {
                id: "34599b8e-c92f-4d89-af80-58f9d8015420",
              },
              {
                id: "84cc1964-7e20-4741-82ca-1516bcc1276d",
              },
              {
                id: "b4b7c790-68ab-478e-afe0-2eb708d6453d",
              },
              {
                id: "cee125c0-c663-460c-90a7-e7edd5a77f24",
              },
              {
                id: "2a790237-98ac-44cd-94e8-0ca6bcf5cb3e",
              },
              {
                id: "e3947197-c4ab-44bf-baa9-6e104d875e45",
              },
              {
                id: "29d396ec-b94d-4fc3-8879-1b6ea36a217d",
              },
              {
                id: "2a1c408a-1086-4e42-a4a4-5a370a1535bf",
              },
              {
                id: "15f93003-ca78-47f5-a0df-131403c58d97",
              },
              {
                id: "557a08e3-14fe-4afd-8b33-5341cb7ed46d",
              },
              {
                id: "de835228-fbe4-428f-a588-213f74ab2fa1",
              },
              {
                id: "37cb4796-65d6-4066-ae9f-3b11d9e80767",
              },
              {
                id: "15f95127-4285-4d7e-a77f-23c10d56563b",
              },
              {
                id: "252099ec-1ad2-4e3d-8399-849cdb279a2c",
              },
              {
                id: "d70d3aa0-bff5-4169-8afc-cb2bc8a3566a",
              },
              {
                id: "e4d93415-c121-4e47-a54e-cdbd57903686",
              },
              {
                id: "22e7da2c-f3d9-469d-b9ee-7010fd3ab693",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "bfef8e66-e701-4c2e-8bff-f97c8c9fc3b0",
            number: 29,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "a07d844f-f488-40e5-ae03-01ab7147f8d8",
              },
              {
                id: "1e36a6cc-d496-4fd6-80c4-c2401aa9da45",
              },
              {
                id: "a6df2e71-b906-432f-bbe5-f11468e23c93",
              },
              {
                id: "b2ac1a69-ff7b-4e6c-b8c3-fdb7a156afd8",
              },
              {
                id: "f64b42a9-789b-44e8-9ea4-479a58f6da78",
              },
              {
                id: "6938c4ab-bc1a-4514-8ab7-3a9ce756adb4",
              },
              {
                id: "e199f5fa-59a5-42c9-a4da-84bd1b989d29",
              },
              {
                id: "1bf9a619-3aa6-4d5b-94a2-62226c85c96e",
              },
              {
                id: "5539eeb8-b0c3-42d6-b8ad-e29f915f8aa3",
              },
              {
                id: "4fc687d2-3239-4c15-a74b-a40c9d297bd3",
              },
              {
                id: "4a3f2c52-5db8-4f98-ad69-b9f5e994a371",
              },
              {
                id: "04578e5b-2047-4d19-92aa-e6b675cee627",
              },
              {
                id: "bea60606-b6f4-4c1d-803c-ba4ba9c0f20a",
              },
              {
                id: "394b6377-c038-4e27-ba60-3b3052d7e154",
              },
              {
                id: "b795696b-27e9-40a4-b9ba-deefaac38271",
              },
              {
                id: "f165cc51-864f-423c-b78b-0024d2ae709e",
              },
              {
                id: "8a6b1de6-0c17-4ebe-835a-2e33f30016ad",
              },
              {
                id: "0a1f46aa-e517-4dba-ae6a-060bfe6c0d83",
              },
              {
                id: "5ea1af9e-715a-469c-9a76-8293b00c8969",
              },
              {
                id: "3c0ce477-29ea-49b5-a13e-9f772e32b1ec",
              },
              {
                id: "b4057755-9172-4e74-acd8-d8d04e6c0cce",
              },
              {
                id: "0ee82974-69b9-445b-9f25-51a669405a4f",
              },
              {
                id: "88984076-0340-4a16-b6dd-56e63c2cc576",
              },
              {
                id: "50c4fc81-6983-4fbf-abd4-d3198912e21c",
              },
              {
                id: "10f2396c-98cc-4f14-926a-d96a0f424858",
              },
              {
                id: "372e1992-8078-413f-a170-6e59ef291711",
              },
              {
                id: "d9c652da-c87f-44db-aa16-dcc12dc9e499",
              },
              {
                id: "9922fc83-f874-463d-abbc-d5bb90751f6e",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "ecd409f2-bd73-4bbc-b230-0014850570eb",
            number: 32,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "65222ff8-8f3d-48f9-a9d9-c2e45309ccc3",
              },
              {
                id: "ac910c41-150a-414e-9856-6779e33be968",
              },
              {
                id: "3965f31f-4cbe-4df7-82b6-e2e2345f05d5",
              },
              {
                id: "616815e3-39e8-4717-b295-65949dca2e97",
              },
              {
                id: "b688058a-0351-4406-8729-95b1161fcb0c",
              },
              {
                id: "1bc61f58-489e-4446-8a3b-b6a54c8f3183",
              },
              {
                id: "213fb6d1-db3a-4f01-a29f-55b80996ce55",
              },
              {
                id: "f6c94053-1e1c-46db-977c-54453ed45d76",
              },
              {
                id: "4e0b68fd-724f-4d04-9ac9-d9957fa4fcac",
              },
              {
                id: "968900c3-74a7-440c-9468-79bdbbc8163a",
              },
              {
                id: "f930ac02-8e11-437d-b19a-16552efd162d",
              },
              {
                id: "ce20206c-d833-439c-a2f5-95b49dcfbc6b",
              },
              {
                id: "de625df4-85c4-4883-8fd8-9e5629bfb42d",
              },
              {
                id: "5f530f33-ed7d-48a3-a1a8-321a1214cf52",
              },
              {
                id: "4f135513-259d-41af-a802-d3eeb1e3be46",
              },
              {
                id: "016ef8f0-6a6a-4a32-aee3-3e3a1de8f19c",
              },
              {
                id: "3e620678-faca-4085-888a-4fc167cd41cf",
              },
              {
                id: "efde1960-621b-48e2-afba-bb17c56bbbfb",
              },
              {
                id: "1720a70d-bd35-40bf-9524-1a07c68025c9",
              },
              {
                id: "6822de70-ba2c-4110-8d51-12c27e699814",
              },
              {
                id: "e372999e-030b-40d8-9cf6-48dafd0ffefd",
              },
              {
                id: "b1795ccc-7b4b-4503-81d2-c0b5990bc5c6",
              },
              {
                id: "f3df043a-2afe-446f-8b4b-7d84d734ffb7",
              },
              {
                id: "509138aa-af9f-4707-878b-6e9d4abfcdcf",
              },
              {
                id: "f4317fc5-827a-420c-b139-c5f64d51016b",
              },
              {
                id: "58e4984b-8a30-4597-9ca3-83ca053f8eee",
              },
              {
                id: "f5f9ad82-727e-4758-8600-68b661e05e2d",
              },
              {
                id: "49f83fca-afee-45bc-bd7f-1f217f729e5c",
              },
              {
                id: "7a703179-5b3d-4476-8162-747cb2da5cb4",
              },
              {
                id: "1d83f80d-67df-4ab2-adde-aada6ca5f696",
              },
              {
                id: "59bf9c3a-a667-4b3a-96d2-7567cd086f0d",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "11a8b3df-cbb7-450a-9b17-65d4bf576cd3",
            number: 36,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "99ea113c-b673-4c6c-a51b-38171508c87c",
              },
              {
                id: "98f30292-ebf3-45c6-99cb-3aa49fed244b",
              },
              {
                id: "c6ea56ed-cacf-435b-a6f6-785e97ad79f0",
              },
              {
                id: "b69dddeb-c55e-4870-bc43-532c8b3e63ee",
              },
              {
                id: "34d61206-6f91-41bb-ae01-dbd61015ea05",
              },
              {
                id: "3ca6d4ed-fcdc-42c7-af13-a8c39a3652c5",
              },
              {
                id: "590d2530-41d1-4ce5-aac3-84c86b07de0b",
              },
              {
                id: "0be2d94a-5ab4-45ca-9ee4-e547053bbb96",
              },
              {
                id: "5405df12-cd7f-4875-8a16-f5ab8a758c3f",
              },
              {
                id: "cefa320f-e2d7-42ba-80ba-83d203154981",
              },
              {
                id: "b7e0112e-c114-4c2b-992f-d89b6abbaafc",
              },
              {
                id: "db24c18c-ca23-4776-bd69-1eec9ce5772d",
              },
              {
                id: "a9fae8ce-81cf-4b4d-bdf3-4f89f32cffa2",
              },
              {
                id: "1399bcd0-3c6c-4c5d-b2f7-155398bb951b",
              },
              {
                id: "48573692-5bd5-49b6-a4d3-7e8fd1eb6e6a",
              },
              {
                id: "5e280185-c1da-40e9-b9c3-73bbd93d7527",
              },
              {
                id: "050f22c9-8b44-4662-b5b7-47e817953990",
              },
              {
                id: "276ec699-828b-4310-b088-5823916f803e",
              },
              {
                id: "975b3732-aae9-4783-87ec-dba566a5528c",
              },
              {
                id: "fbc440e9-7b72-4dd6-9479-c5f61f18c729",
              },
              {
                id: "4c8de916-3e2b-4737-83eb-5bd9bb5c4bc6",
              },
              {
                id: "5aeac15a-3cf5-4de0-8405-07c660e5f122",
              },
              {
                id: "f79b0068-e0e9-452d-a3ff-f8e9c3540e7d",
              },
              {
                id: "885f4de2-39a5-41e7-83af-659acb05a74d",
              },
              {
                id: "83564ed9-9903-4292-ae11-39bbfec8fd41",
              },
              {
                id: "41330374-8eec-429f-82d0-fe124abf9a2e",
              },
              {
                id: "4db58d22-ba3f-4a48-811d-61fd0468f500",
              },
              {
                id: "0e289f3f-0e97-439b-b055-5145cb117b02",
              },
              {
                id: "d0d82bb6-db0e-4f55-84ac-03bc0c9d64ca",
              },
              {
                id: "1cf2385b-66df-4969-bd5f-2d1b09a07664",
              },
              {
                id: "d9939923-0d51-45fa-a851-e14155167758",
              },
              {
                id: "724670ef-1051-428b-aeac-4ed12e47315a",
              },
              {
                id: "433fa860-915d-4c36-a715-9dc0e8d8df27",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "c95badfd-a3fa-4197-b17b-8596b3f7a062",
            number: 39,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "ca91818d-64b3-4654-8349-6faf94af6261",
              },
              {
                id: "8a66747f-ebdb-4a07-bf71-340d62d5841c",
              },
              {
                id: "3a99f6a8-79d0-4433-9cb3-9d383dcd6280",
              },
              {
                id: "6f097efb-9ff1-4773-98b8-8586661ffbd1",
              },
              {
                id: "d23750c7-5617-4d8d-b7c1-f8574e7e8951",
              },
              {
                id: "7ecc5718-646e-47eb-89fc-27a86d86cae3",
              },
              {
                id: "23a352ad-3e1c-4d29-a485-7b99fdaf2c64",
              },
              {
                id: "9796ac13-b7da-449b-8932-1a5711792f3c",
              },
              {
                id: "541a5b7c-9e46-4c30-890b-03859c7b728c",
              },
              {
                id: "aadc2c22-6776-4eed-8f27-4696a1d07e23",
              },
              {
                id: "b5e45f33-f679-4148-b333-304aea464fb1",
              },
              {
                id: "4243f30c-1a11-4c76-b42c-1fd2938501e3",
              },
              {
                id: "4a12fa93-ac3d-428c-a28a-75d98db266e8",
              },
              {
                id: "d6bf359e-63a7-4742-8ed2-37b65524dc29",
              },
              {
                id: "61374b70-52ba-458c-9179-9ade469a7788",
              },
              {
                id: "1a9d7c4d-1b10-48bc-ba86-10e0c6171950",
              },
              {
                id: "de9bc1e1-ceb5-4bce-879e-69011d3554f4",
              },
              {
                id: "873fb8c1-7136-425e-a6c2-9643fbdf303b",
              },
              {
                id: "5d7c76ed-f08f-4430-a02e-0af20d822e9b",
              },
              {
                id: "2c1b60c1-6d15-4384-90d8-a882353508a7",
              },
              {
                id: "21255234-b801-42ef-a5db-996ae192dee8",
              },
              {
                id: "55d74dd3-1463-4a61-b1a7-667ad64b48d4",
              },
              {
                id: "6eade753-7cc2-4685-af58-d3abf432a164",
              },
              {
                id: "fe1e08f9-2fe8-45d9-bdb6-eb3d04a4d77c",
              },
              {
                id: "01cec12d-41f0-4cf5-8ece-72d469eb7a58",
              },
              {
                id: "94f901ee-9510-47c2-add0-8f83fb4402c1",
              },
              {
                id: "4e059a01-b0a7-4c7f-8a97-ec3037ed7033",
              },
              {
                id: "609465b4-8c03-4352-8002-7524a6a754a7",
              },
              {
                id: "cf6f5a11-dd99-470a-a1f2-91a5aa165035",
              },
              {
                id: "aa5b7f36-85d2-40a9-9c51-2ca2d53c5acf",
              },
              {
                id: "1dd4fb07-6a72-4ab8-a88f-fe50f7040457",
              },
              {
                id: "1f33fa8f-8b6b-4689-ab71-83973303d64d",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "882a4d75-9690-485c-b22b-1c0761df2740",
            number: 42,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "4f39d889-2078-48fc-a6f9-f5046e385ca5",
              },
              {
                id: "aba29d2b-e49f-4f16-bc61-c5375dde2a5d",
              },
              {
                id: "cef00de0-1bd3-459c-a204-e016376bef04",
              },
              {
                id: "9c58c31f-f09e-44f1-a6a4-cc59776760a5",
              },
              {
                id: "1f87b950-7194-4383-9e06-c30210518d13",
              },
              {
                id: "be80afd0-95e0-46b5-ba90-2cb9f68b199b",
              },
              {
                id: "1f352042-2ed3-484d-bd10-7fb4dbe61553",
              },
              {
                id: "e62d1949-cb29-42fb-b88e-29e5de45e85f",
              },
              {
                id: "92a63d79-ab72-4d82-ba1b-2034da189b2c",
              },
              {
                id: "6053a8ee-3a5d-4808-9d02-e4bb5659e94e",
              },
              {
                id: "0815e3c9-7dfd-4343-a02d-bd0583c785c7",
              },
              {
                id: "d1fe044f-7ff7-4660-b8a3-41160bde846d",
              },
              {
                id: "080db704-7c79-49db-8b95-f01e9c5a16d2",
              },
              {
                id: "c2b67bef-4357-46ac-9450-b3def09d3696",
              },
              {
                id: "734f19f4-0b70-4bf7-83aa-868b891eaeaa",
              },
              {
                id: "5af1a4a9-779b-428c-9e18-aa5b4eefc8eb",
              },
              {
                id: "2cb8172e-48d7-4787-a713-e925c8a79a87",
              },
              {
                id: "d87fe2c2-eedd-49f8-b61d-cf00645a4c08",
              },
              {
                id: "4451b778-fbf4-4cbb-8faf-f883c2861919",
              },
              {
                id: "6e4de82c-5813-4524-8f0b-c815c437a2f8",
              },
              {
                id: "a6fc15a4-6908-4aa0-8ebe-cde2ae8a1740",
              },
              {
                id: "72aca381-b8b5-404e-be4b-a6b87297c9b4",
              },
              {
                id: "f007f77e-7cc9-4e10-a248-780314f7b601",
              },
              {
                id: "0b73692e-28d9-413a-90e4-cb4b99babb30",
              },
              {
                id: "cc9c71c3-e347-4de2-850b-01f2a671aa21",
              },
              {
                id: "dee67c44-14cb-4ed9-8dc6-fdb2dbc4d584",
              },
              {
                id: "ad6c9bef-d862-4eb1-a7e5-baeda940cb85",
              },
              {
                id: "26af8578-e960-4d23-924c-5450adbfec8c",
              },
              {
                id: "865d5556-dd38-4c5a-b36c-5c9d2cbd8412",
              },
              {
                id: "9817b2aa-7f66-458a-a814-4d8410aaec87",
              },
              {
                id: "2767a87c-b6a7-4ac8-8734-295ed3b01eef",
              },
              {
                id: "6e180078-2fa5-4dd5-ae61-672fe7902bee",
              },
              {
                id: "885c1285-3328-4414-854c-f47cf743fc34",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "27c6e86b-127e-4924-bcdd-447b789c9028",
            number: 46,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "16b05883-72ef-4033-8590-927c5ffeafb6",
              },
              {
                id: "2e82693c-6a74-4741-9ced-f5e05205165a",
              },
              {
                id: "b696c599-cf01-4401-87ab-e78ab269d341",
              },
              {
                id: "7797b051-5130-4921-af95-143f6ca161dd",
              },
              {
                id: "af9b3954-5443-48fb-8231-312cb7f4f862",
              },
              {
                id: "a512fdd6-3843-4387-87eb-d7e35a6efca0",
              },
              {
                id: "dfc669e3-5d92-43da-ab63-03bfb87b1d96",
              },
              {
                id: "daef86a8-4dc8-404f-aa5d-913ca6d3270e",
              },
              {
                id: "8f378cfc-ce71-43e3-8405-cec467df26fc",
              },
              {
                id: "fca02489-97a7-4607-baac-66f4606a163c",
              },
              {
                id: "d7106f24-9336-4618-9987-154b061cd9ce",
              },
              {
                id: "f9d0f834-cd95-4852-ac9b-b2189f24b973",
              },
              {
                id: "ee0e068d-7dfc-44f4-a1c9-6ab3275d9e10",
              },
              {
                id: "f83ae139-4570-473f-bd12-f753c565b1b6",
              },
              {
                id: "c2555d5f-14f2-4c9c-a806-0e7fbe070eed",
              },
              {
                id: "04adb0f7-b945-4f62-b010-5295cd5708b9",
              },
              {
                id: "729ab0cf-196a-4964-9ee5-068046c1ae1d",
              },
              {
                id: "82155c26-8606-4fd9-bfb1-f85f5c2e78ba",
              },
              {
                id: "23ac4641-d151-4277-a25d-b9e32539be11",
              },
              {
                id: "fcc1bbc6-6525-4af8-8763-357ef1d0e2d5",
              },
              {
                id: "559890d8-29b6-4487-9579-9fd59d8569c7",
              },
              {
                id: "746bac17-7733-459a-9da8-8543c95bc263",
              },
              {
                id: "7734799b-0bb3-4a78-a951-bdaa56f772e1",
              },
              {
                id: "0364a9b7-dfe5-4bd4-9c00-dbbe143ea8fb",
              },
              {
                id: "6ab9e7c7-60a8-45ab-8285-1d0cdb124868",
              },
              {
                id: "d70502d1-046c-40b8-9e2c-37302ece130a",
              },
              {
                id: "0f287abd-ee34-4e3b-a97c-02d14d475c70",
              },
              {
                id: "360a1218-3dae-4435-9ce2-47f91cf272e2",
              },
              {
                id: "c1348bbf-fe0f-4f3e-974e-0ea46e22a2da",
              },
              {
                id: "a695ddb2-7f0f-4896-ac81-94da4ed147b6",
              },
              {
                id: "c954c9ab-9ab6-472e-b400-757097c0e018",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "5a03822b-a197-4693-be61-874a675834f5" },
                  create: {
                    id: "5a03822b-a197-4693-be61-874a675834f5",
                    name: "Kyodai Scans",
                    description: "Fundada no dia 17 de Janeiro de 2013.",
                    website: null,
                    email: null,
                    discord: "https://discord.gg/9Mk8uz6aRK",
                    x: null,
                    creatorId: "db852a04-7406-4a6a-87f2-1b494e810a29",
                  },
                },
              ],
            },
          },
          {
            id: "95abb8d5-802c-4e6f-955e-0f864032a4f3",
            number: 49,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "7a4da784-4c25-456f-9f43-8feea55d3ed8",
              },
              {
                id: "3b851895-48b6-4ba8-b8d0-9ee98179e387",
              },
              {
                id: "c5ce8943-b4e7-422a-8531-13eb4a5956b3",
              },
              {
                id: "eb2469cb-5761-434b-9131-08cd247373fa",
              },
              {
                id: "55e86b2a-2949-4fbf-8e9a-a9972b64bb26",
              },
              {
                id: "014445c6-3311-4443-a58b-e2cedab53814",
              },
              {
                id: "9ffa44c0-fb23-4178-8654-ebfaa83b896e",
              },
              {
                id: "a41c832e-bff4-4e0c-8bec-56dc2ebd7e10",
              },
              {
                id: "56246dcf-1e2c-4b75-9e5a-8f48c412b142",
              },
              {
                id: "2f3962bd-0d6d-4c53-8cda-da26416892c9",
              },
              {
                id: "a61cf1ef-bc5d-4ebf-b894-58539e9ce643",
              },
              {
                id: "9a2f7ccb-2afd-49a7-9547-603b4de3d86b",
              },
              {
                id: "afdbeb90-2423-4082-8034-2acee1f04ced",
              },
              {
                id: "625ff4f8-4434-4787-9c85-e3374756b241",
              },
              {
                id: "66acd1aa-c729-45b5-8888-d43494d90357",
              },
              {
                id: "a1f8155e-0b75-4aca-a80a-f487e27c283d",
              },
              {
                id: "3b043382-ea96-45c8-9659-b2e0044eeea6",
              },
              {
                id: "0464c209-7592-47f4-a4a7-06ed9736c80e",
              },
              {
                id: "b32ae487-aab8-416d-b6cc-c01dc31e7351",
              },
              {
                id: "2c06afd8-af73-4162-81b7-5ac06111adc6",
              },
              {
                id: "2674fe34-d27b-4d5f-971e-57cf3651b5f9",
              },
              {
                id: "62be568a-c349-4c62-99a6-5920ab9eec5e",
              },
              {
                id: "e66908fd-83d8-4515-9c8c-5c362c0e15d9",
              },
              {
                id: "9a90447c-5d6f-4748-b4a9-a92e8baf881a",
              },
              {
                id: "43ff0cbe-167f-4430-936f-a942e805f42f",
              },
              {
                id: "3d7e8343-1046-41fc-b3b2-017ab9599abd",
              },
              {
                id: "33b9d7e1-f080-4b1e-ab1e-af1826da55f7",
              },
              {
                id: "d00804ee-3c4d-4012-9e96-9294958a8d6a",
              },
              {
                id: "de4ca19f-2601-4e67-842c-e1563fe3cc29",
              },
              {
                id: "14ed1909-0cd5-4b12-bd9d-c8a356e86e10",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "b9d396b2-0bf4-46ae-972e-fcb64f928439",
            number: 52,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "57e9a7f0-7e71-46e7-864f-12972aac3334",
              },
              {
                id: "e2683578-93d3-4cc8-aad8-a2b3e2dd089f",
              },
              {
                id: "8f6c3a04-c291-4d81-a95e-6b14c7fcedb4",
              },
              {
                id: "34aef7eb-f537-467d-98f3-b53f8757fcf3",
              },
              {
                id: "4256aaa1-7b75-4023-8ac3-38744f38c2a7",
              },
              {
                id: "d60f41c9-069d-4e17-9966-8ad864930851",
              },
              {
                id: "1b9be605-037b-47d3-b564-6ae5a2dcba38",
              },
              {
                id: "c4954ed8-2288-48b3-8764-5b927f9d4575",
              },
              {
                id: "f34721a7-eff9-4071-94a6-ccae8e73e36d",
              },
              {
                id: "47801861-cadf-4b4e-a42f-612e6f9cd2d5",
              },
              {
                id: "214cd987-6c5a-4ba2-b9f0-c036434e77cb",
              },
              {
                id: "e4aca4b6-ef8c-43cb-8100-f8021207c36c",
              },
              {
                id: "4368376b-9328-4bde-af92-d747a701bf40",
              },
              {
                id: "958777e9-a7af-43c1-8e33-3f1dd514bdbe",
              },
              {
                id: "e920feaa-fc82-493a-8954-c4674bb79876",
              },
              {
                id: "ae430141-d236-4a02-85e3-4e69839f7468",
              },
              {
                id: "4baa7ec8-57fe-4565-886a-cc86b5604bfb",
              },
              {
                id: "70902742-97ef-4878-99d4-31870a3632ed",
              },
              {
                id: "ffee3e84-7b60-44e6-95fd-d9a3f8de7501",
              },
              {
                id: "d2d56da8-d3d6-41f1-ab20-be1b06d521c8",
              },
              {
                id: "0127ada1-0cba-4eef-a091-cab421159d40",
              },
              {
                id: "8af08cf4-56b6-45c4-b277-77291bf5bec7",
              },
              {
                id: "cacb21f2-7a1f-43e1-8777-35fcadc90a67",
              },
              {
                id: "2c65ccf6-5bc2-4773-8bcb-dce0ce7324c3",
              },
              {
                id: "160334ad-7dd5-4e6e-a092-c8fd429ab9a5",
              },
              {
                id: "e854187b-3560-4e17-b14c-e9f5acb0ae67",
              },
              {
                id: "bb6319b5-e23a-4f6d-b04b-b4dcc5221d52",
              },
              {
                id: "36ed3ad8-1e68-4ce4-a77f-92e0fdfd02f8",
              },
              {
                id: "1aab91f0-ac38-42df-8523-1f627614e06b",
              },
              {
                id: "95f2c0ad-6ddd-4bc9-ae4c-ffa4b6145f66",
              },
              {
                id: "84a4f58b-b594-4a4f-8d4d-4b0a722a2475",
              },
              {
                id: "e6531e47-acb5-482a-a5dd-a730734d8017",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "8d2ee6f3-cd3a-4de0-822f-0ef4c4ebab28",
            number: 56,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "189ffc96-4e86-4326-952b-4daa6a3e9ca8",
              },
              {
                id: "72bdece9-a3d4-4098-bc19-662d53e7917a",
              },
              {
                id: "eb28b9ae-1043-4b89-8cba-665f022a7dc2",
              },
              {
                id: "beea1eb8-c494-4e29-8bdd-8edbc90fd22d",
              },
              {
                id: "26811e53-bc0f-427f-8e80-df027c76b515",
              },
              {
                id: "8bf604ff-dc89-4e91-99a5-a3115f4c1a86",
              },
              {
                id: "be936706-c9c3-4be0-a922-3bf49aa8eec5",
              },
              {
                id: "08614084-8eb4-4deb-9933-3f3e3f0818ea",
              },
              {
                id: "c3e56915-a693-443e-8c3f-2b30fbe945ae",
              },
              {
                id: "f21c713a-35e6-40d6-870f-a0576d7d4661",
              },
              {
                id: "1552e127-f234-46e7-8d9d-e7edd523ce20",
              },
              {
                id: "78a016ce-9a35-4dd2-a568-fbc3c2f9d04c",
              },
              {
                id: "c02afa25-fb1b-4944-bc68-310a35e4a6d7",
              },
              {
                id: "9014b247-9de3-4c80-83e8-586fe6f84632",
              },
              {
                id: "498bb399-e2ee-4761-a92c-9606f041bdbc",
              },
              {
                id: "f5dfb99c-9108-4b5d-a45f-3c63645d5ea9",
              },
              {
                id: "976f7c6b-d93c-4914-8d65-cefe95cf960b",
              },
              {
                id: "587380a8-53cd-49a4-a0fe-9f4639088f99",
              },
              {
                id: "a7bfe6ec-63f4-42bb-8a48-a90778bb6caf",
              },
              {
                id: "698cf550-f5ce-4b5d-9c4e-7547d74a6b6b",
              },
              {
                id: "6d918e73-b65e-4ecd-8007-3a655409c9da",
              },
              {
                id: "6694e8b3-6d3e-43ce-9bbc-e84b6e936592",
              },
              {
                id: "e2ead84a-5300-4f82-a854-334ab0319119",
              },
              {
                id: "2be5cdf6-1809-4954-ab4e-c3e9096a1739",
              },
              {
                id: "70330837-dce4-4703-a9fa-1b3c87384fda",
              },
              {
                id: "93a575f0-ea7e-453b-ae33-14f86bbd79ca",
              },
              {
                id: "a3c2ae50-b726-417d-93d9-5fe3da97c632",
              },
              {
                id: "e83954f2-52ec-4d08-aefc-489dd1b58187",
              },
              {
                id: "7b5b2714-3fe7-4750-8665-456f84fa85f8",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "15796e52-8239-4c47-a690-b35fe780c03a",
            number: 59,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "faff1214-8972-4797-ae5f-e0ba66ada9fb",
              },
              {
                id: "ada843d8-8138-498d-9ff8-3c7381d1a616",
              },
              {
                id: "3aba86d8-aacf-4830-810a-6c816e01ec28",
              },
              {
                id: "2a839571-bf6a-42fa-bfe5-0c641050faf7",
              },
              {
                id: "0afca8a8-3ffe-4c55-b979-ad1b117fb5f4",
              },
              {
                id: "b049e2d6-e3fc-49ff-99a6-e6e06e96c8a7",
              },
              {
                id: "c4614c3e-9b31-4f73-ad86-2ef29bd064c2",
              },
              {
                id: "36907fe1-2b74-45ed-a7eb-fa43902fd4e3",
              },
              {
                id: "25fd5b1a-8201-4821-98b6-2962bec9d6db",
              },
              {
                id: "7acefdf8-ceb8-45cf-adef-ccb0505c541c",
              },
              {
                id: "7fb6a0f8-12bb-4e19-bd62-7a58a8f13b0b",
              },
              {
                id: "24f3a9db-f263-47e7-b7d7-ac420bcb282c",
              },
              {
                id: "fe7d4972-bd79-4268-9ddf-cd1d757f13b7",
              },
              {
                id: "bf4dad30-3da2-41a6-8def-20d9ea256283",
              },
              {
                id: "017abc1a-48b9-4439-8768-0a886131ae25",
              },
              {
                id: "47a30cda-5c14-4b81-b8d7-15467259f4bd",
              },
              {
                id: "c092d26a-e46e-4d44-a56d-db52b4334969",
              },
              {
                id: "43229d49-7b59-4421-a889-f813f5db1d9b",
              },
              {
                id: "a3a4c1ae-b892-4bab-92eb-1b7575d6e931",
              },
              {
                id: "ec5df295-d2ef-4489-889c-52c13fe0928d",
              },
              {
                id: "a4d3a3dc-9ebf-42f6-b44a-097d216991b7",
              },
              {
                id: "cd860e12-0660-4a04-be2c-624b4fac6cc9",
              },
              {
                id: "049c3b25-8670-4797-95f1-ea6f96c75161",
              },
              {
                id: "123a8440-251b-428b-bc54-a1a60d6eeb2c",
              },
              {
                id: "cfdf254e-15a4-47f0-b55f-7ee807b9281d",
              },
              {
                id: "0231c26d-edf9-47ca-b556-e2e54784abd1",
              },
              {
                id: "0cf8b88d-494d-4509-8fa5-c5780baa9f00",
              },
              {
                id: "1585a025-cffb-4072-9fe7-2167dfca7bce",
              },
              {
                id: "9968d97c-1574-4114-8267-f4d7e366a495",
              },
              {
                id: "556cc995-f9e3-4e2a-a4d3-8b56ced75279",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "3abcc0f4-ba56-4dcb-a091-0f340594eb79",
            number: 62,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "876fbbc7-bf74-4a45-b15f-604b80e1695a",
              },
              {
                id: "7ea6178c-67a2-4e97-b46a-4336c5cd9169",
              },
              {
                id: "7f89f543-b9f1-4094-bae7-daf94a98048b",
              },
              {
                id: "2d511b28-d79f-4d74-a129-c25447fd849f",
              },
              {
                id: "2340039b-0f17-4282-8845-b879744a46cc",
              },
              {
                id: "e33426ba-0781-4c9f-b841-76cff9f46442",
              },
              {
                id: "aa8a1dfc-d83a-4481-a1ce-4f75b059cf11",
              },
              {
                id: "8d2185c9-30c4-41cd-a6da-1d4a4e70634a",
              },
              {
                id: "f0bde984-e4b7-46a9-ba18-1326084544a3",
              },
              {
                id: "ef95e5e5-0bd8-4e48-b637-0f5c7e947882",
              },
              {
                id: "dc7352e4-f8c3-42d2-b27c-57aa272758cc",
              },
              {
                id: "67a772e8-176e-42f5-9f75-c73ce6762fa6",
              },
              {
                id: "9d8b6ba0-0ef9-4842-9a33-19d903e39d45",
              },
              {
                id: "f17439cc-3e97-46d1-8964-d24206d9df99",
              },
              {
                id: "01e7ec7c-31fa-4a42-87a1-dc593fe9afc2",
              },
              {
                id: "ceb276e0-55c8-479b-9d08-bec51ccc5a27",
              },
              {
                id: "f1e5024a-5cc9-48f2-8474-b4c3aaa474c5",
              },
              {
                id: "ba261872-ee50-412f-aa08-1fd187e584fc",
              },
              {
                id: "a5221dad-b1b3-4bfa-9f70-decf1eba6516",
              },
              {
                id: "ef4bf8b2-ea10-4905-9d7c-5fc5bdf96e74",
              },
              {
                id: "281e7a9e-48ba-4ed4-b264-407ad52a062d",
              },
              {
                id: "16783df0-035c-42c0-8aaf-c1795acc192d",
              },
              {
                id: "0aa88751-2668-4630-8e4e-1346bd9603fc",
              },
              {
                id: "7820a451-e3b3-4427-821e-7348153ea4f4",
              },
              {
                id: "512ffe4c-d031-4b93-9456-16bf852ba856",
              },
              {
                id: "0d8aa13d-32ae-4649-91a1-8341d47f3182",
              },
              {
                id: "18b20154-7447-4086-aec6-837ed47ca43f",
              },
              {
                id: "6ce72874-4a90-4846-aaad-e284387253fe",
              },
              {
                id: "f076dfe3-1603-4ac7-941b-54ee284b9ce6",
              },
              {
                id: "f2cba552-49fe-4968-983d-1f40a7461f88",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "6c7dddef-8954-4790-b31b-f686ee2a34c5",
            number: 66,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "55547a53-cb63-4e83-99c3-eda37fa27c28",
              },
              {
                id: "34be5b63-7dcb-49cc-9930-b7929911935f",
              },
              {
                id: "6fc2cd85-3a89-4396-94b5-1c8134e58cec",
              },
              {
                id: "82cacb73-f00a-4341-916e-29db637d1e0a",
              },
              {
                id: "6449da64-c463-4c37-993f-646929380818",
              },
              {
                id: "f1482dec-a65c-446c-9af7-9d7d2fece02a",
              },
              {
                id: "8c61de5f-a40b-4328-8826-78c1f57f4b88",
              },
              {
                id: "e890c264-86ff-475a-9fb4-0e2f421301cf",
              },
              {
                id: "b7481aff-df84-4a79-8203-146ba86b1ec1",
              },
              {
                id: "6310bdb3-ac85-4742-b130-325e8e7afb5a",
              },
              {
                id: "ac1c92e0-5f0f-429f-a093-ec77e98782e7",
              },
              {
                id: "2b8b7903-5c19-4350-ab0f-b31addddfc04",
              },
              {
                id: "268d1abc-80bb-456f-9f84-fb2a407e56ad",
              },
              {
                id: "d6d6e851-308f-48bb-be77-c9590c065163",
              },
              {
                id: "5bc94a27-28e9-48af-b1e2-fdc1a7aa7dee",
              },
              {
                id: "9b9db078-9616-4fca-aef2-5e6d36b10ecf",
              },
              {
                id: "57c1a4ec-1ef8-429a-80e8-96892cca898b",
              },
              {
                id: "6b9bc0a6-309b-4f99-bf3a-d8916d78c996",
              },
              {
                id: "6d9b1601-0094-4774-a776-adcba67083c8",
              },
              {
                id: "c1838a11-5171-4b2b-b2be-01411f2b203a",
              },
              {
                id: "ce18a66c-91ca-4fdc-862e-18990d156e66",
              },
              {
                id: "51095e6c-988d-466b-81be-72964bf287b4",
              },
              {
                id: "c42dddb5-feaa-45ee-aff3-eef271fe3d38",
              },
              {
                id: "b3a50d3d-7888-4650-9db3-9842d9a1704f",
              },
              {
                id: "d7cb411b-a01e-46b8-af21-9cb12abe6391",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "3536e97b-e19f-483a-8683-f69a3cd34645",
            number: 67,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "e78acb93-0ff1-45bd-87e8-f1bd148bc906",
              },
              {
                id: "7e4149d5-648b-4b74-9dcc-ab2ce54fc6c9",
              },
              {
                id: "75076027-48bf-47ef-8e27-52b8e88d4a3f",
              },
              {
                id: "513bfd56-ad15-4dca-8966-4d933b555a0d",
              },
              {
                id: "89ab6663-e109-45bc-a475-3dcd525aaaf4",
              },
              {
                id: "e9b4b66d-206a-432b-a041-23cb679616ea",
              },
              {
                id: "ec5ad09e-d176-414e-abc4-09c60b953926",
              },
              {
                id: "131809ce-5b5a-4d4c-9ffe-fa04cfa15d53",
              },
              {
                id: "067f7522-2da1-4e9c-9b01-d106d5812a90",
              },
              {
                id: "6a663135-7a77-4449-b74d-2842d7729c5b",
              },
              {
                id: "a3e168cc-ceb4-40b4-90a1-48373d332538",
              },
              {
                id: "7de2648c-2792-4824-9fee-e639e19b3bc6",
              },
              {
                id: "b0fb97ae-027a-4909-ab93-d9208b627e6b",
              },
              {
                id: "d041614d-4283-4e9f-855f-ce7ba7740e23",
              },
              {
                id: "ec41f2ec-b4fc-4f3c-a41e-907256431a85",
              },
              {
                id: "ffd10644-8b34-425e-8856-dde5d821584c",
              },
              {
                id: "9fac2a14-3bd8-4a7f-8165-68d3bfb66497",
              },
              {
                id: "d71441da-e13e-4128-8eaa-107ffabd48c2",
              },
              {
                id: "807c37d4-9be2-4df3-afaf-2d6a64ffae70",
              },
              {
                id: "9de41155-d2f1-4291-82a1-81a65d6876db",
              },
              {
                id: "0d5a4b15-886b-49bd-b4d8-224b3285a6e3",
              },
              {
                id: "05adf90a-6890-42b0-9949-df38848bc097",
              },
              {
                id: "f2bdc621-254d-4128-ba27-9b301eceeb39",
              },
              {
                id: "c11f71cd-6561-4d58-84d5-2dd76f1486e0",
              },
              {
                id: "0387559e-4e02-4af8-bff8-afa66fa20bf5",
              },
              {
                id: "ba314a58-ed1e-4191-85bf-8ff1933d9509",
              },
              {
                id: "9ec21f7b-68f7-470d-8600-5ac2653fa359",
              },
              {
                id: "313a01e1-524c-4320-ba01-e899d154bfd3",
              },
              {
                id: "5cd23cbd-13dd-4e35-a342-d4d0ab0af859",
              },
              {
                id: "10e2f4a2-645d-4fd1-8769-d2af6946060e",
              },
              {
                id: "25facacb-170c-4e9c-812c-810b5a6806eb",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "7565e048-7955-4d2f-b7a4-6ea4afac9e9c",
            number: 68,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "cc0b5b7e-0673-4a75-b84b-193b4bb54a6f",
              },
              {
                id: "e5aece96-22df-4207-b73b-153f659d1bd3",
              },
              {
                id: "b3c2b21a-11a6-48c5-a3ce-a866fb638123",
              },
              {
                id: "11c9f5e4-53fc-4693-9c3b-5eff8932ba5f",
              },
              {
                id: "783421be-d2bf-45eb-b458-dd952117ec04",
              },
              {
                id: "006003a4-e3f1-4b35-a3ac-a5e81798a738",
              },
              {
                id: "1347ca79-e5ff-4a74-b81e-b5b32d80284c",
              },
              {
                id: "c8ac8ba1-aacd-4bf1-b4a5-5726a2e0e066",
              },
              {
                id: "9a9cf445-ccb0-4802-b61f-d32f06c82250",
              },
              {
                id: "31dd3b22-bceb-47e6-a5fb-5d25dfbd784c",
              },
              {
                id: "b273f53d-fbe4-4a4f-9d09-1567ac999b25",
              },
              {
                id: "f5c73c87-cd60-4fc8-8061-4d779116753a",
              },
              {
                id: "8db9dffe-eb10-4959-9fc5-df310ee7399d",
              },
              {
                id: "02397f59-d7b9-4f78-8583-adafd560e781",
              },
              {
                id: "695bdd11-ea49-47ef-b79d-2df91e447ff8",
              },
              {
                id: "2afdc1c3-1db0-4beb-bb15-b3856cc66bf3",
              },
              {
                id: "9adce4d6-164c-4503-8df6-23d062ac4430",
              },
              {
                id: "24a923ea-ce0e-470a-9776-7c06c2bfef2a",
              },
              {
                id: "c7628919-bd7a-4e76-9a39-f02765f5f9b0",
              },
              {
                id: "bd4b1aef-cc9a-4197-80cc-f5328495ba76",
              },
              {
                id: "089adecc-54f0-499a-9277-9e8fc6242e5b",
              },
              {
                id: "1557714f-fe95-4f02-97cc-97dc6b5e43ea",
              },
              {
                id: "0037dd00-8955-4965-a8af-7fa3e74bcfe3",
              },
              {
                id: "70a73a41-6c88-45b8-8bb6-d57346822b85",
              },
              {
                id: "0a4584ef-af75-4a2d-8c13-db5bb56e859d",
              },
              {
                id: "ab7fcc3f-5235-4ccc-bc35-027c7c328d88",
              },
              {
                id: "7bac5b70-7de9-4730-95f8-4f7e64886afc",
              },
              {
                id: "15b2f641-19b7-470e-84e9-f7f627fb0934",
              },
              {
                id: "b5128ffe-9a10-48ab-9bc2-e579941aa093",
              },
              {
                id: "b18fc7c1-c50d-401c-89b5-74ae8beb8604",
              },
              {
                id: "bb2bce97-fbb5-45a1-91c5-bc4e989bad28",
              },
              {
                id: "f61f7a91-d58d-4a5e-a6c7-86f00e81302f",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "41f999a6-d592-4e21-93a6-f8f32ae4d88a",
            number: 69,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "bd7c19f4-17ce-4716-bc27-9ec3841b4fb5",
              },
              {
                id: "1af7b6ba-4153-4e2f-a340-ad952ad1c45b",
              },
              {
                id: "e77ebb91-283b-4fb2-ad39-a51456f98cfe",
              },
              {
                id: "4244f855-4b54-46e0-86c9-65f4a112125e",
              },
              {
                id: "bbe87b4f-75e9-4e84-a8e4-18da1f7b4227",
              },
              {
                id: "025b1c2e-eeac-4389-80be-bfcee5e3978a",
              },
              {
                id: "e28ef2c1-b821-442f-a6e4-7e425d144e8e",
              },
              {
                id: "5e5309f1-3736-4d29-b6c9-21fc49793b4c",
              },
              {
                id: "af78d621-d97e-4922-b2f7-71a69085a0ff",
              },
              {
                id: "bb396693-0a56-42c4-8857-8882a1167450",
              },
              {
                id: "bf78546a-d955-4313-9e05-e2990ad6d4bb",
              },
              {
                id: "f9c0ed0f-6395-498c-a282-10e3143b1c62",
              },
              {
                id: "5d48a4a7-d2db-4b30-9729-e100cedbb9d4",
              },
              {
                id: "7636497f-9d7b-4075-98ff-b1672d215e59",
              },
              {
                id: "95336f3a-2b27-435d-8bbd-5362daa2d703",
              },
              {
                id: "aef6f9c5-22eb-4c70-b59e-f887f5d2897c",
              },
              {
                id: "999802fb-59a0-4c47-8367-7365c578d1a7",
              },
              {
                id: "5fa120a2-a295-4be1-b6cf-aca073bc4e25",
              },
              {
                id: "6812af7d-0a4f-4927-9e82-5fe6ca503357",
              },
              {
                id: "f7a080ea-5600-484a-8f7f-1a8287b57b72",
              },
              {
                id: "093a1394-9da0-46dd-ae88-843ee26ba07a",
              },
              {
                id: "841f4a6c-073e-43c9-8a73-7dff7381ef93",
              },
              {
                id: "1726b463-1db8-455c-81ef-bdd4a4371a17",
              },
              {
                id: "07f7b56f-2a84-41e8-8034-06626b712b61",
              },
              {
                id: "e7209a72-a5db-4166-8f21-78326ffbfc0a",
              },
              {
                id: "f2f41f59-b414-426c-9f64-13d63096269d",
              },
              {
                id: "7ad79c16-9127-4f98-a286-4fe61307c638",
              },
              {
                id: "66a2d1d4-f8e9-4bef-9f3c-cf503548f942",
              },
              {
                id: "b85254e9-fd45-4887-807b-53d0fde11282",
              },
              {
                id: "47341911-abd2-44bf-ba00-ad230721110a",
              },
              {
                id: "42865474-66fb-4403-a8d0-e18572576b8f",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "f03c12d2-3a06-4666-ba2b-ff4992754a98",
            number: 70,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "fb2f0028-0a40-4c0b-8f59-e2ae8a32f576",
              },
              {
                id: "84a04803-cab1-438d-aa53-0c1156e39edc",
              },
              {
                id: "0f659b57-2de2-45b8-af26-09f376e197e5",
              },
              {
                id: "adea69c4-87b1-4e15-9b12-71c4f242bc03",
              },
              {
                id: "91001592-0880-44ff-8e72-1ca6b0b3d009",
              },
              {
                id: "b9564f1a-ceca-4786-8839-3ab56c3821d8",
              },
              {
                id: "0569bfee-411d-404f-a87a-3999edfec502",
              },
              {
                id: "55567bf9-c052-467e-ae7c-af71c857a571",
              },
              {
                id: "6cf188b7-8249-40ac-8e8c-79229e84e29a",
              },
              {
                id: "053cdef8-d11d-4e26-b912-6bb57a1c4c1c",
              },
              {
                id: "686416b7-e651-452c-a342-8a58f6c4985e",
              },
              {
                id: "6ac55941-42bb-4aa8-a3a9-a469428d3942",
              },
              {
                id: "6b2f92fd-5b49-4809-9e7f-0af17a431ae9",
              },
              {
                id: "60e80dcb-bc0f-4d16-8f5c-c3b3766f2bb5",
              },
              {
                id: "1c5de32f-6e07-42d7-9f0a-cad89d78b5fd",
              },
              {
                id: "8edf61a9-19d3-4161-b9c1-000b54979135",
              },
              {
                id: "04019a62-9d66-4c33-8f87-d1043d4cab46",
              },
              {
                id: "4d524bc5-e74e-4b09-9180-02146c4b6768",
              },
              {
                id: "a6325a4b-2778-44ee-9773-08754ec412f2",
              },
              {
                id: "20583722-e1af-4e5c-8e75-3cbe4aa410a0",
              },
              {
                id: "80b78c8b-1953-482e-87d7-a3b675238e92",
              },
              {
                id: "acc3b3cb-e3d1-44ec-88d5-c4a991bdbaaa",
              },
              {
                id: "bc2dfe05-1eef-465f-8961-5afb6780169e",
              },
              {
                id: "3689a104-e9a0-4ae9-977f-52ec5896bf2f",
              },
              {
                id: "b02aaf21-5e68-496f-9697-ea64d121aeeb",
              },
              {
                id: "bd3e5837-95a9-4a78-a905-3818bd31bfbe",
              },
              {
                id: "960ced4f-260a-4e15-843b-0cb9511904ad",
              },
              {
                id: "ad6a9c87-3da9-4f89-ab69-cb2ece846a68",
              },
              {
                id: "13e504a0-7e0e-4628-b206-7c2349fc1744",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "f9d60949-2d4b-430d-982d-2adb0ba988fc",
            number: 71,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "0e15b09e-626d-4eb4-a1fd-7253801ca528",
              },
              {
                id: "b001a081-5044-4909-8549-01f5f864a4ce",
              },
              {
                id: "66ccae56-8ef4-4834-9851-745c29e73506",
              },
              {
                id: "6ce07e19-b905-4d21-afd7-29753a880af9",
              },
              {
                id: "8ffef3eb-e19f-43ce-849b-fc42bcc1ab65",
              },
              {
                id: "223b92f7-f38a-40be-8512-5b627bf3cdae",
              },
              {
                id: "6efc7ad4-cfd7-41f4-8d4c-2c0883bca197",
              },
              {
                id: "5a703506-d308-4bec-91fd-49eda64e303b",
              },
              {
                id: "10317483-cb25-40fa-92b2-51bacc520bf1",
              },
              {
                id: "4db1858a-4bee-4042-9cc0-77fbb8882528",
              },
              {
                id: "2c3ef0ec-c442-4fbe-a476-c3be7b4d528a",
              },
              {
                id: "d0b0a9f4-8b18-4a76-ae6c-2a2b09a6ce75",
              },
              {
                id: "bb3febb5-d53f-4f83-a740-71d8b3708ed8",
              },
              {
                id: "fdb93f60-ed46-4de7-bb3b-b46d678b343a",
              },
              {
                id: "7b4a4529-7c5f-4fb6-aed4-b8e06015303f",
              },
              {
                id: "cdfd60e2-9f2c-426a-a127-8e3e164d5266",
              },
              {
                id: "806d56ee-adf5-4927-9a24-440b2b9caba3",
              },
              {
                id: "8a2eb0a8-91f9-4deb-b579-ad2acf28a13f",
              },
              {
                id: "d665f268-dc39-48bb-9f4b-20a59b24c7de",
              },
              {
                id: "53516132-d8e5-4718-9599-69bf4aa219f4",
              },
              {
                id: "8c9be53e-6c28-4e08-b04b-88981cba4f48",
              },
              {
                id: "41ffcd9d-9544-4333-b9e7-cdb994008cf9",
              },
              {
                id: "382d3f07-8367-4bb4-8d30-de3df73238c7",
              },
              {
                id: "b4619010-571b-4152-b6ac-be3c7193c756",
              },
              {
                id: "0bd18291-d64f-40e6-b83c-8ef73433f628",
              },
              {
                id: "3f97c1f6-030d-4536-8dc5-c7a24bfc205d",
              },
              {
                id: "27d6252a-1095-4b56-b92b-333d596b4cee",
              },
              {
                id: "72b224e0-fe3e-4285-9a67-6385a1de2df5",
              },
              {
                id: "368825d2-fd7f-419e-afb1-5dee18689144",
              },
              {
                id: "13944296-0bc3-4776-ae36-ac56e0ecb669",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "02a78dff-8cc7-4123-ae8b-b0a2864c2386",
            number: 72,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "c75499be-304f-4293-ad0f-8ed93a063870",
              },
              {
                id: "6ae797f3-3717-498e-8634-8c23b90bc0f7",
              },
              {
                id: "ab412d31-ae75-4e6f-b156-ac66a3517bec",
              },
              {
                id: "6e137f25-d776-452d-ab6b-7ebf7309de0c",
              },
              {
                id: "8a571532-32c0-453b-8de1-a80f0f9418d1",
              },
              {
                id: "c9739351-c081-4e0c-934a-e249f74e1d83",
              },
              {
                id: "a5c15ecd-4e91-4603-a384-dae99c5d6cc9",
              },
              {
                id: "a1cfd04c-a49d-4b31-9daf-a2e81306e632",
              },
              {
                id: "878aa7a5-3528-4d8d-9671-3f428ff90403",
              },
              {
                id: "00b48708-81b0-46de-9fe8-a735d7f2ce8d",
              },
              {
                id: "ed415885-eeaf-4767-9d61-59095d6d6f8d",
              },
              {
                id: "17315c98-e1f2-4b0f-b30f-a80911a9e9a6",
              },
              {
                id: "f06bc004-dfa2-4c03-a425-a5b331559760",
              },
              {
                id: "7eefd904-8f52-4df4-b482-5a56a6aeefe8",
              },
              {
                id: "9b6fb7a7-b2de-46f6-a97b-c0a5ed125493",
              },
              {
                id: "10f25f75-fd26-4fce-95d8-2a5dc37199de",
              },
              {
                id: "cde29de7-262f-4f1e-b352-4dcbba5f032c",
              },
              {
                id: "8a487cfb-eaab-4784-aaf1-698a7da525ab",
              },
              {
                id: "fe9611ba-0f5d-4030-9eb8-75927569645f",
              },
              {
                id: "176abeb6-370a-424c-ba2f-3d0d6ccf6aaf",
              },
              {
                id: "ca3bc89d-7c37-4b5d-ada7-63762ba628a1",
              },
              {
                id: "fc1e7ec1-0660-42d0-b1e5-085fae614571",
              },
              {
                id: "d49e1447-0c2b-4b10-9e28-cfd5756a6a0e",
              },
              {
                id: "1b8263ab-a527-47d9-bea2-11f921f2c464",
              },
              {
                id: "235ee3cb-f36a-4076-9383-785ea2c7b8e2",
              },
              {
                id: "e1313368-6955-4ee4-8499-e671ce19c0e0",
              },
              {
                id: "d588de6e-a73e-4758-937d-3e8c5a4d9683",
              },
              {
                id: "e7081ef7-5ba6-4a1b-88f9-c65bb2a72360",
              },
              {
                id: "42429816-e6a4-49db-98e8-7ceaaa39c6f9",
              },
              {
                id: "432be77c-9b68-4c3e-974b-be6525ad5f4d",
              },
              {
                id: "482f8b7b-83e0-4275-98a4-5105b3b7584f",
              },
              {
                id: "ded89513-625e-4412-a075-f8c379220eae",
              },
              {
                id: "e4d98293-0d10-4711-b2eb-5964915d2850",
              },
              {
                id: "ae1bcfa6-294b-40a0-8001-47126c1d8874",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "4d4b7f89-31d0-421c-96c8-e76dc9cdd761",
            number: 73,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "e0dd2e91-d34a-4864-ad7a-832bc34312e9",
              },
              {
                id: "0980e721-b8a2-4522-99dc-5c71a94f7130",
              },
              {
                id: "ef90782c-2b41-47d1-8a28-41d9b44bb572",
              },
              {
                id: "5b535481-46fc-4d3b-b2fa-23c03a35803b",
              },
              {
                id: "23a53919-84cc-4e23-9a4f-ad599cec32df",
              },
              {
                id: "28de034f-54be-4188-826a-9f8e5c843670",
              },
              {
                id: "f313a127-9ebd-4892-8232-d1f55c1243e4",
              },
              {
                id: "d09a2b7a-89fe-4dd1-b267-9f847f6b2aac",
              },
              {
                id: "baaf32d3-0f63-495a-be8c-6429eb581900",
              },
              {
                id: "5e552f90-22d0-466d-a6f5-f018beea7621",
              },
              {
                id: "07f92cab-5f2b-4803-9ed8-a1c105e48801",
              },
              {
                id: "d0989913-ce87-4c2d-8c6d-b67c743ff823",
              },
              {
                id: "648b59e9-e5cf-4b8c-9262-6c1efd83ef48",
              },
              {
                id: "5c6499f4-6ecb-49d7-b516-a0ba4e4d232a",
              },
              {
                id: "4c82b709-c984-418c-bf04-0ba6e400148f",
              },
              {
                id: "81e24a90-e1f4-417a-a476-15bd4572dc42",
              },
              {
                id: "b9a944ce-f762-4afb-88ee-3df2a61afcad",
              },
              {
                id: "7a20925e-b71c-4a9a-ac4c-5e4f1da76971",
              },
              {
                id: "6ff1e5de-77af-4c2c-a26e-2be22dc67eb4",
              },
              {
                id: "96e3ce6e-8127-4b7d-8a8f-add56e9b52a4",
              },
              {
                id: "987f5170-2c26-4518-a3bc-ed04d9e75355",
              },
              {
                id: "6611d622-38f8-4d5a-9400-183cc428b5e4",
              },
              {
                id: "e023f48a-d300-4cf7-b1cf-e278765c5ee1",
              },
              {
                id: "109e2ebc-6e58-46b6-b553-fc6ccca15c52",
              },
              {
                id: "de787952-bc36-435d-9117-e5168fa46b5a",
              },
              {
                id: "088ce708-29db-445a-bea7-93c2f1aedd65",
              },
              {
                id: "0e1fc02c-2216-49e7-addb-e2180613d034",
              },
              {
                id: "c8481165-e396-4745-a939-633ef00d0517",
              },
              {
                id: "620095b5-6916-4042-9f90-83cafe4e75c1",
              },
              {
                id: "9c251d74-2c7c-41ae-b965-f4e63eedd035",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "96cadd5e-77d3-43ab-83f4-ef5faf850e4e",
            number: 74,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "d43cf2ab-920b-4e30-9ebe-8d7bb2948e0a",
              },
              {
                id: "34d1f90f-0b69-493a-a607-ef249984c2da",
              },
              {
                id: "59313c48-4b54-4694-907e-e48581a02aaf",
              },
              {
                id: "78519b32-7ffc-45fc-a4e7-c94fc56f15e1",
              },
              {
                id: "1ddaa551-fac4-42b8-b3ee-5c10bec2a205",
              },
              {
                id: "9574c2d3-e1d1-49f9-be7e-30212afb8319",
              },
              {
                id: "765d2303-1d2f-4e31-9bd3-bc74d13d4761",
              },
              {
                id: "9fd72952-e3ee-4806-a176-eb23cbf9948c",
              },
              {
                id: "ed3ff608-cce2-496d-ba33-905892d47fbf",
              },
              {
                id: "fc98b18a-0021-4adc-8d7d-dbc7c3671d40",
              },
              {
                id: "f4feaace-27dd-4206-b6ea-51fc68947fc1",
              },
              {
                id: "06ac535b-963e-4da6-9140-2b87c6750e93",
              },
              {
                id: "e9e1262b-93b6-4ca2-83b9-2631b6aec9ec",
              },
              {
                id: "9ec81dff-5d9a-4ef5-a7cc-c3b74cb3791b",
              },
              {
                id: "8afafc65-9777-45d6-9606-7e60f6a174f7",
              },
              {
                id: "52a1e503-e2e9-43d7-9937-1e77bb986f2e",
              },
              {
                id: "3c47d4c2-8a93-4c3a-b5fa-2f8e224cbbab",
              },
              {
                id: "50c82416-5739-4827-ac40-a3cde6e0609c",
              },
              {
                id: "911b85a7-1162-428a-960f-dbd743e3756e",
              },
              {
                id: "7167a6af-782d-40f4-b201-b4d79e8e5e90",
              },
              {
                id: "0cc3e5e2-4e19-4f0a-bdf1-d1c7a8bb76f2",
              },
              {
                id: "31ef7038-5b2e-4fab-93be-033cbe776063",
              },
              {
                id: "5345f4db-e5b5-4925-b33d-545867a22f95",
              },
              {
                id: "752ea01c-0813-4c96-861a-05546d1dcc98",
              },
              {
                id: "b5d2dcb0-006b-483c-a372-00e9bc8bd79b",
              },
              {
                id: "b0b00884-d43f-42f4-8365-1d12332293f1",
              },
              {
                id: "bb935394-0e32-486d-a93b-56d2985e9beb",
              },
              {
                id: "f1a5f1c8-c066-4023-b80a-85a5800a81dc",
              },
              {
                id: "4f4e2f44-c0f3-4cf0-921e-d053fe33754e",
              },
              {
                id: "c40cbf49-8d96-416f-80ef-2ecc84e161d8",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "9e353ba7-931a-4fdf-92e2-c56dc27c0af4",
            number: 75,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "e320e0dd-1ebe-4ba9-96cc-12e9a2a8ecfb",
              },
              {
                id: "1d895bbf-6375-4919-9768-02a490148c47",
              },
              {
                id: "bc0ddf3f-e78c-40d0-84ae-bed5ca268c15",
              },
              {
                id: "4e7fa037-5d9c-4619-b4d6-d099afc32889",
              },
              {
                id: "29c6e686-7ff6-48ad-bb81-04f1d0b00a39",
              },
              {
                id: "073c0120-4dfc-419f-95b0-8beeac919931",
              },
              {
                id: "d35d1a29-804b-42c1-9809-fba276502815",
              },
              {
                id: "1c3c956d-f305-4415-a4b2-7c1fd09772e9",
              },
              {
                id: "29f3ac62-9fe6-47f9-98ff-7757e009b72f",
              },
              {
                id: "f9b62fe2-5610-4780-9ec9-ebabb21331d4",
              },
              {
                id: "f9b8929a-fd9c-4677-9857-40663a0a7c08",
              },
              {
                id: "07a14cc7-92d0-4864-b89b-05e10192aae4",
              },
              {
                id: "33615e28-788c-4314-8d12-667970cae955",
              },
              {
                id: "e816f876-97e9-4123-a09b-0f4fc0fd32d6",
              },
              {
                id: "2e967410-0865-4228-a862-ef9611aafadc",
              },
              {
                id: "6f96609f-8536-4bef-895f-3ea998089460",
              },
              {
                id: "47b92cf7-8d32-4a1b-a4fe-05071152fbe6",
              },
              {
                id: "55edb610-6655-4e2d-86d7-cc4eea6ebad7",
              },
              {
                id: "36af2412-94fc-4f7e-854c-66affe3194e3",
              },
              {
                id: "d3c84417-ec42-4d8b-bf42-fac503688655",
              },
              {
                id: "c9e32a6d-f90e-4f52-b8ef-6fcbbbab6e17",
              },
              {
                id: "3a3989a5-a115-45d1-b2af-af3f7c5c667f",
              },
              {
                id: "69b95106-d293-4358-938e-23252a75c4fe",
              },
              {
                id: "dc2293c5-4eec-40e1-bf5d-80a96205aa0f",
              },
              {
                id: "75ccb2c0-281c-4ce0-bfa1-6183b71e8104",
              },
              {
                id: "d828cb7f-4684-47db-a1f7-7d6a8d034404",
              },
              {
                id: "7e462613-ddaf-40ba-9c98-b7390aa27533",
              },
              {
                id: "32bb6200-bc3a-4149-a2a4-db97109f3cb9",
              },
              {
                id: "923c76d8-7628-4427-b097-1efc89260de8",
              },
              {
                id: "90e13c25-ced8-4b32-a196-018631d1ed25",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "7c10236a-d80f-4c54-9feb-bce3d9d6f794",
            number: 76,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "4cd7c760-9f36-4e74-a0c0-2bf18809d246",
              },
              {
                id: "af2e3650-ad76-4254-b4ee-f74f4a433cb7",
              },
              {
                id: "31719337-40f4-42f0-8403-7cd1f04d1dd9",
              },
              {
                id: "827c334e-7957-4326-8520-24d31cc9140b",
              },
              {
                id: "19a2e1b8-85b4-4ac4-8181-1c4e12a522d3",
              },
              {
                id: "0c155590-e487-415d-a605-75f9fb703ed7",
              },
              {
                id: "a2a1810b-6b8d-42b4-a544-a2341a88d0b6",
              },
              {
                id: "94ab2dd3-90dc-414f-97ba-f08c42829b4c",
              },
              {
                id: "6b29d2b4-87f2-4a42-b6c3-7bc34c1279a0",
              },
              {
                id: "3d65f9e6-fe66-47df-900e-c7223fd5ca4c",
              },
              {
                id: "57e5c6a2-6d54-4f2e-875b-1df952b7db39",
              },
              {
                id: "1c1485c0-b712-4434-aa5b-14905f9ad0e1",
              },
              {
                id: "c157d33f-8faa-4b1b-8999-e6e2485f85c5",
              },
              {
                id: "097cbb10-c05b-4791-b052-eee3ef8d8d70",
              },
              {
                id: "07beeb29-a645-4779-b752-e1c787bbf7bb",
              },
              {
                id: "a644d53c-fa05-4b36-907f-87b774a86d09",
              },
              {
                id: "39ad2012-59eb-41b4-96c7-005f03384123",
              },
              {
                id: "f483c5c5-fabc-4b1a-bee5-b1328da0b10e",
              },
              {
                id: "8a9c6e8a-19e4-44af-a868-3e19f900edb0",
              },
              {
                id: "bfbfe249-df4c-4541-9b4f-4963d8933e20",
              },
              {
                id: "b9810b7a-30ae-40f9-815f-259771d831b4",
              },
              {
                id: "92fd89f6-14f7-4e45-b411-0491065484ff",
              },
              {
                id: "d335ebe5-8581-434a-8ac8-34f573ad8df8",
              },
              {
                id: "b37402a6-f895-49b3-b6fe-27ad63322cab",
              },
              {
                id: "925f3075-e6ed-4e02-8928-7c66e13f8b3c",
              },
              {
                id: "0cf70c3f-7ba0-4e74-b51e-2e488c7c7ad6",
              },
              {
                id: "60b28703-18b2-4c70-822c-d9d2b284616b",
              },
              {
                id: "d5bbc4b5-5483-4cdc-9c93-5ec83fca7fa7",
              },
              {
                id: "5ec2e745-ceb4-4084-8d29-63292605c037",
              },
              {
                id: "f451276f-6078-4445-b977-ebfe787b2159",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "825f0add-e384-45a0-b12e-e91a5bc2ba49",
            number: 77,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "e91f1946-0bdd-407d-8ebc-c1bc6a401b37",
              },
              {
                id: "f2dcaa5b-e087-420a-bc28-d4960c6d4cd5",
              },
              {
                id: "45264126-4743-4221-a31f-1a270857bdee",
              },
              {
                id: "91014738-f04c-4af5-9c9c-c8e26be67c66",
              },
              {
                id: "07fac321-fd13-45f3-9f07-0c980382e3ea",
              },
              {
                id: "3787dcd8-7649-4d31-944b-ee276218edb6",
              },
              {
                id: "5641ecb5-f746-46cf-9f30-e03a75a05b5e",
              },
              {
                id: "5999eff0-a15e-4044-b7bd-6f587162eaf8",
              },
              {
                id: "0ea006b6-b1c7-40a4-bce8-3f325c1f83e5",
              },
              {
                id: "e593d11b-f30d-4c95-aa2f-e7f8e5d01eca",
              },
              {
                id: "4ae78bab-f7a1-438f-8177-a7f79df367cb",
              },
              {
                id: "13d46cc5-15d2-4d5a-b435-ffd49c803694",
              },
              {
                id: "5c55b533-9b2b-4d2e-80e2-72d825240b0d",
              },
              {
                id: "5cf7714c-fda7-4712-a078-72b5350c286b",
              },
              {
                id: "7d80f24e-fd57-4972-ae79-ca602f7542a6",
              },
              {
                id: "ca367fb3-08f2-4beb-bb5c-5a8ca7c9e7a4",
              },
              {
                id: "5ff78c17-2613-4c71-bae6-c07fc8d8a966",
              },
              {
                id: "9fcab15b-fb18-4d83-baa0-8e3a369e0794",
              },
              {
                id: "ffd8b29d-e7a9-42b2-bed7-e8afc8449c31",
              },
              {
                id: "d5ed725d-cbca-4a40-903b-8f488c9c417f",
              },
              {
                id: "276e2cfe-7ab9-4981-8881-34a4ecba8fb5",
              },
              {
                id: "e412529a-f2e7-4dd1-a988-a93f7e611ed9",
              },
              {
                id: "da64772e-05cf-4b5f-9f76-8122e0255f31",
              },
              {
                id: "e352692e-9cc7-452a-afb6-8fe7f434c7a2",
              },
              {
                id: "898e4f76-6e3b-4f36-88e2-b2e190f44df8",
              },
              {
                id: "7fa116fd-9f25-488f-86ad-0690eb32abd9",
              },
              {
                id: "1459251d-3cab-4829-8c5b-eb7deb39e310",
              },
              {
                id: "f6e8b886-2fd4-4086-b486-6f5cd823231b",
              },
              {
                id: "8423a063-4238-4093-9479-8ee743cc711c",
              },
              {
                id: "e1b6a3b2-be1a-4cd5-b3d0-001917f280af",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "5008816d-8cbb-47d2-9d09-5c8cc8ce7de5",
            number: 78,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "65a57435-0484-4abc-bcca-f283e8b3d6b4",
              },
              {
                id: "e9cfb451-8405-48cf-878f-7e072a26e402",
              },
              {
                id: "e39b81f1-3837-472a-b8e1-e0b455dad08a",
              },
              {
                id: "bf694c3d-e4b3-47d6-a4ce-256e55add5c1",
              },
              {
                id: "13ba0b40-dfc2-40f2-8910-7a873940b2bb",
              },
              {
                id: "1c5f3735-e565-47e8-8cfe-b689f08db6a7",
              },
              {
                id: "3ba980e2-6397-4cd9-b9a5-3fa08d851170",
              },
              {
                id: "e46c2306-27d0-45a8-ad87-b586e5b92ddd",
              },
              {
                id: "41c01df9-be0d-4418-b4d4-50719356c871",
              },
              {
                id: "c58d2b90-28e0-47d6-a6eb-3bbe7100ecf2",
              },
              {
                id: "c9f794d7-f9bf-4eeb-8b45-330a56d76a38",
              },
              {
                id: "02bfaa63-cd50-458b-ab7a-0418d845eb69",
              },
              {
                id: "bc81d705-51df-455e-8c57-807d3f6ba282",
              },
              {
                id: "7938b541-89ed-4d34-b225-962068f91fc3",
              },
              {
                id: "9268f222-8ab3-4047-9e72-4669014cda08",
              },
              {
                id: "dc74a542-ff31-474c-9414-d98851fc7ed7",
              },
              {
                id: "9a523a98-ed4b-47b8-9e33-dc91e672bd9f",
              },
              {
                id: "baf4e7f8-1de2-40c9-bb34-066646242ed8",
              },
              {
                id: "8403d75f-f857-4f02-98c4-d32add805413",
              },
              {
                id: "3e77ad75-a121-4c3e-952c-e277634ee75d",
              },
              {
                id: "3b19ac14-0e7c-48a1-a8a6-6c3c202ed7cb",
              },
              {
                id: "79e3dad8-bed4-48dd-8b13-23f04233b982",
              },
              {
                id: "2cbc857d-5b05-4668-beb7-ad06b04f71f6",
              },
              {
                id: "a57bf3b5-922b-450e-8e28-f9b0112081e5",
              },
              {
                id: "a652ecc0-e74d-42d7-8bde-fe76d4434876",
              },
              {
                id: "ee484889-0c77-47ba-ae52-b1c15d1caa96",
              },
              {
                id: "49b077b9-1c8a-4cf8-aeb1-43143c1fb540",
              },
              {
                id: "a27c7ab1-9b95-4aa5-b321-822f577cb8cb",
              },
              {
                id: "860d0b2c-ca1e-4c83-bbe6-5cd4adedaf72",
              },
              {
                id: "075998bc-c115-494d-ba52-bb876311804a",
              },
              {
                id: "d70da2ae-8dab-4aa9-8e08-0db5dbb0f4c2",
              },
              {
                id: "9cb25230-0baf-485a-99b3-bc6dcb887042",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "4449f10c-e733-4d2d-9d0f-0510f32fb634",
            number: 79,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "5910b87d-0d9f-4a07-ba43-d7c893b99bc8",
              },
              {
                id: "e8a2c3dd-0809-48f2-9a59-96df3065fee0",
              },
              {
                id: "ce68da50-daf2-4ac6-b356-45ce69a61582",
              },
              {
                id: "3655685e-a8d9-4e58-b5a7-dd35c02ad5eb",
              },
              {
                id: "c6a15454-624e-4a70-be6e-1ca8e0fc079c",
              },
              {
                id: "6dd035db-975f-4112-b6da-fff34c66725f",
              },
              {
                id: "e475efe1-e841-4929-9185-bd3bd55076af",
              },
              {
                id: "281c4d50-b07e-4c03-8469-991a35a5fbd3",
              },
              {
                id: "aa8a79e5-793c-4bdb-9526-4fc7a62112d2",
              },
              {
                id: "ba934c63-2c02-46eb-956d-163d5ce61752",
              },
              {
                id: "73611e75-56ce-4d20-92c9-ea5e49faac1c",
              },
              {
                id: "6a376a86-e36e-4137-87cc-896cc01f34f4",
              },
              {
                id: "0014b211-8474-4f54-bbc7-e5d88d69ed60",
              },
              {
                id: "0bc631c0-3c69-40cd-a16e-616642f80fcf",
              },
              {
                id: "e2330923-7971-4fc5-a7f1-eabf4e2244a4",
              },
              {
                id: "997358d0-5c21-4879-bbf8-d2a23adc9efe",
              },
              {
                id: "7046fd36-fb64-4775-9c55-34f96f326b7b",
              },
              {
                id: "6ff0c579-c4c7-4143-aa2b-4c1f63a96bd6",
              },
              {
                id: "5bf38b45-667d-4e2f-94f9-d89f0403aa18",
              },
              {
                id: "12f46603-3926-40b5-80c0-ab421a94838e",
              },
              {
                id: "a545ad34-aa25-4781-ad43-1a952ea4747e",
              },
              {
                id: "64dd397d-7f49-4266-911c-19f5b303d1cb",
              },
              {
                id: "499f86f6-f39f-4c13-aa34-c0ac391c37f4",
              },
              {
                id: "c26352e1-6414-442b-b203-997083bedac8",
              },
              {
                id: "09c8a3eb-80f0-4e3d-86f4-5281f0d8c17e",
              },
              {
                id: "63e4200e-cfa7-4c26-b9e0-f53ed207f787",
              },
              {
                id: "00aa4ca8-8125-44b0-83a2-791927ba6094",
              },
              {
                id: "28c81772-b863-4454-89f7-46e43083aa43",
              },
              {
                id: "81e280e0-7751-4a88-acf4-05453ef09601",
              },
              {
                id: "ee175156-2629-47e3-b99b-7827bebc4b22",
              },
              {
                id: "2336e1a4-f21f-4c88-a164-7a697f38c855",
              },
              {
                id: "025149b7-ba0b-4903-bfee-f4e4e41fc441",
              },
              {
                id: "205cb0b2-d144-4322-85d5-350d25309d85",
              },
              {
                id: "d30983ab-2d28-43b0-a505-80a483ee4360",
              },
              {
                id: "782e19f8-6b15-4b76-b051-dddc7fadc978",
              },
              {
                id: "343e383d-c19f-45a2-9cf1-8efb8cbc858a",
              },
              {
                id: "c639cca0-e749-43d6-b3d2-56a83b6d90ae",
              },
              {
                id: "7a37f634-74b6-4a03-a293-bdbe5e835e92",
              },
              {
                id: "cb6793ec-51f7-49d0-b88a-9012d7134fee",
              },
              {
                id: "c3c92a2a-99cd-4d3c-9ab0-7f690d282124",
              },
              {
                id: "441aedea-e078-499e-acbd-7f05dad48a30",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
            id: "e4361f17-356a-48b3-b2f9-a1eb949c81c4",
            number: 80,
            volume: null,
            language: "pt_br",
            pages: [
              {
                id: "522efbd2-0708-472a-999c-d30b40278cd6",
              },
              {
                id: "f1bb17f1-3383-49c7-b84f-1a82ac2bd411",
              },
              {
                id: "5d46141b-f16e-4970-8660-550bc7901ece",
              },
              {
                id: "c597a239-30a3-42e5-80e6-a6ec10d4f8c0",
              },
              {
                id: "e1891e78-1786-4073-8eab-3fd8b9dc7753",
              },
              {
                id: "8fab3b68-b3da-469a-9447-a9a4ea7da825",
              },
              {
                id: "e212aea5-a988-43a3-b021-97f2685a9d17",
              },
              {
                id: "dbec2536-baa3-40ba-aff3-73b915b53517",
              },
              {
                id: "ed9fcd60-1b3d-4f4e-9962-e56ab7979ccc",
              },
              {
                id: "c1934713-d060-462a-bd4b-b3e61951668c",
              },
              {
                id: "cdd90969-9309-436f-baed-68a5d36e7c10",
              },
              {
                id: "1427fc5d-e082-4e10-9887-e12216de4790",
              },
              {
                id: "b907a41b-379a-46b3-9c75-f48f3d002519",
              },
              {
                id: "5dce2a40-e432-4667-b80a-e07283250aca",
              },
              {
                id: "a1a2d99d-5f55-42a0-ac39-a8dcddf12432",
              },
              {
                id: "9b485fb5-67a8-4ef4-97b5-ff0d3d576604",
              },
              {
                id: "0da575a9-9378-4270-9c29-27ff848bc6c1",
              },
              {
                id: "7dd0a6fe-8c70-43c6-80e8-c969e15e159b",
              },
              {
                id: "3ed7d0a8-0076-48c9-9daa-97013caac616",
              },
              {
                id: "2aca62c6-ca2e-49dd-a354-be4dae9a5119",
              },
              {
                id: "6b49e0f5-7d95-4c84-a0c1-fea363c803f4",
              },
              {
                id: "70edcaba-d05f-44f6-80c7-e7fba41d016e",
              },
              {
                id: "81650415-6cf8-4bc0-b953-4cd23a745c40",
              },
              {
                id: "8d7399da-5a7c-48f2-8854-f639a7b0667a",
              },
              {
                id: "bbe67d0b-e2b2-4679-b2b1-d478435758f4",
              },
              {
                id: "4e965805-4e08-4cf5-ad7d-1adca82389d2",
              },
              {
                id: "4b011f44-c3e9-4b31-a48c-43ec4fe99176",
              },
              {
                id: "0b42776a-6cf3-4553-9aa9-26a21e64451a",
              },
              {
                id: "a54c1fc6-96c2-491b-9ecb-26911f90cd46",
              },
              {
                id: "9dd84387-ae50-4107-968e-c20e481f1229",
              },
              {
                id: "fc181f61-ce2e-4b41-9ced-74e620018f8e",
              },
              {
                id: "ccd0cab5-b9df-4278-b044-91dee0b9313f",
              },
              {
                id: "b7989ffc-3247-4eb0-8b07-3cf218637761",
              },
              {
                id: "280575b2-eddf-4c26-bf0e-2b6d255125f4",
              },
              {
                id: "e839503a-2be5-435e-a4d7-daede964df59",
              },
              {
                id: "b3a332f2-da81-4068-81f1-4c2a82ac04c1",
              },
              {
                id: "0cb698c5-b474-46f4-a3c6-99f5f398126e",
              },
              {
                id: "739ef23c-b8b9-4b4b-b991-4ede603b846c",
              },
              {
                id: "b93f0389-9a6e-49d1-8a58-171856bdd368",
              },
              {
                id: "b81c6a80-f954-4b03-baef-8dec0da560b6",
              },
              {
                id: "dbaae02b-e1d0-406a-973b-eeaf01daa12c",
              },
            ],
            uploaderId: "db852a04-7406-4a6a-87f2-1b494e810a29",
            groups: {
              connectOrCreate: [
                {
                  where: { id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c" },
                  create: {
                    id: "75c81b96-f763-4d30-b4f2-c3cbc9827f4c",
                    name: "SS-Clube",
                    description: null,
                    website: "http://ss-clube.com/",
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
