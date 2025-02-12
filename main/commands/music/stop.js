const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const channels = require('../../../shared/channels.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Para a música e limpa toda a fila.'),
    requiredRoles: [], // Restrições de Cargo
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
                            .setDescription('# ❌ Erro\n\nNão há nada tocando no momento.'),
                    ],
                };

                return interaction ? interaction.reply(reply) : args.message.reply(reply);
            }

            queue.stop(); // Para a música e limpa a fila
            const reply = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x5865F2) // Azul
                        .setDescription('# ⏹️ Reprodução Parada\n\nA reprodução foi parada e a fila foi limpa.'),
                ],
            };

            console.log('🟨 | [Music] Comando stop executado. A fila foi limpa.');

            // Reconectar ao canal de standby após parar a música
            const homeChannel = await (interaction?.client || args.client).channels.fetch(channels.LILYTH_HOME_CHANNEL);
            if (homeChannel?.isVoiceBased()) {
                await distube.voices.join(homeChannel);
                console.log(`🟩 | [Music] Reconectado ao canal LILYTH_HOME_CHANNEL: ${homeChannel.name}`);
            } else {
                console.error('🟥 | [Music] LILYTH_HOME_CHANNEL não é um canal de voz válido.');
            }

            return interaction ? interaction.reply(reply) : args.message.reply(reply);
        } catch (error) {
            console.error('Erro ao parar a música:', error);
            const reply = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xED4245) // Vermelho
                        .setDescription('# ❌ Erro\n\nNão foi possível parar a música.'),
                ],
            };

            return interaction ? interaction.reply(reply) : args.message.reply(reply);
        }
    },
};