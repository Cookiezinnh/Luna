const { SlashCommandBuilder } = require('discord.js');
const SoftLock = require('../../models/softlock');
const RoleConfig = require('../../models/roleConfig');

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unsoftlock')
        .setDescription('Remove o softlock de um usuário.')
        .addStringOption(option =>
            option.setName('usuario')
                .setDescription('Usuário ou ID do usuário a ser desbloqueado.')
                .setRequired(true)),
    commandAlias: ['unlockuser','unuserlock','unpruneuser','unuserprune','unprune'],
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
                const errorMessage = ':x: O cargo "Softlock" não foi configurado no banco de dados.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            const softlockRole = guild.roles.cache.get(roleConfig.roleId);
            if (!softlockRole) {
                const errorMessage = ':x: O cargo "Softlock" configurado no banco de dados não foi encontrado no servidor.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            const targetId = targetInput?.replace(/[^0-9]/g, '');
            const member = targetId
                ? await guild.members.fetch(targetId).catch(() => null)
                : guild.members.cache.find(m =>
                    m.user.tag === targetInput || m.user.username === targetInput);

            if (!member) {
                const errorMessage = ':x: Usuário não encontrado.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            await member.roles.remove(softlockRole);

            await SoftLock.findOneAndDelete({ guildId: guild.id, userId: member.id });

            const successMessage = `✅ Usuário ${member.user.tag || targetId} foi desbloqueado.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[UnSoftLock Command] Erro ao desbloquear o usuário:', error);
            const errorMessage = ':x: Ocorreu um erro ao tentar desbloquear o usuário.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};