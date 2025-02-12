const { SlashCommandBuilder } = require('discord.js');
const Categories = require('../../../shared/categories.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('closeprivatevc')
        .setDescription('Fecha o seu canal de voz temporário.'),
    commandAlias: ['closepvc', 'clpvc'],
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

        const voiceState = guild.voiceStates.cache.get(member.id);
        if (!voiceState?.channel) {
            const replyMessage = '⚠️ Você não está em um canal de voz!';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        const channel = voiceState.channel;

        if (channel.parentId !== Categories.CLONED_VC_CATEGORY) {
            const replyMessage = '⚠️ Este canal não pode ser fechado com este comando!';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        try {
            await channel.delete();
            const successMessage = '✅ O canal temporário foi fechado.';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[ClosePrivateVC] Erro ao deletar o canal:', error);
            const errorMessage = '❌ Ocorreu um erro ao fechar o canal.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};