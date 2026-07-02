-- AlterTable
ALTER TABLE `sexualharassmentreport` ADD COLUMN `incidentDateTime` VARCHAR(191) NULL,
    ADD COLUMN `incidentLocation` VARCHAR(191) NULL,
    ADD COLUMN `perpetratorName` VARCHAR(191) NULL,
    ADD COLUMN `victimName` VARCHAR(191) NULL,
    ADD COLUMN `witnessName` VARCHAR(191) NULL;
