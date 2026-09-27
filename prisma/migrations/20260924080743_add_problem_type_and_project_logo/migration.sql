-- AlterEnum
ALTER TYPE "ProjectItemType" ADD VALUE 'PROBLEM';

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "logo_url" VARCHAR(255),
ADD COLUMN     "preview_clip_url" VARCHAR(255);
