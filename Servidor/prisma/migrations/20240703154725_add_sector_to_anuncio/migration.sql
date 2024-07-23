/*
  Warnings:

  - Added the required column `sector` to the `Anuncio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `anuncio` ADD COLUMN `sector` VARCHAR(191) NOT NULL;
