WITH RankedChapters AS (
  SELECT 
    c."id",
    c."title", 
    c."number",
    c."volume",
    c."language",
    c."createdAt",
    c."mediaId",
    c."uploaderId",
    ARRAY_AGG(ctg."B") as "groupIds",
    ROW_NUMBER() OVER (
      PARTITION BY c."mediaId"
      ORDER BY c."createdAt" DESC
    ) as rn,
    FIRST_VALUE(c."createdAt") OVER (
      PARTITION BY c."mediaId" 
      ORDER BY c."createdAt" DESC
    ) as latestChapterDate
  FROM "Chapter" c
  JOIN "Media" m ON c."mediaId" = m.id
  LEFT JOIN "_ChapterToGroup" ctg ON c.id = ctg."A"
  WHERE c."deletedAt" IS NULL
    AND c."flag" = 'OK'
    AND m."deletedAt" IS NULL
  GROUP BY c.id, c."mediaId", c."createdAt"
),
PaginatedMedias AS (
  SELECT DISTINCT "mediaId", MAX("createdAt") as latestChapter
  FROM RankedChapters
  GROUP BY "mediaId"
  ORDER BY MAX("createdAt") DESC
  LIMIT $1
  OFFSET $2
)
SELECT 
  rc."id",
  rc."title",
  rc."number", 
  rc."volume",
  rc."language",
  rc."createdAt",
  rc."mediaId",
  rc."uploaderId",
  rc."groupIds"
FROM RankedChapters rc
JOIN PaginatedMedias pm ON rc."mediaId" = pm."mediaId"
WHERE rc.rn = 1 
  OR (rc.rn <= 5 AND rc."createdAt" >= rc.latestChapterDate - INTERVAL '1 day')
ORDER BY rc."createdAt" DESC;
