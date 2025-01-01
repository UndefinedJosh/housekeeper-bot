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
        welcome_channel_id TEXT NOT NULL
      );
    `);

    console.log("Database initialized.");
  } finally {
    client.release();
  }
}

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

// Get rules configuration
export async function getRulesConfig(guildId: string) {
  const result = await pool.query(
    "SELECT rules_channel_id, accepted_role_id FROM guild_settings WHERE guild_id = $1",
    [guildId]
  );
  return result.rows[0] || null;
}

// Set rules configuration
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