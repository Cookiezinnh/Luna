const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Desbane um usuário do servidor.')
        .addStringOption(option =>
            option.setName('usuario')
                .setDescription('ID ou tag do usuário a ser desbanido (ex: cookiezinnh#9319 ou 462031073891581962)')
                .setRequired(true)),
    commandAlias: ['unbanuser', 'userunban'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let input, guild;

        if (isInteraction) {
            input = context.options.getString('usuario');
            guild = context.guild;
        } else {
            input = args[0];
            guild = context.guild;
        }

        let userId;

        try {
            // Determinar o formato do input
            if (/^\d+$/.test(input)) {
                userId = input; // Apenas ID numérico
            } else if (/^.+#\d{4}$/.test(input)) {
                // Tag de usuário, buscar nos bans
                const bans = await guild.bans.fetch();
                const user = bans.find(ban => `${ban.user.username}#${ban.user.discriminator}` === input);
                if (!user) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor(15548997) // Vermelho
                        .setDescription('❌ **Nenhum banimento encontrado para essa tag de usuário.**');

                    return isInteraction
                        ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                        : context.channel.send({ embeds: [errorEmbed] });
                }
                userId = user.user.id;
            } else {
                const errorEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('❌ **Entrada inválida. Use um ID ou tag de usuário válida.**');

                return isInteraction
                    ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [errorEmbed] });
            }

            // Verificar se o usuário está realmente banido
            const isBanned = await guild.bans.fetch(userId).catch(() => null);
            if (!isBanned) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('❌ **Este usuário não está banido.**');

                return isInteraction
                    ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [errorEmbed] });
            }

            // Tentar desbanir o usuário
            await guild.members.unban(userId);

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setDescription(`✅ **Usuário com ID \`${userId}\` foi desbanido do servidor.**`)

            return isInteraction
                ? context.reply({ embeds: [successEmbed], ephemeral: false })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[Unban Command] Erro ao desbanir o usuário:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao tentar desbanir o usuário.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};