import { Client, Events, Partials } from "discord.js";
import { config } from "./config";
import { deployCommands } from "./deploy-commands";
import { handleWelcomeMessage } from "./events/welcome";
import { handleInteraction } from "./events/interaction";
import { initDb } from "./db";
import { setupRules } from "./events/rules";
import { checkForBlacklistedUser } from "./events/checkblacklist";

const client = new Client({
  intents: [
    "Guilds",
    "GuildMembers",
    "GuildMessages",
    "GuildMessageReactions",
    "MessageContent",
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

client.once(Events.ClientReady, (client) => {
  initDb().then(() => {
    console.log("Database connection established.");
  });

  deployCommands();
  console.log(`${client.user.tag} is ready! 🤖`);
});

// Reload commands when new guild is joined
client.on(Events.GuildCreate, async () => {
  await deployCommands();
});

// Listen for interactions with the bot
client.on(Events.InteractionCreate, async (interaction) => {
  await handleInteraction(interaction);
});

client.on(Events.GuildMemberAdd, async (member) => {
  await handleWelcomeMessage(member);
  await checkForBlacklistedUser(member);
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  await setupRules(reaction, user);
});

client.login(config.DISCORD_TOKEN);
