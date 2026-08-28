-- Drops the COMPLIANCE_ADMIN role. Harassment-report access is unaffected:
-- it is granted by designating compliance officers on the "Sexual Harassment
-- Report" form type, which is a separate mechanism.
--
-- Safe to run only while no row still holds the value. Verified before
-- writing this migration: 0 users and 0 approval flow steps referenced it.

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('STAFF', 'HEAD_OF_SECTION', 'HEAD_OF_DEPARTMENT', 'HEAD_OF_DIVISION', 'TOP_MANAGEMENT', 'ADMIN', 'FORM_ADMIN') NOT NULL DEFAULT 'STAFF';

-- AlterTable
ALTER TABLE `ApprovalFlowStep` MODIFY `role` ENUM('STAFF', 'HEAD_OF_SECTION', 'HEAD_OF_DEPARTMENT', 'HEAD_OF_DIVISION', 'TOP_MANAGEMENT', 'ADMIN', 'FORM_ADMIN') NOT NULL;

-- AlterTable
ALTER TABLE `ApprovalFlowStep` MODIFY `fallbackRole` ENUM('STAFF', 'HEAD_OF_SECTION', 'HEAD_OF_DEPARTMENT', 'HEAD_OF_DIVISION', 'TOP_MANAGEMENT', 'ADMIN', 'FORM_ADMIN') NULL;
