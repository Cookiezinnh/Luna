const { SlashCommandBuilder } = require('discord.js');
const PrivateVC = require('../../models/privateVoiceChannel.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeprivatevc')
        .setDescription('Remove seu canal de voz privado.'),
    commandAlias: ['removepvc', 'rmpvc'],
    requiredRoles: [],
    supportsPrefix: true,

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = context.guild;
        const member = isInteraction ? context.member : context.member || context.author;

        if (!member || !guild) {
            const errorMessage = '❌ Não foi possível identificar o usuário ou servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        try {
            const privateVC = await PrivateVC.findOne({ ownerId: member.id });
            if (!privateVC) {
                const noChannelMessage = '⚠️ Você não possui um canal de voz privado ativo.';
                return isInteraction
                    ? context.reply({ content: noChannelMessage, ephemeral: true })
                    : context.channel.send(noChannelMessage);
            }

            const channel = guild.channels.cache.get(privateVC.voiceChannelId);
            if (channel) {
                await channel.delete();
            }

            await PrivateVC.deleteOne({ ownerId: member.id });

            const successMessage = '✅ Seu canal de voz privado foi removido com sucesso.';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[RemovePrivateVC] Erro ao remover canal privado:', error);
            const errorMessage = '❌ Ocorreu um erro ao tentar remover seu canal privado.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};