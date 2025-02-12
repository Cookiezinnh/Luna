const ReactionRole = require('../../models/reactionRoles.js');

module.exports = async (client, reaction, user) => {
    if (user.bot) return;

    const emoji = reaction.emoji.id || reaction.emoji.name;

    try {
        const reactionRole = await ReactionRole.findOne({
            messageId: reaction.message.id,
            emoji,
        });

        if (!reactionRole) return;

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(reactionRole.roleId);

        if (role) {
            await member.roles.remove(role);

            console.log(`[ReactionRemove] Cargo "${role.name}" removido de ${user.tag}.`);
        }
    } catch (error) {
        console.error('[ReactionRemove] Erro ao remover cargo:', error);
    }
};