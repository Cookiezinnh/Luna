const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleConfig = require('../../models/roleConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list_roles')
        .setDescription('Exibe todos os cargos configurados para o servidor.'),
    commandAlias: ['roleslist', 'listroles', 'roles_list'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true,

    async execute(context) {
        const isInteraction = context.isCommand?.();
        const guildId = context.guild.id;

        try {
            const roles = await RoleConfig.find({ guildId });

            if (!roles.length) {
                const noRolesEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('⚠️ **Nenhum cargo foi configurado para este servidor.**');

                return isInteraction
                    ? context.reply({ embeds: [noRolesEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [noRolesEmbed] });
            }

            const roleList = roles
                .map(role => `**${role.roleName}:** <@&${role.roleId}> (\`${role.roleId}\`)`)
                .join('\n');

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setTitle('📋 **Cargos configurados para este servidor:**')
                .setDescription(roleList)

            return isInteraction
                ? context.reply({ embeds: [successEmbed], ephemeral: false })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[List Roles] Erro ao buscar cargos:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao buscar os cargos configurados.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};