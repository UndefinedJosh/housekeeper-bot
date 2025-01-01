import {
    MessageReaction,
    PartialMessageReaction,
    PartialUser,
    User,
} from "discord.js";
import { getRulesConfig } from "../db";

export async function setupRules(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
) {
    if (user.bot) return;

    const guild = reaction.message.guild;
    if (!guild) return;

    const config = await getRulesConfig(guild.id);
    if (!config || reaction.message.channel.id !== config.rules_channel_id) {
        return;
    }

    if (reaction.emoji.name === "✅") {
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(config.accepted_role_id);

        if (!role) {
            console.error(`Role with ID ${config.accepted_role_id} not found.`);
            return;
        }

        await member.roles.add(role);
        await reaction.users.remove(user.id); // Remove the reaction
    }
}
