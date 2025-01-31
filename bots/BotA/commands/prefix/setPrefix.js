const { SlashCommandBuilder } = require('discord.js');
const Prefix = require('../../models/prefix');

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setprefix')
        .setDescription('Define o prefixo do bot para este servidor.')
        .addStringOption(option =>
            option.setName('prefixo')
                .setDescription('Novo prefixo.')
                .setRequired(true)
        ),
    commandAlias: ['sp','sprefix'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guildId = isInteraction ? context.guildId : context.guild.id;
        const newPrefix = isInteraction
            ? context.options.getString('prefixo')
            : args?.[0];

        if (!newPrefix) {
            const replyMessage = '❌ Você precisa fornecer um prefixo válido.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        if (newPrefix.length > 5) {
            const replyMessage = '❌ O prefixo deve ter no máximo 5 caracteres.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        try {
            await Prefix.updateOne(
                { guildId: guildId },
                { prefix: newPrefix },
                { upsert: true }
            );

            const successMessage = `✅ Prefixo atualizado para: \`${newPrefix}\``;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[SetPrefix] Erro ao atualizar o prefixo:', error);
            const errorMessage = '❌ Não foi possível atualizar o prefixo.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};