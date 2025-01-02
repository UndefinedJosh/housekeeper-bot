import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { getRulesConfig } from "../db";

export const data = new SlashCommandBuilder()
  .setName("createrules")
  .setDescription("Post the rules message in the configured rules channel.");

export async function execute(interaction: CommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
    return;
  }

  // Check if the user has the required permissions
  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (!member.permissions.has("Administrator")) {
    await interaction.reply({
      content: "You do not have permission to use this command.",
      ephemeral: true,
    });
    return;
  }

  const config = await getRulesConfig(interaction.guild.id);
  if (!config) {
    await interaction.reply(
      "Rules configuration not set. Use /setrules to configure.",
    );
    return;
  }

  const channel = interaction.guild.channels.cache.get(
    config.rules_channel_id,
  ) as TextChannel;
  if (!channel) {
    await interaction.reply("Rules channel not found or no longer exists.");
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("Server Rules")
    .setDescription(`
Please read and accept the rules below:
1. Be respectful to others.
2. No spamming or flooding the chat.
3. Follow Discord's Terms of Service.
4. Don't be troubleD

React with ✅ to accept the rules and gain access to the server.
`)
    .setFooter({
      text: "Thank you for understanding and following our rules!",
    });

  const message = await channel.send({ embeds: [embed] });
  await message.react("✅");
}
