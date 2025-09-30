-- Ensure email verification columns exist on User table
ALTER TABLE "public"."User"
  ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;

-- Ensure unique index exists for email verification tokens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'User_emailVerificationToken_key'
  ) THEN
    CREATE UNIQUE INDEX "User_emailVerificationToken_key"
      ON "public"."User" ("emailVerificationToken");
  END IF;
END $$;
