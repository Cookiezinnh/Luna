const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Warn = require('../../models/warns');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Adiciona um aviso a um usuário.')
        .addStringOption(option =>
            option.setName('alvo')
                .setDescription('Usuário e motivo no formato: "@usuario motivo" ou "ID motivo".')
                .setRequired(true)),
    commandAlias: ['userwarn', 'warnuser'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let guild, options;

        // Determinar se o comando é via interação ou prefixo
        if (isInteraction) {
            guild = context.guild;
            options = context.options;
        } else {
            guild = context.guild;
            options = args;
        }

        // Obter entrada "alvo" (combinada para usuário e motivo)
        const input = isInteraction
            ? options.getString('alvo')
            : args.join(' ');

        if (!input) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Você precisa fornecer um usuário e um motivo.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        // Extrair o usuário/ID e o motivo da entrada
        const targetId = input.match(/^<@!?(\d+)>/)?.[1] || input.split(' ')[0].replace(/[^0-9]/g, '');
        const reason = input.replace(/^<@!?(\d+)>|\d+/, '').trim();

        if (!reason) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Você precisa especificar um motivo para o aviso.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        // Buscar o membro alvo pelo ID
        const targetMember = await guild.members.fetch(targetId).catch(() => null);

        if (!targetMember) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Usuário não encontrado no servidor.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        const moderator = isInteraction ? context.user.id : context.author.id;

        try {
            let warnData = await Warn.findOne({ guildId: guild.id, userId: targetMember.id });
            const warnId = uuidv4();

            if (!warnData) {
                warnData = new Warn({
                    guildId: guild.id,
                    userId: targetMember.id,
                    warns: [],
                });
            }

            // Adicionar o aviso ao banco de dados
            warnData.warns.push({ id: warnId, reason, moderator });
            await warnData.save();

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setDescription(`✅ **${targetMember.user.tag} recebeu um aviso:**\n\n**Motivo:** ${reason}\n**ID do Warn:** \`${warnId}\``)

            return isInteraction
                ? context.reply({ embeds: [successEmbed], ephemeral: true })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[Warn Command] Erro ao adicionar aviso:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao adicionar o aviso.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};