import { ChannelType, CommandInteraction, CommandInteractionOptionResolver, Role, SlashCommandBuilder } from "discord.js";
import { setRulesConfig } from "../../db";
import { RawCommandInteractionData } from "discord.js/typings/rawDataTypes";

export const data = new SlashCommandBuilder()
  .setName("setrules")
  .setDescription("Set the rules channel and the role to assign after acceptance.")
  .addChannelOption(option =>
    option.setName("channel").setDescription("The channel to post the rules message").setRequired(true)
  )
  .addRoleOption(option =>
    option.setName("role").setDescription("The role to assign after rules are accepted").setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply("This command can only be used in a server.");
    return;
  }

  const channel = (interaction.options as CommandInteractionOptionResolver).getChannel("channel");
  const role = (interaction.options as CommandInteractionOptionResolver).getRole("role");

  if (!channel || channel.type !== ChannelType.GuildText) {
    await interaction.reply("Please select a valid text channel.");
    return;
  }

  if (!role) {
    await interaction.reply("Please select a valid role.");
    return;
  }

  await setRulesConfig(interaction.guild.id, channel.id, role.id);
  await interaction.reply(`Rules channel set to ${channel.toString()} and role set to ${role.toString()}.`);
}
