const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const emojis = require('../../../shared/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Mostra a fila atual.'),
    commandAlias: ['queque'],
    supportsPrefix: true, // Habilita suporte a prefixo
    async execute(interaction, args) {
        const distube = interaction?.client.distube || args.client.distube;
        const voiceChannel = interaction?.member?.voice.channel || args.member?.voice.channel;

        if (!voiceChannel) {
            const reply = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xED4245) // Vermelho
                        .setDescription('# ❌ Erro\n\nVocê precisa estar em um canal de voz para usar este comando.'),
                ],
                ephemeral: true,
            };

            return interaction ? interaction.reply(reply) : args.message.reply(reply);
        }

        try {
            const queue = distube.getQueue(interaction?.guildId || args.guildId);
            if (!queue) {
                const reply = {
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xED4245) // Vermelho
                            .setDescription('# ❌ Erro\n\nNão há músicas na fila.'),
                    ],
                    ephemeral: true,
                };

                return interaction ? interaction.reply(reply) : args.message.reply(reply);
            }

            const songs = queue.songs.map((song, index) => {
                const platformEmoji = song.source === 'spotify' ? emojis.spotify : emojis.youtube;
                return `**${index + 1}. ${platformEmoji} [${song.name}](${song.url})** (${song.formattedDuration})`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setColor(0x5865F2) // Azul
                .setDescription(`# 🎶 Fila de Músicas\n\n${songs || 'Nenhuma música na fila.'}\n\n- **Total:** ${queue.songs.length} música(s)\n- **Duração total:** ${queue.formattedDuration}`);

            return interaction ? interaction.reply({ embeds: [embed] }) : args.message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao mostrar a fila:', error);
            const reply = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xED4245) // Vermelho
                        .setDescription('# ❌ Erro\n\nNão foi possível mostrar a fila.'),
                ],
                ephemeral: true,
            };

            return interaction ? interaction.reply(reply) : args.message.reply(reply);
        }
    },
};