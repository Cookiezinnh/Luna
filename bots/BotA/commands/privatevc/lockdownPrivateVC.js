const { SlashCommandBuilder } = require('discord.js');
const PrivateVC = require('../../models/privateVoiceChannel.js');
const Categories = require('../../../../shared/categories.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdownprivatevc')
        .setDescription('Fecha o canal de voz privado de um usuário.')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('ID do usuário.')
                .setRequired(true)
        ),
    commandAlias: ['lockdownpvc', 'ldpvc'],
    requiredRoles: ['ADMIN'], // Ajuste conforme necessário
    supportsPrefix: true,

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = context.guild;
        const userId = isInteraction ? context.options.getString('userid') : args[0];

        if (!userId) {
            const errorMessage = '❌ Por favor, forneça o ID do usuário.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        try {
            const privateVC = await PrivateVC.findOne({ ownerId: userId });
            if (!privateVC) {
                const noChannelMessage = '⚠️ O usuário não possui um canal de voz privado ativo.';
                return isInteraction
                    ? context.reply({ content: noChannelMessage, ephemeral: true })
                    : context.channel.send(noChannelMessage);
            }

            const channel = guild.channels.cache.get(privateVC.voiceChannelId);
            if (!channel) {
                const noChannelMessage = '⚠️ O canal de voz privado não foi encontrado.';
                return isInteraction
                    ? context.reply({ content: noChannelMessage, ephemeral: true })
                    : context.channel.send(noChannelMessage);
            }

            if (channel.parentId !== Categories.CLONED_VC_CATEGORY) {
                const replyMessage = '⚠️ Este canal não pode ser fechado com este comando!';
                return isInteraction
                    ? context.reply({ content: replyMessage, ephemeral: true })
                    : context.channel.send(replyMessage);
            }

            await channel.delete();
            const successMessage = '✅ O canal de voz privado do usuário foi fechado com sucesso.';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[LockdownPrivateVC] Erro ao fechar canal privado:', error);
            const errorMessage = '❌ Ocorreu um erro ao tentar fechar o canal privado.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};