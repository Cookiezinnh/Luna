const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Warn = require('../../models/warns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Remove um aviso de um usuário pelo ID.')
        .addStringOption(option =>
            option.setName('alvo')
                .setDescription('Usuário ou ID do aviso a ser removido.')
                .setRequired(true)),
    commandAlias: ['unwarnuser', 'userunwarn'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let guild, options;

        // Identifica se é um comando Slash ou prefixado
        if (isInteraction) {
            guild = context.guild;
            options = context.options;
        } else {
            guild = context.guild;
            options = args;
        }

        // Obter o alvo (usuário ou ID do aviso)
        const targetInput = isInteraction
            ? options.getString('alvo')
            : args[0];

        const targetId = targetInput?.replace(/[^0-9]/g, ''); // Extrair números (ID ou menção)
        let targetUser;
        try {
            targetUser = await guild.members.fetch(targetId).catch(() => null);
        } catch (error) {
            console.error('[Unwarn Command] Erro ao buscar usuário:', error);
        }

        if (!targetUser) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Usuário ou ID inválido.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        const warnId = isInteraction
            ? options.getString('alvo')
            : args[1];

        if (!warnId) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **ID do aviso não fornecido.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        try {
            const warnData = await Warn.findOne({ guildId: guild.id, userId: targetUser.id });

            if (!warnData || !warnData.warns.length) {
                const noWarnsEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('❌ **Esse usuário não possui avisos.**');

                return isInteraction
                    ? context.reply({ embeds: [noWarnsEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [noWarnsEmbed] });
            }

            const warnIndex = warnData.warns.findIndex(warn => warn.id === warnId);
            if (warnIndex === -1) {
                const warnNotFoundEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('❌ **ID do aviso não encontrado.**');

                return isInteraction
                    ? context.reply({ embeds: [warnNotFoundEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [warnNotFoundEmbed] });
            }

            warnData.warns.splice(warnIndex, 1);
            await warnData.save();

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setDescription(`✅ **O aviso com ID \`${warnId}\` foi removido de ${targetUser.user.tag}.**`)

            return isInteraction
                ? context.reply({ embeds: [successEmbed], ephemeral: true })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[Unwarn Command] Erro ao remover aviso:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao remover o aviso.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};