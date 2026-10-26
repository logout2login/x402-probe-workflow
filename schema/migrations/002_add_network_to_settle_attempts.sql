-- +migrate Up
ALTER TABLE settle_attempts ADD COLUMN network TEXT;

-- +migrate Down
-- 唔可以 DROP COLUMN（SQLite 限制），留空
