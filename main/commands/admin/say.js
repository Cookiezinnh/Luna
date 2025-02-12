const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Faz o bot dizer algo.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('A mensagem que o bot irá dizer.')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal onde a mensagem será enviada.')
                .addChannelTypes(ChannelType.GuildText) // Apenas canais de texto
                .setRequired(false)),
    commandAlias: ['botsay', 'saybot', 'talk'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let member, guild, message, targetChannel;

        // Identifica o tipo de comando
        if (isInteraction) {
            member = context.member;
            guild = context.guild;
            message = context.options.getString('message');
            targetChannel = context.options.getChannel('channel') || context.channel;
        } else {
            member = context.member || context.author;
            guild = context.guild;
            message = args.join(' ');
            targetChannel = context.mentions.channels.first() || context.channel;
        }

        if (!message) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('⚠️ **Você precisa especificar a mensagem a ser enviada.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        try {
            await targetChannel.send(message);

            // Envia mensagem de sucesso apenas se for via Slash Command
            if (isInteraction) {
                const successEmbed = new EmbedBuilder()
                    .setColor(5763719) // Verde
                    .setDescription(`✅ **Mensagem enviada em ${targetChannel}.**`)

                return context.reply({ embeds: [successEmbed], ephemeral: true });
            }
        } catch (error) {
            console.error('[Say Command] Erro ao enviar mensagem:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao tentar enviar a mensagem.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};