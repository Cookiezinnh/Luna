const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SoftLock = require('../../models/softlock');
const RoleConfig = require('../../models/roleConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unsoftlock')
        .setDescription('Remove o softlock de um usuário.')
        .addStringOption(option =>
            option.setName('usuario')
                .setDescription('Usuário ou ID do usuário a ser desbloqueado.')
                .setRequired(true)),
    commandAlias: ['unlockuser', 'unuserlock', 'unpruneuser', 'unuserprune', 'unprune'],
    requiredRoles: ['ADMIN', 'MODERATOR'],
    supportsPrefix: true,

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let targetInput, guild;

        if (isInteraction) {
            targetInput = context.options.getString('usuario');
            guild = context.guild;
        } else {
            targetInput = args[0];
            guild = context.guild;
        }

        try {
            // Busca o cargo "Softlock" no MongoDB
            const roleConfig = await RoleConfig.findOne({ roleName: 'SOFTLOCKED_ROLE', guildId: guild.id });
            if (!roleConfig) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('❌ **O cargo "Softlock" não foi configurado no banco de dados.**');

                return isInteraction
                    ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [errorEmbed] });
            }

            const softlockRole = guild.roles.cache.get(roleConfig.roleId);
            if (!softlockRole) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('❌ **O cargo "Softlock" configurado no banco de dados não foi encontrado no servidor.**');

                return isInteraction
                    ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [errorEmbed] });
            }

            const targetId = targetInput?.replace(/[^0-9]/g, '');
            const member = targetId
                ? await guild.members.fetch(targetId).catch(() => null)
                : guild.members.cache.find(m =>
                    m.user.tag === targetInput || m.user.username === targetInput);

            if (!member) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('❌ **Usuário não encontrado.**');

                return isInteraction
                    ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [errorEmbed] });
            }

            await member.roles.remove(softlockRole);

            await SoftLock.findOneAndDelete({ guildId: guild.id, userId: member.id });

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setDescription(`✅ **Usuário ${member.user.tag || targetId} foi desbloqueado.**`)

            return isInteraction
                ? context.reply({ embeds: [successEmbed], ephemeral: false })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[UnSoftLock Command] Erro ao desbloquear o usuário:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao tentar desbloquear o usuário.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};