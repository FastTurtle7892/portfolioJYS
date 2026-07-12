-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FRONTEND', 'FRONTEND_LIBRARY', 'ENV', 'DESIGN', 'ETC');

-- CreateEnum
CREATE TYPE "ratio" AS ENUM ('PORTRAIT', 'LANDSCAPE', 'SQUARE');

-- CreateTable
CREATE TABLE "experience" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "period" VARCHAR(30) NOT NULL,
    "items" VARCHAR(255)[],
    "links" JSON[],
    "is_active" BOOLEAN DEFAULT false,
    "sub_title" VARCHAR(150),
    "index" INTEGER NOT NULL DEFAULT 0,
    "skill_ids" INTEGER[],
    "category" VARCHAR(100),
    "logo_url" VARCHAR(255),

    CONSTRAINT "experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "sub_title" VARCHAR(255) NOT NULL,
    "period" VARCHAR(30) NOT NULL,
    "member" VARCHAR(150) NOT NULL,
    "skills" VARCHAR(50)[],
    "links" JSON[],
    "skill_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "row_number" INTEGER,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectItem" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content" VARCHAR(500)[],
    "projectId" INTEGER,
    "blobUrl" VARCHAR(255),
    "row_number" INTEGER,
    "image_ratio" "ratio",

    CONSTRAINT "ProjectItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intro" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "detail" TEXT NOT NULL,
    "blobUrl" VARCHAR(255),

    CONSTRAINT "intro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill" (
    "id" SERIAL NOT NULL,
    "category" "Category" NOT NULL,
    "items" VARCHAR(255)[],
    "item" VARCHAR(255) NOT NULL DEFAULT '',
    "blobUrl" VARCHAR(255) NOT NULL DEFAULT '',

    CONSTRAINT "skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "sub_title" VARCHAR(255) NOT NULL,
    "period" VARCHAR(50) NOT NULL,
    "items" VARCHAR(255)[],
    "category" VARCHAR(50),

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectItem" ADD CONSTRAINT "ProjectItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
