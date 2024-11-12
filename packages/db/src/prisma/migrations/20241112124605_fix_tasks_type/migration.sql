-- MigrateData
UPDATE "Tasks"
SET "type" = 'IMPORT_CHAPTER'
WHERE "payload"::jsonb ? 'number';