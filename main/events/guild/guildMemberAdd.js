const SoftLock = require('../../models/softlock');
const Mute = require('../../models/mute');
const RoleConfig = require('../../models/roleConfig'); // Modelo para buscar cargos no MongoDB
const emojis = require('../../../shared/emojis');

module.exports = async (client, member) => {
  try {
    const guildId = member.guild.id;

    // Consultar IDs dos cargos no MongoDB
    const roleConfigs = await RoleConfig.find({ guildId });
    const getRoleId = (roleName) => roleConfigs.find((config) => config.roleName === roleName)?.roleId;

    const newMemberRoleId = getRoleId('NEW_MEMBER_ROLE');
    const softlockRoleId = getRoleId('SOFTLOCKED_ROLE');
    const muteRoleId = getRoleId('MUTED_ROLE');

    const actions = [];

    // Verificar se o cargo de Novo Membro está definido e atribuir
    if (newMemberRoleId) {
      const newMemberRole = member.guild.roles.cache.get(newMemberRoleId);
      if (newMemberRole) {
        await member.roles.add(newMemberRole);
        actions.push(`${emojis.check} **Cargo Adicionado**: ${newMemberRole.name}`);
      } else {
        console.warn(`[guildMemberAdd] Cargo de Novo Membro (${newMemberRoleId}) não encontrado.`);
      }
    }

    // Verificar e aplicar SoftLock
    const isSoftLocked = await SoftLock.findOne({ guildId, userId: member.id });
    if (softlockRoleId && isSoftLocked) {
      const softlockRole = member.guild.roles.cache.get(softlockRoleId);
      if (softlockRole) {
        await member.roles.add(softlockRole);
        actions.push(`${emojis.lock} **SoftLock Aplicado**: ${softlockRole.name}`);
      } else {
        console.warn(`[guildMemberAdd] Cargo de SoftLock (${softlockRoleId}) não encontrado.`);
      }
    }

    // Verificar e aplicar Mute
    const muteData = await Mute.findOne({ guildId, userId: member.id });
    if (muteRoleId && muteData) {
      const muteRole = member.guild.roles.cache.get(muteRoleId);
      if (muteRole) {
        await member.roles.add(muteRole);
        actions.push(`${emojis.mute} **Mute Reaplicado**: ${muteRole.name}`);
        const remainingTime = muteData.unmuteAt.getTime() - Date.now();
        if (remainingTime > 0) {
          setTimeout(async () => {
            try {
              const updatedMuteData = await Mute.findOneAndDelete({ guildId, userId: member.id });
              if (updatedMuteData) {
                const updatedMember = member.guild.members.cache.get(member.id);
                if (updatedMember) {
                  await updatedMember.roles.remove(muteRole);
                  console.log(`[guildMemberAdd] Mute removido automaticamente de ${member.user.tag}.`);
                }
              }
            } catch (error) {
              console.error(`[guildMemberAdd] Erro ao remover mute automaticamente:`, error);
            }
          }, remainingTime);
        } else {
          await Mute.findOneAndDelete({ guildId, userId: member.id });
        }
      } else {
        console.warn(`[guildMemberAdd] Cargo de Mute (${muteRoleId}) não encontrado.`);
      }
    }
  } catch (error) {
    console.error(`[guildMemberAdd] Erro ao gerenciar entrada de ${member.user.tag}:`, error);
  }
};