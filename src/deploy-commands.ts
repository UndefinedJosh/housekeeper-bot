import { REST, Routes } from "discord.js";
import { commands } from './commands/utility/main';
import { config } from "./config";

const commandsData = Object.values(commands).map((command) => command.data);
const rest = new REST().setToken(config.DISCORD_TOKEN);

export async function deployCommands(): Promise<void> {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID),
      {
        body: commandsData,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}
