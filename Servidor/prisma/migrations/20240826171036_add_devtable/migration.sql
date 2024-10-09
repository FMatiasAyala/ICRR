/*
  Warnings:

  - Added the required column `servicio` to the `Anuncio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicio` to the `Author` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `anuncio` ADD COLUMN `servicio` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `author` ADD COLUMN `servicio` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `AnuncioDev` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `servicio` VARCHAR(191) NOT NULL,
    `sector` VARCHAR(191) NOT NULL,
    `obraSocial` VARCHAR(191) NOT NULL,
    `codigoObraSocial` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttachmentDev` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `anuncioId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthorDev` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `servicio` VARCHAR(191) NOT NULL,
    `sector` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AnuncioDev` ADD CONSTRAINT `AnuncioDev_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `AuthorDev`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttachmentDev` ADD CONSTRAINT `AttachmentDev_anuncioId_fkey` FOREIGN KEY (`anuncioId`) REFERENCES `AnuncioDev`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
