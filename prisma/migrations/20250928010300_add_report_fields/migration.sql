-- AlterTable
ALTER TABLE "Report"
  ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled report',
  ADD COLUMN     "rating" INTEGER,
  ADD COLUMN     "strengths" TEXT,
  ADD COLUMN     "weaknesses" TEXT,
  ADD COLUMN     "recommendation" TEXT,
  ADD COLUMN     "matchDate" TIMESTAMP(3);

-- Remove default after populating existing rows
ALTER TABLE "Report"
  ALTER COLUMN "title" DROP DEFAULT;
