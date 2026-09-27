-- AlterTable
ALTER TABLE "ProjectItem" ADD COLUMN     "blobUrl2" VARCHAR(255),
ADD COLUMN     "group_key" VARCHAR(50),
ADD COLUMN     "videoUrl" VARCHAR(255);

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "intro_image_url" VARCHAR(255);
