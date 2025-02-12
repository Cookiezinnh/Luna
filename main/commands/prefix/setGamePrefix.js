const { SlashCommandBuilder } = require('discord.js');
const Prefix = require('../../models/prefix');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setgameprefix')
        .setDescription('Define o prefixo para comandos de jogos.')
        .addStringOption(option =>
            option.setName('prefixo')
                .setDescription('Novo prefixo para jogos.')
                .setRequired(true)
        ),
    commandAlias: ['sgp','sgprefix'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo
    adminBypass: true, // Permite que administradores ignorem restrições de cargo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guildId = isInteraction ? context.guildId : context.guild.id;
        const newGamePrefix = isInteraction
            ? context.options.getString('prefixo')
            : args?.[0];

        if (!newGamePrefix || newGamePrefix.length > 5) {
            const replyMessage = '❌ O prefixo deve ter no máximo 5 caracteres.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        try {
            await Prefix.updateOne(
                { guildId },
                { gameprefix: newGamePrefix },
                { upsert: true }
            );

            const successMessage = `✅ Prefixo de jogos atualizado para: \`${newGamePrefix}\``;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[SetGamePrefix] Erro ao atualizar o prefixo de jogos:', error);
            const errorMessage = '❌ Não foi possível atualizar o prefixo de jogos.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};