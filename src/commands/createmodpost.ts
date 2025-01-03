import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("createmodpost")
  .setDescription("Post a GTA mod with a banner, title, and description.")
  .addStringOption((option) =>
    option
      .setName("title")
      .setDescription("The title of the mod")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("banner")
      .setDescription("URL of the banner image")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("download")
      .setDescription("The URL for the download link")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("description")
      .setDescription("A description of the mod")
      .setRequired(false)
  )
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("The channel to post the mod (default: current channel)")
      .setRequired(false)
  );

export async function execute(interaction: CommandInteraction) {
  // Get the user inputs
  const title = interaction.options.get("title")?.value as string;
  const description = interaction.options.get("description")?.value as string;
  const banner = interaction.options.get("banner")?.value as string;
  const downloadLink = interaction.options.get("download")?.value as string;
  const channel = interaction.options.get("channel")?.channel as TextChannel ||
    interaction.channel;

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

  if (!channel || !(channel instanceof TextChannel)) {
    await interaction.reply({
      content: "The specified channel is not a text channel.",
      ephemeral: true,
    });
    return;
  }

  // Create the embed
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setImage(banner)
    .setColor(0x1e90ff)
    .setFooter({
      text: `Posted by ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    });

  // Set the description only if provided
  if (description) {
    embed.setDescription(description);
  }

  // Create the download button
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Download Mod")
      .setStyle(ButtonStyle.Link)
      .setURL(downloadLink),
  );

  // Post the embed in the specified channel
  await channel.send({ embeds: [embed], components: [row] });
  await interaction.reply({content: "New Mod Post was created successfully!"})
}
