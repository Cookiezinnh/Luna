const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const rolecolorConfig = require('../../models/rolecolorConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list_colors')
        .setDescription('Exibe todas as cores disponíveis no servidor.'),
    commandAlias: ['colorlist', 'listcolors', 'colors_list'],
    requiredRoles: [], // Sem restrição de cargo
    supportsPrefix: true,

    async execute(context) {
        const isInteraction = context.isCommand?.();
        const guildId = context.guild.id;

        try {
            const colors = await rolecolorConfig.find({ guildId });

            if (!colors.length) {
                const noColorsEmbed = new EmbedBuilder()
                    .setColor(15548997) // Vermelho
                    .setDescription('⚠️ **Nenhuma cor foi configurada para este servidor.**');

                return isInteraction
                    ? context.reply({ embeds: [noColorsEmbed], ephemeral: true })
                    : context.channel.send({ embeds: [noColorsEmbed] });
            }

            const colorList = colors
                .map(color => `🎨 **${color.customName}** (*${color.colorName}*) → <@&${color.roleId}> (\`${color.roleId}\`)`)
                .join('\n');

            const successEmbed = new EmbedBuilder()
                .setColor(5763719) // Verde
                .setTitle('🎨 **Cores disponíveis neste servidor:**')
                .setDescription(colorList);

            return isInteraction
                ? context.reply({ embeds: [successEmbed], ephemeral: false })
                : context.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[List Colors] Erro ao buscar cores:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997) // Vermelho
                .setDescription('❌ **Ocorreu um erro ao buscar as cores disponíveis.**');

            return isInteraction
                ? context.reply({ embeds: [errorEmbed], ephemeral: true })
                : context.channel.send({ embeds: [errorEmbed] });
        }
    },
};