const { SlashCommandBuilder } = require('discord.js');
const AdminBypass = require('../../models/AdminBypass.js'); // Modelo MongoDB
const RoleConfig = require('../../models/roleConfig.js'); // Modelo de configuração de cargos

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('helpermode')
        .setDescription('Alterna o modo de helper para o usuário.'),
    commandAlias: ['hprmode','helper','hpr'],
    requiredRoles: [], // Sem restrição de cargo
    supportsPrefix: true,

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = isInteraction ? context.guild : context.guild;
        const userId = isInteraction ? context.user.id : context.author.id;

        // Verifica se o usuário está na lista de bypass
        const isBypassed = await AdminBypass.findOne({ guildId: guild.id, userId });
        if (!isBypassed) {
            const errorMessage = ':x: Você não tem permissão para alternar o modo de helper.';
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

        // Busca o cargo "HELPER" no MongoDB
        const helperRoleConfig = await RoleConfig.findOne({ roleName: 'HELPER', guildId: guild.id });
        if (!helperRoleConfig) {
            const errorMessage = ':x: O cargo de helper não foi configurado neste servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Verifica se o cargo existe no servidor
        const helperRole = guild.roles.cache.get(helperRoleConfig.roleId);
        if (!helperRole) {
            const errorMessage = ':x: O cargo de helper configurado não foi encontrado no servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        if (member.roles.cache.has(helperRole.id)) {
            // Remove o cargo de helper
            await member.roles.remove(helperRole).catch(error => {
                console.error('[Helper Mode] Erro ao remover o cargo de helper:', error);
                const errorMessage = ':x: Não foi possível remover o cargo de helper.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            });
            const successMessage = '✅ Você saiu do modo de helper.';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } else {
            // Adiciona o cargo de helper
            await member.roles.add(helperRole).catch(error => {
                console.error('[Helper Mode] Erro ao adicionar o cargo de helper:', error);
                const errorMessage = ':x: Não foi possível adicionar o cargo de helper.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            });
            const successMessage = '✅ Você entrou no modo de helper.';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        }
    },
};