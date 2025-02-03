const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Mostra a fila atual.'),
    async execute(interaction) {
        const distube = interaction.client.distube;

        try {
            const queue = distube.getQueue(interaction.guildId);
            if (!queue) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setDescription('❌ Não há músicas na fila.')
                    ],
                    ephemeral: true
                });
            }

            const songs = queue.songs.map((song, index) => {
                const platformEmoji = song.source === 'spotify' ? emojis.spotify : emojis.youtube;
                return `**${index + 1}. ${platformEmoji} [${song.name}](${song.url})** (${song.formattedDuration})`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setColor('#0000FF')
                .setTitle('🎶 Fila de Músicas')
                .setDescription(songs || 'Nenhuma música na fila.')
                .setFooter({ text: `Total: ${queue.songs.length} música(s) • Duração total: ${queue.formattedDuration}` });

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao mostrar a fila:', error);
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ Não foi possível mostrar a fila.')
                ],
                ephemeral: true
            });
        }
    }
};