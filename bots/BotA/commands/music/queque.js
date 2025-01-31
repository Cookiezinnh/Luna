const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Mostra a fila atual.'),
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
                            .setColor('#FF0000') // Vermelho
                            .setDescription('❌ Não há músicas na fila.'),
                    ],
                });
            }

            const songs = queue.songs.map((song, index) => {
                const platformEmoji = song.source === 'spotify'
                    ? emojis.spotify
                    : emojis.youtube;

                return `**${index + 1}. ${platformEmoji} ${song.name} (${song.formattedDuration})**\n┗ \\<${song.url}\\>\n\n`;
            }).join('');

            const embed = new EmbedBuilder()
                .setColor('#0000FF') // Azul
                .setTitle('🎶 Fila Atual')
                .setDescription(songs || 'Nenhuma música na fila.')
                .setFooter({
                    text: `Total: ${queue.songs.length} música(s) • Duração total: ${queue.formattedDuration}`,
                });

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao mostrar a fila:', error);
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000') // Vermelho
                        .setDescription('❌ Não foi possível mostrar a fila.'),
                ],
            });
        }
    },
};