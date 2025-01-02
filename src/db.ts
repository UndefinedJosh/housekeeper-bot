import { Pool } from "pg";

const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "db",
  database: process.env.POSTGRES_DB || "botdb",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        welcome_channel_id TEXT NOT NULL,
        rules_channel_id TEXT NULL,
        accepted_role_id TEXT NULL,
        blacklist_role_id TEXT NULL
      );

      CREATE TABLE IF NOT EXISTS blacklist (
        user_id TEXT PRIMARY KEY,
        guild_id TEXT NOT NULL REFERENCES guild_settings(guild_id),
        reason TEXT
      );
    `);

    console.log("Database initialized.");
  } finally {
    client.release();
  }
}

// Welcome Channel Functions
export async function getWelcomeChannelId(guildId: string): Promise<string | null> {
  const res = await pool.query(
    "SELECT welcome_channel_id FROM guild_settings WHERE guild_id = $1",
    [guildId]
  );
  return res.rows.length ? res.rows[0].welcome_channel_id : null;
}

export async function setWelcomeChannelId(guildId: string, channelId: string): Promise<void> {
  await pool.query(
    `
    INSERT INTO guild_settings (guild_id, welcome_channel_id)
    VALUES ($1, $2)
    ON CONFLICT (guild_id) DO UPDATE SET welcome_channel_id = EXCLUDED.welcome_channel_id;
    `,
    [guildId, channelId]
  );
}

// Rules Configuration Functions
export async function getRulesConfig(guildId: string) {
  const result = await pool.query(
    "SELECT rules_channel_id, accepted_role_id FROM guild_settings WHERE guild_id = $1",
    [guildId]
  );
  return result.rows[0] || null;
}

export async function setRulesConfig(guildId: string, channelId: string, roleId: string) {
  await pool.query(
    `
    INSERT INTO guild_settings (guild_id, rules_channel_id, accepted_role_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (guild_id) DO UPDATE SET
      rules_channel_id = EXCLUDED.rules_channel_id,
      accepted_role_id = EXCLUDED.accepted_role_id
    `,
    [guildId, channelId, roleId]
  );
}

// Blacklist Functions
export async function addToBlacklist(guildId: string, userId: string, reason: string | null) {
  await pool.query(
    `
    INSERT INTO blacklist (user_id, guild_id, reason)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id) DO UPDATE SET reason = EXCLUDED.reason;
    `,
    [userId, guildId, reason]
  );
}

export async function removeFromBlacklist(guildId: string, userId: string) {
  await pool.query(
    `
    DELETE FROM blacklist
    WHERE user_id = $1 AND guild_id = $2;
    `,
    [userId, guildId]
  );
}

export async function isUserBlacklisted(guildId: string, userId: string): Promise<boolean> {
  const res = await pool.query(
    `
    SELECT 1 FROM blacklist
    WHERE user_id = $1 AND guild_id = $2;
    `,
    [userId, guildId]
  );

  if (!res.rowCount) return false;

  return res.rowCount > 0;
}

// Blacklist Role Functions
export async function getBlacklistRole(guildId: string): Promise<string | null> {
  const res = await pool.query(
    "SELECT blacklist_role_id FROM guild_settings WHERE guild_id = $1",
    [guildId]
  );
  return res.rows[0]?.blacklist_role_id || null;
}

export async function setBlacklistRole(guildId: string, roleId: string): Promise<void> {
  await pool.query(
    `
    INSERT INTO guild_settings (guild_id, blacklist_role_id)
    VALUES ($1, $2)
    ON CONFLICT (guild_id) DO UPDATE SET blacklist_role_id = EXCLUDED.blacklist_role_id;
    `,
    [guildId, roleId]
  );
}
