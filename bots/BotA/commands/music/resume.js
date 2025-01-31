const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Retoma a música que está pausada.'),
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(interaction) {
        const distube = interaction.client.distube;

        try {
            const queue = distube.getQueue(interaction.guildId);
            if (!queue || !queue.paused) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setDescription('❌ Não há música pausada no momento.'),
                    ],
                    ephemeral: true,
                });
            }

            queue.resume();

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription('▶️ Música retomada com sucesso.');

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao retomar música:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erro ao Retomar Música')
                .setDescription(`**Motivo:** ${error.message || 'Desconhecido.'}`);

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};