const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearqueue')
        .setDescription('Limpa a fila atual, mas continua tocando a música.'),
    requiredRoles: ['ADMIN', 'MODERATOR'], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(interaction) {
        const distube = interaction.client.distube;

        try {
            const queue = distube.getQueue(interaction.guildId);
            if (!queue) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setDescription('❌ Não há nada tocando no momento.'),
                    ],
                    ephemeral: true,
                });
            }

            queue.songs = [queue.songs[0]];

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription('🗑️ Fila limpa com sucesso, continuando a música atual.');

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao limpar a fila:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erro ao Limpar Fila')
                .setDescription(`**Motivo:** ${error.message || 'Desconhecido.'}`);

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};