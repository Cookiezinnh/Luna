const ReactionRole = require('../../models/reactionRoles.js');

module.exports = async (client, reaction, user) => {
  if (user.bot) return;

  try {
    const reactionRole = await ReactionRole.findOne({
      messageId: reaction.message.id,
      emoji: reaction.emoji.name,
    });

    if (!reactionRole) return;

    const guild = reaction.message.guild;
    const member = guild.members.cache.get(user.id);
    const roleId = reactionRole.roleId.replace(/[<@&>]/g, ''); // Limpa o ID
    const role = guild.roles.cache.get(roleId);

    if (!role) {
      console.error(`🟥 | [ReactionAdd] Cargo com ID "${reactionRole.roleId}" não encontrado no servidor "${guild.name}".`);
      return;
    }

    await member.roles.add(role);

    console.log(`🟩 | [ReactionAdd] Cargo "${role.name}" atribuído a ${user.tag}.`);
  } catch (error) {
    console.error('⬛ | [ReactionAdd] Erro ao atribuir cargo:', error);
  }
};