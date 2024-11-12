-- MigrateData
UPDATE "Task"
SET "type" = 'IMPORT_CHAPTER'
WHERE "payload"::jsonb ? 'number';