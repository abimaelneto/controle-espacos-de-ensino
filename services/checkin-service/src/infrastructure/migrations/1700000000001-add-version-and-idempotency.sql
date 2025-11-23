-- Migration: Add version and idempotencyKey to attendances table
-- This migration adds optimistic locking and idempotency support

ALTER TABLE `attendances`
  ADD COLUMN `version` INT NOT NULL DEFAULT 0 AFTER `checkInTime`,
  ADD COLUMN `idempotencyKey` VARCHAR(255) NULL AFTER `version`,
  ADD UNIQUE INDEX `idx_attendances_idempotency_key` (`idempotencyKey`);

