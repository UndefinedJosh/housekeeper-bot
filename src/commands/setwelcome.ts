import {
    ChannelType,
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
} from "discord.js";
import { setWelcomeChannelId } from "../db";

export const data = new SlashCommandBuilder()
    .setName("setwelcome")
    .setDescription("Set the welcome channel for this server.")
    .addChannelOption((option) =>
        option.setName("channel").setDescription(
            "The channel to set as the welcome channel",
        ).setRequired(true)
    );

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

    const channel = (interaction.options as CommandInteractionOptionResolver)
        .getChannel("channel");
    if (!channel || channel.type !== ChannelType.GuildText) {
        await interaction.reply("Please select a valid text channel.");
        return;
    }

    await setWelcomeChannelId(interaction.guild.id, channel.id);
    await interaction.reply(`Welcome channel set to ${channel.toString()}!`);
}
