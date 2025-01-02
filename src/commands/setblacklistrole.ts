import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    Role,
    SlashCommandBuilder,
} from "discord.js";
import { setBlacklistRole } from "../db";

export const data = new SlashCommandBuilder()
    .setName("setblacklistrole")
    .setDescription("Set the blacklist role for the server.")
    .addRoleOption((option) =>
        option.setName("role").setDescription(
            "The role to assign to blacklisted users",
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

    const role = (interaction.options as CommandInteractionOptionResolver)
        .getRole("role") as Role;

    await setBlacklistRole(interaction.guild.id, role.id);
    await interaction.reply(`Blacklist role has been set to ${role.name}.`);
}
