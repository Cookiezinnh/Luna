const { SlashCommandBuilder } = require('discord.js');
const AdminBypass = require('../../models/AdminBypass.js'); // Modelo MongoDB
const RoleConfig = require('../../models/roleConfig.js'); // Modelo de configuração de cargos

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adminmode')
        .setDescription('Alterna o modo de administrador para o usuário.'),
    commandAlias: ['admmode','admin','adm'],
    requiredRoles: [], // Sem restrição de cargo
    supportsPrefix: true,

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = isInteraction ? context.guild : context.guild;
        const userId = isInteraction ? context.user.id : context.author.id;

        // Verifica se o usuário está na lista de bypass
        const isBypassed = await AdminBypass.findOne({ guildId: guild.id, userId });
        if (!isBypassed) {
            const errorMessage = ':x: Você não tem permissão para alternar o modo de administrador.';
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

        // Busca o cargo "ADMIN" no MongoDB
        const adminRoleConfig = await RoleConfig.findOne({ roleName: 'ADMIN', guildId: guild.id });
        if (!adminRoleConfig) {
            const errorMessage = ':x: O cargo de administrador não foi configurado neste servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Verifica se o cargo de administrador existe no servidor
        const adminRole = guild.roles.cache.get(adminRoleConfig.roleId);
        if (!adminRole) {
            const errorMessage = ':x: O cargo de administrador configurado não foi encontrado no servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        if (member.roles.cache.has(adminRole.id)) {
            // Remove o cargo de administrador
            await member.roles.remove(adminRole).catch(error => {
                console.error('[Admin Mode] Erro ao remover o cargo de administrador:', error);
                const errorMessage = ':x: Não foi possível remover o cargo de administrador.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            });
            const successMessage = '✅ Você saiu do modo de administrador.';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } else {
            // Adiciona o cargo de administrador
            await member.roles.add(adminRole).catch(error => {
                console.error('[Admin Mode] Erro ao adicionar o cargo de administrador:', error);
                const errorMessage = ':x: Não foi possível adicionar o cargo de administrador.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            });
            const successMessage = '✅ Você entrou no modo de administrador.';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        }
    },
};
