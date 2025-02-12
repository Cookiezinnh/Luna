const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RoleConfig = require('../../models/roleConfig'); // Modelo MongoDB para configuração de cargos
const categories = require('../../../shared/categories'); // Importa categorias compartilhadas

module.exports = {
    data: new SlashCommandBuilder()
        .setName('softlocksetup')
        .setDescription('Configura permissões de softlock para todos os canais do servidor, exceto os da categoria SoftLock.'),
    commandAlias: ['setupsoftlock'],
    requiredRoles: ['ADMIN'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = context.guild;

        // Obtém o cargo SOFTLOCKED_ROLE do MongoDB
        const softlockRoleConfig = await RoleConfig.findOne({ roleName: 'SOFTLOCKED_ROLE', guildId: guild.id });
        if (!softlockRoleConfig) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **O cargo "Softlock" não está configurado no servidor.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        const softlockRole = guild.roles.cache.get(softlockRoleConfig.roleId);
        if (!softlockRole) {
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **O cargo "Softlock" configurado não foi encontrado no servidor.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }

        try {
            if (isInteraction) {
                await context.deferReply({ ephemeral: true });
            }

            // Filtra canais fora da categoria SoftLock e ignora categorias
            const channels = guild.channels.cache.filter(
                channel => channel.parentId !== categories.SOFTLOCK_CATEGORY && (channel.isTextBased() || channel.isVoiceBased())
            );

            for (const channel of channels.values()) {
                if (!channel.permissionOverwrites) continue; // Verifica se o canal suporta permissões

                await channel.permissionOverwrites.edit(softlockRole, {
                    ViewChannel: false,
                    SendMessages: false,
                    Connect: false,
                    ReadMessageHistory: false,
                });
            }

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setDescription('✅ **Permissões de softlock configuradas para todos os canais do servidor (exceto os da categoria SoftLock).**')

            return isInteraction
                ? context.editReply({ embeds: [successEmbed] })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[SoftLockSetup Command] Erro ao configurar permissões:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao configurar permissões de softlock.**');

            return isInteraction
                ? context.editReply({ embeds: [errorEmbed] })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};