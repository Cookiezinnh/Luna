const { SlashCommandBuilder } = require('discord.js');
const RoleConfig = require('../../models/roleConfig'); // Modelo MongoDB para configuração de cargos

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mutesetup')
        .setDescription('Configura permissões de mute para todos os canais do servidor.'),
    commandAlias: ['setupmute'],
    requiredRoles: ['ADMIN'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = isInteraction ? context.guild : context.guild;
        const member = isInteraction ? context.member : context.member || context.author;

        // Obtém o cargo MUTED_ROLE do MongoDB
        const mutedRoleConfig = await RoleConfig.findOne({ roleName: 'MUTED_ROLE', guildId: guild.id });
        if (!mutedRoleConfig) {
            const replyMessage = ':x: O cargo de "Mutado" não está configurado no servidor.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        const muteRole = guild.roles.cache.get(mutedRoleConfig.roleId);
        if (!muteRole) {
            const replyMessage = ':x: O cargo de "Mutado" configurado não foi encontrado no servidor.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        try {
            if (isInteraction) {
                await context.deferReply({ ephemeral: true });
            }

            const channels = guild.channels.cache.filter(channel => 
                channel.isTextBased() || channel.isVoiceBased()
            );

            for (const channel of channels.values()) {
                // Verifica se o canal suporta permissão e se o cargo pode ser configurado
                if (!channel.permissionOverwrites) continue;

                await channel.permissionOverwrites.edit(muteRole, {
                    SendMessages: false,
                    Speak: false,
                });
            }

            const successMessage = '✅ Permissões de mute configuradas para todos os canais do servidor.';
            return isInteraction
                ? context.editReply(successMessage)
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[MuteSetup Command] Erro ao configurar permissões:', error);
            const errorMessage = ':x: Ocorreu um erro ao configurar permissões de mute.';
            return isInteraction
                ? context.editReply(errorMessage)
                : context.channel.send(errorMessage);
        }
    },
};