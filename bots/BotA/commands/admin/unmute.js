const { SlashCommandBuilder } = require('discord.js');
const RoleConfig = require('../../models/roleConfig'); // Modelo MongoDB para configuração de cargos

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Desmuta um usuário.')
        .addStringOption(option =>
            option.setName('usuario')
                .setDescription('Usuário ou ID do usuário a ser desmutado.')
                .setRequired(true)),
    commandAlias: ['userunmute','unmuteuser'],
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

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

        // Obtém o cargo MUTED_ROLE do MongoDB
        const mutedRoleConfig = await RoleConfig.findOne({ roleName: 'MUTED_ROLE', guildId: guild.id });
        if (!mutedRoleConfig) {
            const errorMessage = ':x: O cargo de "Mutado" não está configurado no servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        const muteRole = guild.roles.cache.get(mutedRoleConfig.roleId);
        if (!muteRole) {
            const errorMessage = ':x: O cargo de "Mutado" configurado não foi encontrado no servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Tentar obter o membro pelo ID, menção ou nome
        const targetId = targetInput?.replace(/[^0-9]/g, ''); // Extrair apenas números (caso seja menção)
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

        try {
            // Remover o cargo "mutado" do usuário
            await member.roles.remove(muteRole);
            const successMessage = `✅ Usuário ${member.user.tag || targetId} foi desmutado.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[Unmute Command] Erro ao desmutar o usuário:', error);
            const errorMessage = ':x: Ocorreu um erro ao tentar desmutar o usuário.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};