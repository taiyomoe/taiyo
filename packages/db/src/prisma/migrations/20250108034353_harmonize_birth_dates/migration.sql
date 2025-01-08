-- Update
UPDATE "UserProfile"
SET "birthDate" = NULL
WHERE "birthDate" < '1970-01-01' OR "birthDate" > CURRENT_DATE;