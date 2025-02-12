const { SlashCommandBuilder } = require('discord.js');
const AdminBypass = require('../../models/AdminBypass.js'); // Modelo MongoDB
const RoleConfig = require('../../models/roleConfig.js'); // Modelo de configuração de cargos

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moderatormode')
        .setDescription('Alterna o modo de moderador para o usuário.'),
    commandAlias: ['modmode','moderator','mod'],
    requiredRoles: [], // Sem restrição de cargo
    supportsPrefix: true,

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = isInteraction ? context.guild : context.guild;
        const userId = isInteraction ? context.user.id : context.author.id;

        // Verifica se o usuário está na lista de bypass
        const isBypassed = await AdminBypass.findOne({ guildId: guild.id, userId });
        if (!isBypassed) {
            const errorMessage = ':x: Você não tem permissão para alternar o modo de moderador.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        const member = await guild.members.fetch(userId).catch(() => null);

        if (!member) {
            const errorMessage = ':x: Não foi possível encontrar seu usuário no servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Busca o cargo "MODERATOR" no MongoDB
        const modRoleConfig = await RoleConfig.findOne({ roleName: 'MODERATOR', guildId: guild.id });
        if (!modRoleConfig) {
            const errorMessage = ':x: O cargo de moderador não foi configurado neste servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Verifica se o cargo existe no servidor
        const modRole = guild.roles.cache.get(modRoleConfig.roleId);
        if (!modRole) {
            const errorMessage = ':x: O cargo de moderador configurado não foi encontrado no servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        if (member.roles.cache.has(modRole.id)) {
            // Remove o cargo de moderador
            await member.roles.remove(modRole).catch(error => {
                console.error('[Mod Mode] Erro ao remover o cargo de moderador:', error);
                const errorMessage = ':x: Não foi possível remover o cargo de moderador.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            });
            const successMessage = '✅ Você saiu do modo de moderador.';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } else {
            // Adiciona o cargo de moderador
            await member.roles.add(modRole).catch(error => {
                console.error('[Mod Mode] Erro ao adicionar o cargo de moderador:', error);
                const errorMessage = ':x: Não foi possível adicionar o cargo de moderador.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            });
            const successMessage = '✅ Você entrou no modo de moderador.';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        }
    },
};
