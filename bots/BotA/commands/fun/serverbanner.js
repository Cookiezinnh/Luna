const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverbanner')
        .setDescription('Mostra o banner do servidor.'),
    commandAlias: ['svbanner','bannersv','bannerserver'],
    requiredRoles: [], // Nenhuma restrição de cargo
    supportsPrefix: true, // Habilita suporte a prefixo
    async execute(context) {
        const bannerURL = context.guild.bannerURL({ dynamic: true, size: 512 });

        return context.reply({ content: bannerURL ? `Banner do servidor: ${bannerURL}` : '❌ Este servidor não possui um banner.' });
    },
};