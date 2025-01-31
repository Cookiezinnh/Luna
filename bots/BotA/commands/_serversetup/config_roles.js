const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const RoleConfig = require('../../models/roleConfig');

const predefinedRoles = [
    'NEW_MEMBER_ROLE',
    'MUTED_ROLE',
    'SOFTLOCKED_ROLE',
    'ADMIN',
    'MODERATOR',
    'HELPER',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config_roles')
        .setDescription('Adiciona ou atualiza o ID de um cargo para os comandos.')
        .addStringOption(option =>
            option.setName('nome')
                .setDescription('Nome do cargo (escolha da lista)')
                .setRequired(true)
                .addChoices(
                    predefinedRoles.map(role => ({ name: role, value: role }))
                ))
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID do cargo no Discord')
                .setRequired(true)),
    requiredRoles: [], // Permitir sem restrições adicionais
    supportsPrefix: false,

    async execute(context) {
        const isInteraction = context.isCommand?.();
        const guildId = context.guild.id;
        const guildOwnerId = context.guild.ownerId;
        const userId = context.user.id || context.author.id;

        if (userId !== guildOwnerId) {
            const errorMessage = ':x: Apenas o dono do servidor pode configurar os cargos.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        const roleName = isInteraction
            ? context.options.getString('nome')
            : context.args[0];
        const roleId = isInteraction
            ? context.options.getString('id')
            : context.args[1];

        if (!predefinedRoles.includes(roleName)) {
            const errorMessage = ':x: Nome do cargo inválido. Escolha da lista disponível.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        try {
            await RoleConfig.updateOne(
                { roleName, guildId },
                { roleId, guildId },
                { upsert: true }
            );

            const successMessage = `✅ Cargo \`${roleName}\` atualizado com o ID \`${roleId}\` para o servidor.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[Config Roles] Erro ao salvar cargo:', error);
            const errorMessage = ':x: Ocorreu um erro ao salvar o cargo.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};