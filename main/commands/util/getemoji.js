const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getemoji')
        .setDescription('Obtém a imagem de um emoji personalizado pelo ID.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID do emoji personalizado.')
                .setRequired(true)),
    commandAlias: ['emojiimage', 'getemojiimage'],
    requiredRoles: [], // Restrições de Cargo (opcional)
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(context) {
        const isInteraction = context.isCommand?.();
        const guild = context.guild;

        // Obter o ID do emoji da interação ou do comando prefixado
        const emojiId = isInteraction
            ? context.options.getString('id')
            : context.args[0];

        if (!emojiId) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Você precisa fornecer o ID do emoji.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        try {
            // Buscar o emoji no servidor pelo ID
            const emoji = guild.emojis.cache.get(emojiId);

            if (!emoji) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('❌ **Emoji não encontrado no servidor.**');

                return isInteraction
                    ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [errorEmbed] });
            }

            // Obter a URL da imagem do emoji
            const emojiUrl = emoji.url;

            // Enviar a imagem como um arquivo .png
            const embed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setTitle(`🖼️ **Imagem do Emoji:** ${emoji.name}`)
                .setImage(emojiUrl)
                .setFooter({ text: `ID do Emoji: ${emoji.id}` });

            return isInteraction
                ? context.reply({ embeds: [embed] })
                : context.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('[GetEmoji Command] Erro ao buscar o emoji:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao buscar o emoji.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};