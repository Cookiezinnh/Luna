const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ChannelConfig = require('../../models/channelConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list_channels')
        .setDescription('Exibe todos os canais configurados para o servidor.'),
    commandAlias: ['channellist', 'listchannels', 'channels_list'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true,

    async execute(context) {
        const isInteraction = context.isCommand?.();
        const guildId = context.guild.id;

        try {
            const channels = await ChannelConfig.find({ guildId });

            if (!channels.length) {
                const noChannelsEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('⚠️ **Nenhum canal foi configurado para este servidor.**');

                return isInteraction
                    ? context.reply({ embeds: [noChannelsEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [noChannelsEmbed] });
            }

            const channelList = channels
                .map(channel => `**${channel.channelName}:** <#${channel.channelId}> (\`${channel.channelId}\`)`)
                .join('\n');

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setTitle('📋 **Canais configurados para este servidor:**')
                .setDescription(channelList)

            return isInteraction
                ? context.reply({ embeds: [successEmbed], ephemeral: false })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[List Channels] Erro ao buscar canais:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao buscar os canais configurados.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};