CREATE TABLE IF NOT EXISTS guild_settings (
  guild_id TEXT PRIMARY KEY,
  welcome_channel_id TEXT NULL,
  rules_channel_id TEXT NULL,
  accepted_role_id TEXT NULL
);
