-- Ensure email verification columns exist on User table
ALTER TABLE "public"."User"
  ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;

-- Ensure unique index exists for email verification tokens
CREATE UNIQUE INDEX IF NOT EXISTS "User_emailVerificationToken_key"
  ON "public"."User" ("emailVerificationToken");
