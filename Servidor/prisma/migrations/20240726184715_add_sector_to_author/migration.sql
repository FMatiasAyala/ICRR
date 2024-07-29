/*
  Warnings:

  - Added the required column `sector` to the `Author` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `author` ADD COLUMN `sector` VARCHAR(191) NOT NULL;
