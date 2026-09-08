-- Existing ManpowerUpload rows predate per-upload month/year tagging and
-- collide on the new unique (snapshotMonth, snapshotYear) constraint, so we
-- clear them; going forward every upload is tagged with an explicit period.
DELETE FROM `ManpowerUpload`;

-- AlterTable
ALTER TABLE `ManpowerUpload` ADD COLUMN `snapshotMonth` INTEGER NOT NULL, ADD COLUMN `snapshotYear` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ManpowerUpload_snapshotMonth_snapshotYear_key` ON `ManpowerUpload`(`snapshotMonth`, `snapshotYear`);
