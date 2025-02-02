const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Limpa mensagens do canal.')
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('Número de mensagens a limpar.')
                .setRequired(true)
        ),
    commandAlias: ['cls', 'clearchat', 'chatclear'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let channel, member, quantidade;

        // Identifica se é um comando Slash ou prefixado
        if (isInteraction) {
            channel = context.channel;
            member = context.member;
            quantidade = context.options.getInteger('quantidade');
        } else {
            channel = context.channel;
            member = context.member || context.author;
            quantidade = parseInt(args[0], 10);

            if (isNaN(quantidade)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('❌ **Você deve fornecer um número válido de mensagens para limpar.**');

                return context.channel.send({ embeds: [errorEmbed] });
            }
        }

        // Verifica se o número de mensagens está dentro do limite
        if (quantidade < 1 || quantidade > 100) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **A quantidade deve estar entre 1 e 100.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        try {
            const messages = await channel.bulkDelete(quantidade, true);

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setDescription(`✅ **${messages.size} mensagens removidas.**`)

            return isInteraction
                ? context.reply({ embeds: [successEmbed], ephemeral: false })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[Clear] Erro ao limpar mensagens:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Não foi possível limpar as mensagens.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};