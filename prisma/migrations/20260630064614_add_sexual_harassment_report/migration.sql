-- CreateTable
CREATE TABLE `SexualHarassmentReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('SUBMITTED', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'SUBMITTED',
    `reporterName` VARCHAR(191) NOT NULL,
    `reporterContact` VARCHAR(191) NOT NULL,
    `reporterEmail` VARCHAR(191) NULL,
    `isStaff` BOOLEAN NOT NULL DEFAULT true,
    `staffId` VARCHAR(191) NULL,
    `divisionName` VARCHAR(191) NULL,
    `departmentName` VARCHAR(191) NULL,
    `sectionName` VARCHAR(191) NULL,
    `incidentDate` DATETIME(3) NULL,
    `incidentLocation` VARCHAR(191) NULL,
    `accusedName` VARCHAR(191) NULL,
    `accusedDesignation` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `witnesses` TEXT NULL,
    `desiredOutcome` TEXT NULL,
    `caseNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SexualHarassmentAttachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportId` INTEGER NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SexualHarassmentAttachment` ADD CONSTRAINT `SexualHarassmentAttachment_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `SexualHarassmentReport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
