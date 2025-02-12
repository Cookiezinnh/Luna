const { SlashCommandBuilder } = require('discord.js');
const PrivateVC = require('../../models/privateVoiceChannel.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteprivatevc')
        .setDescription('Deleta o canal de voz privado de um usuário.')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('ID do usuário.')
                .setRequired(true)
        ),
    commandAlias: ['deletepvc', 'dlpvc'],
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
            if (channel) {
                await channel.delete();
            }

            await PrivateVC.deleteOne({ ownerId: userId });

            const successMessage = '✅ O canal de voz privado do usuário foi deletado com sucesso.';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[DeletePrivateVC] Erro ao deletar canal privado:', error);
            const errorMessage = '❌ Ocorreu um erro ao tentar deletar o canal privado.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};