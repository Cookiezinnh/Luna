const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Warn = require('../../models/warns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warns')
        .setDescription('Exibe os avisos de um usuário.')
        .addStringOption(option =>
            option.setName('alvo')
                .setDescription('Usuário ou ID do alvo cujos avisos serão exibidos.')
                .setRequired(true)),
    commandAlias: ['userwarns', 'warnsuser', 'warnlist'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let guild, options;

        // Determina se é Slash Command ou comando prefixado
        if (isInteraction) {
            guild = context.guild;
            options = context.options;
        } else {
            guild = context.guild;
            options = args;
        }

        // Capturar o input do campo "alvo"
        const targetInput = isInteraction
            ? options.getString('alvo')
            : args[0];

        if (!targetInput) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Você precisa fornecer um usuário ou ID.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        // Extrair o ID do usuário (caso seja menção) ou tentar interpretar como tag/nome
        const targetId = targetInput.match(/^<@!?(\d+)>/)?.[1] || targetInput.replace(/[^0-9]/g, '');
        const targetUser = await guild.members.fetch(targetId).catch(() => null);

        if (!targetUser) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Usuário não encontrado no servidor.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        try {
            // Buscar os avisos do banco de dados
            const warnData = await Warn.findOne({ guildId: guild.id, userId: targetUser.id });

            if (!warnData || !warnData.warns.length) {
                const noWarnsEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription(`❌ **${targetUser.user.tag} não possui avisos.**`);

                return isInteraction
                    ? context.reply({ embeds: [noWarnsEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [noWarnsEmbed] });
            }

            // Listar os avisos
            const warnList = warnData.warns
                .map(warn =>
                    `**ID:** \`${warn.id}\`\n**Motivo:** "${warn.reason}"\n**Por:** <@${warn.moderator}>\n**Data:** ${new Date(warn.date).toLocaleString()}\n`
                )
                .join('\n');

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setTitle(`📋 Avisos de ${targetUser.user.tag}`)
                .setDescription(warnList)

            return isInteraction
                ? context.reply({ embeds: [successEmbed], ephemeral: false })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[Warns Command] Erro ao buscar avisos:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao buscar os avisos.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};