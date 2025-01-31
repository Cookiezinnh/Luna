const { SlashCommandBuilder } = require('discord.js');
const RoleConfig = require('../../models/roleConfig');

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list_roles')
        .setDescription('Exibe todos os cargos configurados para o servidor.'),
    commandAlias: ['roleslist','listroles','roles_list'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true,

    async execute(context) {
        const isInteraction = context.isCommand?.();
        const guildId = context.guild.id;

        try {
            const roles = await RoleConfig.find({ guildId });

            if (!roles.length) {
                const noRolesMessage = '⚠️ Nenhum cargo foi configurado para este servidor.';
                return isInteraction
                    ? context.reply({ content: noRolesMessage, ephemeral: true })
                    : context.channel.send(noRolesMessage);
            }

            const roleList = roles
                .map(role => `**${role.roleName}:** <@&${role.roleId}> (\`${role.roleId}\`)`)
                .join('\n');

            const successMessage = `📋 **Cargos configurados para este servidor:**\n\n${roleList}`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[List Roles] Erro ao buscar cargos:', error);
            const errorMessage = ':x: Ocorreu um erro ao buscar os cargos configurados.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};