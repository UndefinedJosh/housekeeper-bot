import { GuildMember } from "discord.js";
import { isUserBlacklisted, getBlacklistRole } from "../db";

export async function checkForBlacklistedUser(member: GuildMember) {
  const blacklistRoleId = await getBlacklistRole(member.guild.id);
  if (!blacklistRoleId) return;

  if (await isUserBlacklisted(member.guild.id, member.id)) {
    const role = member.guild.roles.cache.get(blacklistRoleId);
    if (role) {
      await member.roles.add(role);

      console.log(`Blacklist role "${role.name}" assigned to ${member.user.tag}.`);
    }
  }
}
