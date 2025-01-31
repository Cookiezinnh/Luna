const SoftLock = require('../../models/softlock'); // Modelo de SoftLock
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const AdminBypass = require('../../models/AdminBypass.js'); // Modelo MongoDB
const BotStaffList = require('../../models/botStaffList'); // Modelo da lista de staff
const RoleConfig = require('../../models/roleConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userlookup')
        .setDescription('Exibe informações de um usuário.')
        .addStringOption(option =>
            option.setName('usuário')
                .setDescription('ID, nome, nome#0000 ou menção (@usuário) do usuário')
                .setRequired(true)),
    commandAlias: ['lookupuser', 'userinfo'],
    requiredRoles: [], // Comando acessível a todos
    supportsPrefix: true,

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = isInteraction ? context.guild : context.guild;
        const input = isInteraction ? context.options.getString('usuário') : args.join(' ');
        const executor = isInteraction ? context.member : guild.members.cache.get(context.author.id);

        let user;
        let member;

        // Verifica se a entrada é uma menção (ex: <@123456789012345678>)
        const mentionMatch = input.match(/^<@!?(\d+)>$/);
        const userIdFromMention = mentionMatch ? mentionMatch[1] : null;

        // Busca pelo ID (usuários globais ou no servidor)
        if (/^\d+$/.test(input) || userIdFromMention) {
            const userId = userIdFromMention || input; // Usa o ID da menção ou o input diretamente
            try {
                // Tenta buscar o usuário globalmente
                user = await context.client.users.fetch(userId);
                // Tenta buscar o membro no servidor
                member = await guild.members.fetch(userId).catch(() => null);
            } catch (error) {
                console.error('Erro ao buscar usuário:', error);
                return isInteraction
                    ? context.reply({ content: ':x: Usuário não encontrado.', ephemeral: true })
                    : context.channel.send(':x: Usuário não encontrado.');
            }
        } else {
            // Busca pelo nome ou tag (apenas no servidor)
            member = guild.members.cache.find(m => 
                m.user.tag.toLowerCase() === input.toLowerCase() ||
                m.user.username.toLowerCase() === input.toLowerCase()
            );
            if (member) {
                user = member.user;
            } else {
                // Se o usuário não está no servidor, não podemos buscar globalmente apenas pelo nome/tag
                return isInteraction
                    ? context.reply({ content: ':x: Usuário não encontrado no servidor. Use o ID ou menção para buscar usuários globais.', ephemeral: true })
                    : context.channel.send(':x: Usuário não encontrado no servidor. Use o ID ou menção para buscar usuários globais.');
            }
        }

        // Cria o embed com as informações do usuário
        const embed = new EmbedBuilder()
            .setDescription(`# 🔍 Informações do Usuário\n\n- **Nome:** ${user.username}\n- **ID:** ${user.id}`)
            .setColor(15548997)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: 'Criado em', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true }
            )
            .setTimestamp();

        // Se o usuário está no servidor, adiciona informações adicionais
        if (member) {
            if (member.joinedAt) {
                embed.addFields({ name: 'Entrou no servidor em', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true });
            }
        } else {
            embed.addFields({ name: 'Status no Servidor', value: '-# ❌ | O Usuário não está no servidor', inline: true });
        }

        // Obtém os IDs corretos dos cargos ADMIN e MODERATOR
        const adminRoleId = await RoleConfig.findOne({ roleName: 'ADMIN' }).then(r => r ? r.roleId : null);
        const moderatorRoleId = await RoleConfig.findOne({ roleName: 'MODERATOR' }).then(r => r ? r.roleId : null);

        // Verifica se o executor possui um dos cargos
        const hasAdminRole = executor.roles.cache.has(adminRoleId) || executor.roles.cache.has(moderatorRoleId);

        if (hasAdminRole) {
            // Verifica se o usuário faz parte da equipe SNOWYIE
            const isStaff = await BotStaffList.findOne({ userId: user.id });
            const isBypassed = await AdminBypass.findOne({ guildId: guild.id, userId: user.id });

            // Verifica se o usuário está softlockado (mesmo que não esteja no servidor)
            const isSoftLocked = await SoftLock.findOne({ userId: user.id, guildId: guild.id });

            embed.addFields(
                { name: 'Time de Desenvolvimento da SNOWYIE', value: isStaff ? '-# ✅ | O Usuário faz parte da Administração / Moderação da Luna' : '-# ❌ | O Usuário não faz parte da Administração / Moderação da Luna' },
                { name: 'Equipe do Servidor', value: isBypassed ? '-# ✅ | O Usuário Possui Permissão para Utilizar o Bypass' : '-# ❌ | O Usuário não Possui Permissão para Utilizar o Bypass' },
                { name: 'Status de SoftLock', value: isSoftLocked ? '-# 🔒 | O Usuário está SoftLockado' : '-# 🔓 | O Usuário não está SoftLockado' }
            );
        }

        return isInteraction
            ? context.reply({ embeds: [embed] })
            : context.channel.send({ embeds: [embed] });
    },
};