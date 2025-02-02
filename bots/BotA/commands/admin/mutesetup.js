const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleConfig = require('../../models/roleConfig'); // Modelo MongoDB para configuração de cargos

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

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setDescription('✅ **Permissões de mute configuradas para todos os canais do servidor.**')

            return isInteraction
                ? context.editReply({ embeds: [successEmbed] })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[MuteSetup Command] Erro ao configurar permissões:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao configurar permissões de mute.**');

            return isInteraction
                ? context.editReply({ embeds: [errorEmbed] })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};