const { SlashCommandBuilder } = require('discord.js');
const Prefix = require('../../models/prefix');
const config = require('../../config.json');

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetprefix')
        .setDescription('Reseta o prefixo para o padrão.'),
    commandAlias: ['rp','rprefix'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guildId = isInteraction ? context.guildId : context.guild.id;
        
        try {
            await Prefix.updateOne(
                { guildId: guildId },
                { prefix: config.defaultprefix, enabled: true },
                { upsert: true }
            );

            const successMessage = `✅ Prefixo resetado para: \`${config.defaultprefix}\``;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[ResetPrefix] Erro ao resetar prefixo:', error);
            const errorMessage = '❌ Não foi possível resetar o prefixo.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};