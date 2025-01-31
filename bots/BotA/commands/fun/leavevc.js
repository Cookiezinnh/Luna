const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leavevc')
        .setDescription('Faz o bot sair do canal de voz.'),
    commandAlias: ['vcleave','leavevoice'],
    requiredRoles: [], // Nenhuma restrição de cargo
    supportsPrefix: true, // Habilita suporte a prefixo
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply({
                content: '❌ Não estou em nenhum canal de voz neste servidor.',
                ephemeral: true,
            });
        }

        try {
            connection.destroy();
            return interaction.reply({ content: '✅ Saí do canal de voz com sucesso.' });
        } catch (error) {
            console.error('[LeaveVC] Erro ao sair do canal de voz:', error);
            return interaction.reply({
                content: '❌ Não foi possível sair do canal de voz.',
                ephemeral: true,
            });
        }
    },
};
