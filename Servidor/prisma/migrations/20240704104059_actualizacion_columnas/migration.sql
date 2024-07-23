/*
  Warnings:

  - You are about to drop the column `nombre` on the `anuncio` table. All the data in the column will be lost.
  - Added the required column `name` to the `Anuncio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `anuncio` DROP COLUMN `nombre`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;
