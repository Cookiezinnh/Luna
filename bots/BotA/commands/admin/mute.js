const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Mute = require('../../models/mute');
const RoleConfig = require('../../models/roleConfig'); // Modelo MongoDB para configuração de cargos

function parseTime(input) {
    const regex = /(\d+)([smhda])/g;
    let totalMilliseconds = 0;
    let match;

    while ((match = regex.exec(input)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 's': totalMilliseconds += value * 1000; break;
            case 'm': totalMilliseconds += value * 60000; break;
            case 'h': totalMilliseconds += value * 3600000; break;
            case 'd': totalMilliseconds += value * 86400000; break;
            case 'a': totalMilliseconds += value * 31536000000; break;
            default: throw new Error('Unidade de tempo inválida.');
        }
    }

    return totalMilliseconds;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Muta um usuário por um tempo definido.')
        .addStringOption(option =>
            option.setName('alvo')
                .setDescription('Usuário ou ID do usuário a ser mutado. (mencione, forneça o ID ou o nome)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tempo')
                .setDescription('Tempo para manter o mute (ex: 10m, 2h)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo para mutar o usuário.')
                .setRequired(false)),
    commandAlias: ['muteuser', 'usermute'],
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
            : args.slice(2).join(' ') || 'Motivo não especificado';

        const duration = isInteraction
            ? options.getString('tempo')
            : args[1];

        const targetId = targetInput?.replace(/[^0-9]/g, ''); // Extrair apenas números, caso seja menção
        const target = targetId
            ? await guild.members.fetch(targetId).catch(() => null)
            : guild.members.cache.find(member =>
                member.user.tag === targetInput || member.user.username === targetInput);

        // Obtém o cargo MUTED_ROLE do MongoDB
        const mutedRoleConfig = await RoleConfig.findOne({ roleName: 'MUTED_ROLE', guildId: guild.id });
        if (!mutedRoleConfig) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **O cargo de "Mutado" não está configurado no servidor.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        const muteRole = guild.roles.cache.get(mutedRoleConfig.roleId);
        if (!muteRole) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **O cargo de "Mutado" configurado não foi encontrado no servidor.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        if (!target) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Usuário não encontrado.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        let milliseconds;
        try {
            milliseconds = parseTime(duration);
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Formato de tempo inválido. Use s, m, h, d, a.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        const unmuteAt = new Date(Date.now() + milliseconds);

        try {
            await target.roles.add(muteRole);
            await Mute.create({
                guildId: guild.id,
                userId: target.id,
                muteRoleId: muteRole.id,
                unmuteAt,
            });

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setDescription(`✅ **Usuário ${target.user?.tag || targetId} foi mutado por ${duration}.**\n\n**Motivo:** ${reason}`)

            await (isInteraction
                ? context.reply({ embeds: [successEmbed], ephemeral: true })
                : context.channel.send({ embeds: [successEmbed] }));

            setTimeout(async () => {
                try {
                    const muteData = await Mute.findOneAndDelete({
                        guildId: guild.id,
                        userId: target.id,
                    });

                    if (muteData) {
                        const updatedMember = guild.members.cache.get(target.id);
                        if (updatedMember) {
                            await updatedMember.roles.remove(muteRole);
                            console.log(`[Mute Command] Mute removido de ${target.user?.tag || targetId}.`);
                        } else {
                            console.warn(`[Mute Command] O membro ${target.user?.tag || targetId} não está mais no servidor.`);
                        }
                    }
                } catch (error) {
                    console.error(`[Mute Command] Erro ao remover mute de ${target.user?.tag || targetId}:`, error);
                }
            }, milliseconds);
        } catch (error) {
            console.error('[Mute Command] Erro ao mutar o usuário:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao tentar mutar o usuário.**');

            await (isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] }));
        }
    },
};