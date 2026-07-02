/*
  Warnings:

  - You are about to drop the column `accusedDesignation` on the `sexualharassmentreport` table. All the data in the column will be lost.
  - You are about to drop the column `accusedName` on the `sexualharassmentreport` table. All the data in the column will be lost.
  - You are about to drop the column `desiredOutcome` on the `sexualharassmentreport` table. All the data in the column will be lost.
  - You are about to drop the column `incidentDate` on the `sexualharassmentreport` table. All the data in the column will be lost.
  - You are about to drop the column `incidentLocation` on the `sexualharassmentreport` table. All the data in the column will be lost.
  - You are about to drop the column `witnesses` on the `sexualharassmentreport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sexualharassmentreport` DROP COLUMN `accusedDesignation`,
    DROP COLUMN `accusedName`,
    DROP COLUMN `desiredOutcome`,
    DROP COLUMN `incidentDate`,
    DROP COLUMN `incidentLocation`,
    DROP COLUMN `witnesses`,
    ADD COLUMN `evidenceType` VARCHAR(191) NULL,
    ADD COLUMN `reportAs` VARCHAR(191) NULL;
