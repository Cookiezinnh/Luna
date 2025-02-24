const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const MinecraftServer = require('../../models/MinecraftServer'); // Modelo MongoDB para servidores de Minecraft

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mc_serverstatus_list')
        .setDescription('Lista todas as mensagens de status de servidores de Minecraft.'),
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: false,
    async execute(interaction) {
        const servers = await MinecraftServer.find({ guildId: interaction.guild.id });

        if (servers.length === 0) {
            return interaction.reply({ content: 'Nenhuma mensagem de status de servidor foi configurada.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('Mensagens de Status de Servidores de Minecraft')
            .setColor(0x00FF00)
            .setDescription(servers.map(server => `**ID da Mensagem:** ${server.messageId}\n**IP do Servidor:** ${server.serverIp}`).join('\n\n'));

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};