/*
  Warnings:

  - Added the required column `obraSocial` to the `Anuncio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `anuncio` ADD COLUMN `obraSocial` VARCHAR(191) NOT NULL;
