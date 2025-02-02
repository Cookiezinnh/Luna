const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Warn = require('../../models/warns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Remove todos os avisos de um usuário.')
        .addStringOption(option =>
            option.setName('alvo')
                .setDescription('Usuário ou ID do usuário alvo. (mencione, forneça o ID ou o nome)')
                .setRequired(true)),
    commandAlias: ['clswarns', 'removeallwarns'],
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

        // Obter o alvo pelo ID, menção ou nome
        const targetInput = isInteraction
            ? options.getString('alvo')
            : args[0];

        // Tentar obter o membro
        const targetId = targetInput?.replace(/[^0-9]/g, ''); // Extrair apenas números (caso seja menção)
        const target = targetId
            ? await guild.members.fetch(targetId).catch(() => null)
            : guild.members.cache.find(member =>
                member.user.tag === targetInput || member.user.username === targetInput);

        if (!target) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Usuário não encontrado.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        try {
            const warnData = await Warn.findOne({ guildId: guild.id, userId: target.id });

            if (!warnData || !warnData.warns.length) {
                const noWarnsEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('❌ **Esse usuário não possui avisos.**');

                return isInteraction
                    ? context.reply({ embeds: [noWarnsEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [noWarnsEmbed] });
            }

            warnData.warns = [];
            await warnData.save();

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setDescription(`✅ **Todos os avisos de ${target.user?.tag || targetId} foram removidos.**`)

            return isInteraction
                ? context.reply({ embeds: [successEmbed], ephemeral: true })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[ClearWarns Command] Erro ao limpar avisos:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao limpar os avisos.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};