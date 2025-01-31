const { SlashCommandBuilder } = require('discord.js');
const ChannelConfig = require('../../models/channelConfig');

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list_channels')
        .setDescription('Exibe todos os canais configurados para o servidor.'),
    commandAlias: ['channellist','listchannels','channels_list'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true,

    async execute(context) {
        const isInteraction = context.isCommand?.();
        const guildId = context.guild.id;

        try {
            const channels = await ChannelConfig.find({ guildId });

            if (!channels.length) {
                const noChannelsMessage = '⚠️ Nenhum canal foi configurado para este servidor.';
                return isInteraction
                    ? context.reply({ content: noChannelsMessage, ephemeral: true })
                    : context.channel.send(noChannelsMessage);
            }

            const channelList = channels
                .map(channel => `**${channel.channelName}:** <#${channel.channelId}> (\`${channel.channelId}\`)`)
                .join('\n');

            const successMessage = `📋 **Canais configurados para este servidor:**\n\n${channelList}`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[List Channels] Erro ao buscar canais:', error);
            const errorMessage = ':x: Ocorreu um erro ao buscar os canais configurados.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};