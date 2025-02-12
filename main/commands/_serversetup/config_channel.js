const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ChannelConfig = require('../../models/channelConfig');

const predefinedChannels = [
    'STATUS_CHANNEL',
    'ERROR_CHANNEL',
    'LILYTH_HOME_CHANNEL',
    'FORTNITE_STORE_CHANNEL',
    'SERVER_LOG',
    'DISCORD_LOG',
    'JOIN_LOG',
    'MSG_LOG',
    'CALL_LOG',
    'PNSH_LOG',
    'USER_LOG',
    'MBR_LOG',
    'USED_CMD_LOG',
    'AUTOMOD_LOG',
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config_channels')
        .setDescription('Adiciona ou atualiza o ID de um canal para os comandos.')
        .addStringOption(option =>
            option.setName('nome')
                .setDescription('Nome do canal (escolha da lista)')
                .setRequired(true)
                .addChoices(
                    predefinedChannels.map(channel => ({ name: channel, value: channel }))
                ))
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID do canal no Discord')
                .setRequired(true)),
    requiredRoles: [], // Permitir sem restrições adicionais
    supportsPrefix: false,

    async execute(context) {
        const isInteraction = context.isCommand?.();
        const guildId = context.guild.id;
        const guildOwnerId = context.guild.ownerId;
        const userId = context.user.id || context.author.id;

        if (userId !== guildOwnerId) {
            const errorMessage = ':x: Apenas o dono do servidor pode configurar os canais.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        const channelName = isInteraction
            ? context.options.getString('nome')
            : context.args[0];
        const channelId = isInteraction
            ? context.options.getString('id')
            : context.args[1];

        if (!predefinedChannels.includes(channelName)) {
            const errorMessage = ':x: Nome do canal inválido. Escolha da lista disponível.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        try {
            await ChannelConfig.updateOne(
                { channelName, guildId },
                { channelId, guildId },
                { upsert: true }
            );

            const successMessage = `✅ Canal \`${channelName}\` atualizado com o ID \`${channelId}\` para o servidor.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[Config Channels] Erro ao salvar canal:', error);
            const errorMessage = ':x: Ocorreu um erro ao salvar o canal.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};