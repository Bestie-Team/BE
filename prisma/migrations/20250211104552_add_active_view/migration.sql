-- Create Active View
CREATE VIEW "active_user" AS
  SELECT *
  FROM "user" u
  WHERE u.deleted_at IS NULL;

CREATE VIEW "active_feed" AS
  SELECT *
  FROM "feed" f
  WHERE f.deleted_at IS NULL;

CREATE VIEW "active_feed_comment" AS
  SELECT *
  FROM "feed_comment" fc
  WHERE fc.deleted_at IS NULL;

CREATE VIEW "active_gathering" AS
  SELECT *
  FROM "gathering" g
  WHERE g.deleted_at IS NULL;
