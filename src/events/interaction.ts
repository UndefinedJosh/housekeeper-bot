import { Interaction } from "discord.js";
import { commands } from "../commands/main";

export async function handleInteraction(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
        try {
            await commands[commandName as keyof typeof commands].execute(
                interaction,
            );
        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);

            interaction.reply({
                content: "There was an error executing this command!",
                ephemeral: true,
            });
        }
    }
}
