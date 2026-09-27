-- CreateEnum
CREATE TYPE "ProjectItemType" AS ENUM ('TEXT', 'GALLERY', 'COLLAPSIBLE', 'TABLE', 'VIDEO');

-- AlterTable
ALTER TABLE "ProjectItem" ADD COLUMN     "type" "ProjectItemType" NOT NULL DEFAULT 'TEXT';
