/*
  Warnings:

  - Added the required column `codigoObraSocial` to the `Anuncio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `anuncio` ADD COLUMN `codigoObraSocial` VARCHAR(191) NOT NULL;
