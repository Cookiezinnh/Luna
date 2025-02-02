const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servericon')
        .setDescription('Exibe o ícone do servidor.'),
    commandAlias: ['serveravatar', 'guildicon'],
    requiredRoles: [], // Acessível a todos
    supportsPrefix: true,

    async execute(context) {
        const isInteraction = context.isCommand?.();
        const guild = context.guild;

        const iconUrl = guild.iconURL({ dynamic: true, size: 1024 });

        if (!iconUrl) {
            const noIconEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Este servidor não possui um ícone.**');

            return isInteraction
                ? context.reply({ embeds: [noIconEmbed], ephemeral: true })
                : context.channel.send({ embeds: [noIconEmbed] });
        }

        const embed = new EmbedBuilder()
            .setColor(5763719) // Verde
            .setTitle(`🖼️ **Ícone do Servidor: ${guild.name}**`)
            .setImage(iconUrl)
            .setFooter({ text: `Solicitado por ${isInteraction ? context.user.tag : context.author.tag}` });

        return isInteraction
            ? context.reply({ embeds: [embed] })
            : context.channel.send({ embeds: [embed] });
    },
};