const { SlashCommandBuilder } = require('discord.js');
const AdminBypass = require('../../models/AdminBypass.js'); // Modelo MongoDB

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config_userbypass')
        .setDescription('Gerencia a lista de usuários que podem usar o Admin Mode.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adiciona um usuário à lista de bypass.')
                .addUserOption(option =>
                    option.setName('usuário')
                        .setDescription('O usuário a ser adicionado.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove um usuário da lista de bypass.')
                .addUserOption(option =>
                    option.setName('usuário')
                        .setDescription('O usuário a ser removido.')
                        .setRequired(true))),
    requiredRoles: [], // Sem restrição de cargo
    supportsPrefix: false,

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = isInteraction ? context.guild : context.guild;
        const ownerId = guild.ownerId;

        const executorId = isInteraction ? context.user.id : context.author.id;
        if (executorId !== ownerId) {
            const errorMessage = ':x: Apenas o dono do servidor pode usar este comando.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        const subcommand = isInteraction ? context.options.getSubcommand() : args[0];
        const targetUser = isInteraction
            ? context.options.getUser('usuário')
            : args[1];

        if (!targetUser) {
            const errorMessage = ':x: Usuário não encontrado.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        if (subcommand === 'add') {
            await AdminBypass.create({ guildId: guild.id, userId: targetUser.id });
            const successMessage = `✅ O usuário ${targetUser.tag} foi adicionado à lista de bypass.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } else if (subcommand === 'remove') {
            await AdminBypass.deleteOne({ guildId: guild.id, userId: targetUser.id });
            const successMessage = `✅ O usuário ${targetUser.tag} foi removido da lista de bypass.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        }
    },
};