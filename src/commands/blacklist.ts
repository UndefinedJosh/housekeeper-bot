import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
} from "discord.js";
import { addToBlacklist, getBlacklistRole, removeFromBlacklist } from "../db";

export const data = new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Manage the server blacklist.")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("add")
            .setDescription("Add a user to the blacklist.")
            .addUserOption((option) =>
                option.setName("user").setDescription("The user to blacklist")
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option.setName("reason").setDescription(
                    "The reason for blacklisting",
                ).setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("remove")
            .setDescription("Remove a user from the blacklist.")
            .addUserOption((option) =>
                option.setName("user").setDescription("The user to remove")
                    .setRequired(true)
            )
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

    const subcommand = (interaction.options as CommandInteractionOptionResolver)
        .getSubcommand();
    const user = (interaction.options as CommandInteractionOptionResolver)
        .getUser("user");
    const reason = (interaction.options as CommandInteractionOptionResolver)
        .getString("reason");

    if (!user) {
        await interaction.reply({
            content: "User could not be found!",
            ephemeral: true,
        });
        return;
    }

    const guild = interaction.guild;
    if (subcommand === "add") {
        await addToBlacklist(interaction.guild.id, user.id, reason || null);

        // Fetch the blacklist role for the guild
        const blacklistRoleId = await getBlacklistRole(guild.id);
        if (blacklistRoleId) {
            const role = guild.roles.cache.get(blacklistRoleId);
            if (role && member) {
                await member.roles.add(role);
                await interaction.reply(
                    `${user.tag} has been added to the blacklist and assigned the blacklist role.`,
                );
                return;
            }
        }

        await interaction.reply(
            `${user.tag} has been added to the blacklist, but no blacklist role is set.`,
        );
    } else if (subcommand === "remove") {
        await removeFromBlacklist(interaction.guild.id, user.id);

        // Remove the blacklist role if it exists
        const blacklistRoleId = await getBlacklistRole(guild.id);
        if (blacklistRoleId && member) {
            const role = guild.roles.cache.get(blacklistRoleId);
            if (role) {
                await member.roles.remove(role);
            }
        }

        await interaction.reply(
            `${user.tag} has been removed from the blacklist.`,
        );
    }
}
