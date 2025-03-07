DROP VIEW IF EXISTS active_user;

CREATE VIEW "active_user" AS
  SELECT *
  FROM "user" u
  WHERE u.deleted_at IS NULL;