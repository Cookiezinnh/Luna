const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Exibe o banner de um usuário.')
        .addStringOption(option =>
            option.setName('usuario')
                .setDescription('ID, nome, nome#0000 ou menção (@usuário) do usuário.')
                .setRequired(false)),
    commandAlias: ['userbanner'],
    requiredRoles: [], // Acessível a todos
    supportsPrefix: true,

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const input = isInteraction
            ? context.options.getString('usuario')
            : args.join(' ');

        let user;

        // Se nenhum usuário for fornecido, usa o autor da mensagem
        if (!input) {
            user = isInteraction ? context.user : context.author;
        } else {
            // Tenta buscar o usuário pelo ID, nome ou menção
            const mentionMatch = input.match(/^<@!?(\d+)>$/);
            const userId = mentionMatch ? mentionMatch[1] : input;

            try {
                user = await context.client.users.fetch(userId, { force: true });
            } catch (error) {
                console.error('[Banner Command] Erro ao buscar usuário:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('❌ **Usuário não encontrado.**');

                return isInteraction
                    ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [errorEmbed] });
            }
        }

        // Busca o banner do usuário
        const bannerUrl = user.bannerURL({ dynamic: true, size: 1024 });

        if (!bannerUrl) {
            const noBannerEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription(`❌ **${user.username} não possui um banner.**`);

            return isInteraction
                ? context.reply({ embeds: [noBannerEmbed], ephemeral: true })
                : context.channel.send({ embeds: [noBannerEmbed] });
        }

        const embed = new EmbedBuilder()
            .setColor(5763719) // Verde
            .setTitle(`🎨 **Banner de ${user.username}**`)
            .setImage(bannerUrl)
            .setFooter({ text: `Solicitado por ${isInteraction ? context.user.tag : context.author.tag}` });

        return isInteraction
            ? context.reply({ embeds: [embed] })
            : context.channel.send({ embeds: [embed] });
    },
};