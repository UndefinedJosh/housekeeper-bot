import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import { getWelcomeChannelId } from "../db";

export async function handleWelcomeMessage(member: GuildMember) {
    try {
        // Get the channel ID for the welcome message
        const channelId = await getWelcomeChannelId(member.guild.id);
        if (!channelId) {
            console.error(
                `No welcome channel configured for guild: ${member.guild.id}`,
            );
            return;
        }

        const channel = member.guild.channels.cache.get(
            channelId,
        ) as TextChannel;

        if (!channel) {
            console.error("Welcome channel not found!");
            return;
        }

        // Create a fancy embed welcome message
        const embed = new EmbedBuilder()
            .setColor(0x00ff00) // Green color
            .setTitle("🎉 Welcome to the server!")
            .setDescription(`We’re thrilled to have you, ${member.user}! 🎉`)
            .addFields(
                {
                    name: "Get Started",
                    value: "Introduce yourself in #introductions!",
                },
                {
                    name: "Read the Rules",
                    value: "Check out #rules to stay informed.",
                },
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: "Enjoy your stay! ✨" });

        // Send the embed message
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Error sending welcome message:", error);
    }
}
