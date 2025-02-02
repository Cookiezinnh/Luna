const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleConfig = require('../../models/roleConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Exibe informações detalhadas sobre o servidor.'),
    commandAlias: ['infoserver', 'server'],
    requiredRoles: [], // Acessível a todos
    supportsPrefix: true,

    async execute(context) {
        const isInteraction = context.isCommand?.();
        const guild = context.guild;

        try {
            const owner = await guild.fetchOwner();
            const roles = guild.roles.cache.size;
            const channels = guild.channels.cache.size;
            const members = guild.memberCount;
            const createdAt = guild.createdAt;
            const iconUrl = guild.iconURL({ dynamic: true, size: 1024 });

            const embed = new EmbedBuilder()
                .setDescription(`# 🏰 Informações do Servidor`)
                .setColor(15548997) // Vermelho
                .setThumbnail(iconUrl)
                .addFields(
                    { name: 'Nome', value: guild.name, inline: true },
                    { name: 'ID', value: guild.id, inline: true },
                    { name: 'Dono', value: owner.user.tag, inline: true },
                    { name: 'Membros', value: `${members}`, inline: true },
                    { name: 'Cargos', value: `${roles}`, inline: true },
                    { name: 'Canais', value: `${channels}`, inline: true },
                    { name: 'Criado em', value: `<t:${Math.floor(createdAt / 1000)}:F>`, inline: true }
                )
                .setTimestamp();

            return isInteraction
                ? context.reply({ embeds: [embed] })
                : context.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('[ServerInfo Command] Erro ao buscar informações:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao buscar as informações do servidor.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};
