import { meilisearch, meilisearchIndexes } from "~/lib/server/meilisearch";
import { MediaService } from "~/lib/services";

const execute = async () => {
  // Medias
  await meilisearch.deleteIndexIfExists("medias");
  await meilisearch.createIndex("medias", { primaryKey: "id" });
  await meilisearchIndexes.medias.deleteAllDocuments();

  const medias = await Promise.all([
    MediaService.getIndexItem("95bf236c-87ca-42d3-b9a0-d17ad7a13b2c"),
    MediaService.getIndexItem("d9405929-e54e-4560-8305-d14e7c76bcc7"),
    MediaService.getIndexItem("65ad0a5c-4861-4b59-b93e-90963590958e"),
    MediaService.getIndexItem("d696e020-f234-44c4-9cba-8bb5359b156b"),
    MediaService.getIndexItem("7d64e4f8-d955-4b59-a7c5-7ee2ddcad68b"),
    MediaService.getIndexItem("22f9e6a3-c625-4b33-8526-20773d831fd8"),
    MediaService.getIndexItem("21bc3f0b-73ac-44b6-8955-ae5a0a50cf39"),
    MediaService.getIndexItem("171ed718-cfdc-4e63-b99a-18a0b1d59eb5"),
    MediaService.getIndexItem("f0bc42eb-b2f7-4017-89f8-77c1834834b1"),
    MediaService.getIndexItem("6804cf61-f7ad-410e-87ba-27683ef05403"),
  ]);

  await meilisearchIndexes.medias.updateDocuments(medias);
};

export default { execute };
