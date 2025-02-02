const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa um usuário do servidor.')
        .addStringOption(option =>
            option.setName('alvo')
                .setDescription('Usuário ou ID do usuário a ser expulso. (mencione, forneça o ID ou o nome)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo para expulsar o usuário.')
                .setRequired(false)),
    commandAlias: ['kickuser', 'userkick'],
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

        const reason = isInteraction
            ? options.getString('motivo') || 'Motivo não especificado'
            : args.slice(1).join(' ') || 'Motivo não especificado';

        // Tentar obter o membro
        const targetId = targetInput?.replace(/[^0-9]/g, ''); // Extrair apenas números (caso seja menção)
        const targetMember = targetId
            ? await guild.members.fetch(targetId).catch(() => null)
            : guild.members.cache.find(member =>
                member.user.tag === targetInput || member.user.username === targetInput);

        if (!targetMember) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Usuário não encontrado.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        try {
            await targetMember.kick(reason);

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setDescription(`✅ **Usuário ${targetMember.user?.tag || targetId} foi expulso do servidor.**\n\n**Motivo:** ${reason}`)

            return isInteraction
                ? context.reply({ embeds: [successEmbed], ephemeral: true })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[Kick Command] Erro ao expulsar o usuário:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao tentar expulsar o usuário.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};