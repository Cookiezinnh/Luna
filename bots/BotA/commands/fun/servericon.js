const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servericon')
        .setDescription('Mostra o ícone do servidor.'),
    commandAlias: ['svicon','iconsv','iconserver'],
    requiredRoles: [], // Nenhuma restrição de cargo
    supportsPrefix: true, // Habilita suporte a prefixo
    async execute(context) {
        const iconURL = context.guild.iconURL({ dynamic: true, size: 512 });

        return context.reply({ content: iconURL ? `Ícone do servidor: ${iconURL}` : '❌ Este servidor não possui um ícone.' });
    },
};