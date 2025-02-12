const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleConfig = require('../../models/roleConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Exibe informações detalhadas sobre o servidor.'),
    commandAlias: ['infoserver', 'server'],
    requiredRoles: [], // Acessível a todos
    supportsPrefix: true,

    async execute(context) {
        const isInteraction = context.isCommand?.();
        const guild = context.guild;

        try {
            const owner = await guild.fetchOwner();
            const roles = guild.roles.cache.size;
            const channels = guild.channels.cache.size;
            const members = guild.memberCount;
            const createdAt = guild.createdAt;
            const iconUrl = guild.iconURL({ dynamic: true, size: 1024 });

            // Cria o embed com as informações do servidor
            const embed = new EmbedBuilder()
                .setDescription(`# 🏰 Informações do Servidor\n\n- **Nome:** ${guild.name}\n- **ID:** ${guild.id}`)
                .setColor(15548997) // Vermelho
                .setThumbnail(iconUrl)
                .addFields(
                    { name: 'Dono', value: owner.user.tag, inline: true },
                    { name: 'Membros', value: members.toString(), inline: true },
                    { name: 'Cargos', value: roles.toString(), inline: true },
                    { name: 'Canais', value: channels.toString(), inline: true },
                    { name: 'Criado em', value: `<t:${Math.floor(createdAt / 1000)}:F>`, inline: true }
                )
                .setTimestamp();

            // Verifica se o executor tem permissão de ADMIN ou MODERATOR
            const adminRoleId = await RoleConfig.findOne({ roleName: 'ADMIN' }).then(r => r ? r.roleId : null);
            const moderatorRoleId = await RoleConfig.findOne({ roleName: 'MODERATOR' }).then(r => r ? r.roleId : null);
            const executor = isInteraction ? context.member : guild.members.cache.get(context.author.id);
            const hasAdminRole = executor.roles.cache.has(adminRoleId) || executor.roles.cache.has(moderatorRoleId);

            if (hasAdminRole) {
                // Adiciona informações adicionais para administradores/moderadores
                embed.addFields(
                    { name: 'Status do Servidor', value: guild.available ? '-# ✅ | Servidor Online' : '-# ❌ | Servidor Offline', inline: true },
                    { name: 'Nível de Verificação', value: `-# ${guild.verificationLevel}`, inline: true },
                    { name: 'Boosters', value: guild.premiumSubscriptionCount.toString(), inline: true }
                );
            }

            return isInteraction
                ? context.reply({ embeds: [embed] })
                : context.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('[ServerInfo Command] Erro ao buscar informações:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao buscar as informações do servidor.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};