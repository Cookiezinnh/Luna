const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverbanner')
        .setDescription('Exibe o banner do servidor.'),
    commandAlias: ['guildbanner'],
    requiredRoles: [], // Acessível a todos
    supportsPrefix: true,

    async execute(context) {
        const isInteraction = context.isCommand?.();
        const guild = context.guild;

        const bannerUrl = guild.bannerURL({ dynamic: true, size: 1024 });

        if (!bannerUrl) {
            const noBannerEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Este servidor não possui um banner.**');

            return isInteraction
                ? context.reply({ embeds: [noBannerEmbed], ephemeral: true })
                : context.channel.send({ embeds: [noBannerEmbed] });
        }

        const embed = new EmbedBuilder()
            .setColor(5763719) // Verde
            .setTitle(`🎨 **Banner do Servidor: ${guild.name}**`)
            .setImage(bannerUrl)
            .setFooter({ text: `Solicitado por ${isInteraction ? context.user.tag : context.author.tag}` });

        return isInteraction
            ? context.reply({ embeds: [embed] })
            : context.channel.send({ embeds: [embed] });
    },
};