const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde com Pong!'),
    commandAlias: ['pingtest','pingpong'],
    requiredRoles: [], // Nenhuma restrição de cargo
    supportsPrefix: true, // Habilita suporte a prefixo
    async execute(interaction) {
        await interaction.reply('🏓 Pong!');
    },
};