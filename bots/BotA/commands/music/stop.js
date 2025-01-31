const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ChannelConfig = require('../../models/channelConfig'); // Certifique-se de que o caminho esteja correto

// -------- x ---- - x - ---- x -------- \\
// Comando Atualizado para a nova update:
// -------- x ---- - x - ---- x -------- //

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Para a música e limpa toda a fila.'),
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
                            .setColor(0xff0000)
                            .setDescription('❌ Não há nada tocando no momento.'),
                    ],
                });
            }

            queue.stop(); // Para a música e limpa a fila
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setDescription('⏹️ A reprodução foi parada e a fila foi limpa.'),
                ],
            });

            // Após parar a música e limpar a fila, reconectar ao LILYTH_HOME_CHANNEL
            console.log('🟨 | [Music] Comando stop executado. Movendo para o canal LILYTH_HOME_CHANNEL.');

            const homeChannelConfig = await ChannelConfig.findOne({
                channelName: 'LILYTH_HOME_CHANNEL',
                guildId: interaction.guildId,
            });

            if (!homeChannelConfig) {
                console.error('🟥 | [Music] LILYTH_HOME_CHANNEL não está configurado no banco de dados.');
                return;
            }

            const homeChannel = await interaction.client.channels.fetch(homeChannelConfig.channelId);
            if (homeChannel?.isVoiceBased()) {
                await distube.voices.leave(queue.voiceChannel); // Sai do canal de voz atual
                await distube.voices.join(homeChannel); // Reconecta ao LILYTH_HOME_CHANNEL
                console.log(`🟩 | [Music] Reconectado ao canal LILYTH_HOME_CHANNEL: ${homeChannel.name}`);
            } else {
                console.error('🟥 | [Music] LILYTH_HOME_CHANNEL não é um canal de voz válido.');
            }

        } catch (error) {
            console.error('Erro ao parar a música:', error);
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('❌ Não foi possível parar a música.'),
                ],
            });
        }
    },
};