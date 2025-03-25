-- DropIndex
DROP INDEX "Account_provider_providerAccountId_key";

-- DropIndex
DROP INDEX "Session_sessionToken_key";

-- AlterTable
ALTER TABLE "Account" RENAME COLUMN "access_token" TO "accessToken";
ALTER TABLE "Account" RENAME COLUMN "refresh_token" TO "refreshToken";
ALTER TABLE "Account" RENAME COLUMN "expires_at" TO "accessTokenExpiresAt";
ALTER TABLE "Account" RENAME COLUMN "providerAccountId" TO "accountId";
ALTER TABLE "Account" RENAME COLUMN "id_token" TO "idToken";
ALTER TABLE "Account" RENAME COLUMN "provider" TO "providerId";
ALTER TABLE "Account"
  DROP COLUMN "session_state",
  DROP COLUMN "token_type",
  DROP COLUMN "type",
  ADD COLUMN "password" TEXT,
  ADD COLUMN "refreshTokenExpiresAt" TIMESTAMP(3),
  ALTER COLUMN "accessTokenExpiresAt" TYPE TIMESTAMP(3) USING to_timestamp("accessTokenExpiresAt");

-- AlterTable
ALTER TABLE "Session" RENAME COLUMN "expires" TO "expiresAt";
ALTER TABLE "Session" RENAME COLUMN "sessionToken" TO "token";
ALTER TABLE "Session"
  ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN "impersonatedBy" TEXT,
  ADD COLUMN "ipAddress" TEXT,
  ADD COLUMN "userAgent" TEXT,
  ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User"
  ALTER COLUMN "name" SET NOT NULL,
  ADD COLUMN "banExpires" TIMESTAMP(3),
  ADD COLUMN "banReason" TEXT,
  ADD COLUMN "banned" BOOLEAN;

-- DropTable
DROP TABLE "VerificationToken";

-- CreateTable
CREATE TABLE "Verification" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,

  CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_accountId_providerId_userId_key" ON "Account"("accountId", "providerId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
