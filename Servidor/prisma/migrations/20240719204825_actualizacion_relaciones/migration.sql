/*
  Warnings:

  - You are about to drop the `anuncioauthor` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorId` to the `Anuncio` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `anuncioauthor` DROP FOREIGN KEY `AnuncioAuthor_anuncioId_fkey`;

-- DropForeignKey
ALTER TABLE `anuncioauthor` DROP FOREIGN KEY `AnuncioAuthor_authorId_fkey`;

-- AlterTable
ALTER TABLE `anuncio` ADD COLUMN `authorId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `anuncioauthor`;

-- AddForeignKey
ALTER TABLE `Anuncio` ADD CONSTRAINT `Anuncio_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `Author`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
