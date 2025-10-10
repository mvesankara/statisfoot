-- Add missing AGENT role to the enum to keep database aligned with Prisma schema
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'UserRoleEnum'
      AND e.enumlabel = 'AGENT'
  ) THEN
    ALTER TYPE "public"."UserRoleEnum" ADD VALUE 'AGENT';
  END IF;
END $$;
