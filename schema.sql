CREATE TABLE IF NOT EXISTS guild_settings (
  guild_id TEXT PRIMARY KEY,
  welcome_channel_id TEXT NULL,
  rules_channel_id TEXT NULL,
  accepted_role_id TEXT NULL,
  blacklist_role_id TEXT NULL
);

 CREATE TABLE IF NOT EXISTS blacklisted_users (
  user_id TEXT PRIMARY KEY,
  reason TEXT NOT NULL
 );

ALTER TABLE guild_settings
ADD COLUMN blacklist_role_id TEXT NULL;