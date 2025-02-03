const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
                            .setColor('#FF0000') // Vermelho
                            .setTitle('❌ Nada Tocando')
                            .setDescription('Não há música tocando no momento.')
                            .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    ],
                    ephemeral: true,
                });
            }

            // Salva a música atual
            const currentSong = queue.songs[0];

            // Limpa a fila, mantendo apenas a música atual
            queue.songs = [currentSong];

            const embed = new EmbedBuilder()
                .setColor('#00FF00') // Verde
                .setTitle('🗑️ Fila Limpa')
                .setDescription('A fila foi limpa com sucesso, continuando a música atual.')
                .addFields(
                    { name: '🎶 Tocando Agora', value: `[${currentSong.name}](${currentSong.url}) (${currentSong.formattedDuration})`, inline: false }
                )
                .setThumbnail(currentSong.thumbnail)
                .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao limpar a fila:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho
                .setTitle('❌ Erro ao Limpar Fila')
                .setDescription(`**Motivo:** ${error.message || 'Desconhecido.'}`)
                .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};