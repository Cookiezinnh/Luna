const { SlashCommandBuilder } = require('discord.js');
const Prefix = require('../../models/prefix');
const config = require('../../config.json');

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetgameprefix')
        .setDescription('Reseta o prefixo de jogos para o padrão definido em config.json.'),
    commandAlias: ['rgp','rgprefix'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo
    adminBypass: true, // Permite que administradores ignorem restrições de cargo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guildId = isInteraction ? context.guildId : context.guild.id;

        try {
            await Prefix.updateOne(
                { guildId: guildId },
                { gameprefix: null }, // Remove o gameprefix personalizado
                { upsert: true }
            );

            const successMessage = `✅ Prefixo de jogos resetado para o padrão: \`${config.defaultgameprefix}\``;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[ResetGamePrefix] Erro ao resetar prefixo de jogos:', error);
            const errorMessage = '❌ Não foi possível resetar o prefixo de jogos.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};