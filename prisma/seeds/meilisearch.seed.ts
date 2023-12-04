import { db } from "~/lib/server/db";
import { meilisearch, meilisearchIndexes } from "~/lib/server/meilisearch";
import { MediaService } from "~/lib/services";

const execute = async () => {
  // Medias
  await meilisearch.deleteIndexIfExists("medias");
  await meilisearch.createIndex("medias", { primaryKey: "id" });
  await meilisearchIndexes.medias.deleteAllDocuments();

  const medias = await Promise.all(
    (await db.media.findMany()).map(({ id }) => MediaService.getIndexItem(id)),
  );

  await meilisearchIndexes.medias.updateDocuments(medias);
};

export default { execute };
