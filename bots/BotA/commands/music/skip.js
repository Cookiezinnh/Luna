const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const channels = require('../../../../shared/channels.js'); // Importe o arquivo de canais

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription(
            'Pula a música atual. Caso haja 3 ou mais pessoas na call, inicia uma votação.'
        ),
    requiredRoles: [], // Restrições de Cargo
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(interaction) {
        const distube = interaction.client.distube;
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xED4245) // Vermelho
                        .setDescription('# ❌ Erro\n\nVocê precisa estar em um canal de voz para usar este comando.'),
                ],
                ephemeral: true,
            });
        }

        const membersInChannel = voiceChannel.members.filter((m) => !m.user.bot).size;

        try {
            const queue = distube.getQueue(interaction.guildId);
            if (!queue) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xED4245) // Vermelho
                            .setDescription('# ❌ Erro\n\nNão há nada tocando no momento.'),
                    ],
                });
            }

            // Verifica se há uma próxima música na fila
            if (queue.songs.length <= 1) {
                // Se não houver próxima música, para a fila e move para o canal de standby
                await queue.stop();
                console.log('🟨 | [Music] Fila de músicas vazia. Movendo para o canal de standby.');

                const homeChannelId = channels.LILYTH_HOME_CHANNEL;
                console.log('Tentando mover para o canal de standby:', homeChannelId);
                const homeChannel = await interaction.client.channels.fetch(homeChannelId).catch(console.error);

                if (homeChannel && homeChannel.isVoiceBased()) {
                    await distube.voices.join(homeChannel);
                    console.log(`🟩 | [Music] Reconectado ao canal de standby: ${homeChannel.name}`);
                } else {
                    console.error('🟥 | [Music] LILYTH_HOME_CHANNEL não é um canal de voz válido.');
                }

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x5865F2) // Azul
                            .setDescription('# ⏭️ Fila Finalizada\n\nA fila de músicas acabou. O bot foi movido para o canal de standby.'),
                    ],
                });
            }

            if (membersInChannel < 3) {
                await queue.skip();
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x57F287) // Verde
                            .setDescription('# ⏭️ Música Pulada\n\nA música foi pulada com sucesso.'),
                    ],
                });
            }

            // Inicia votação
            const message = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFEE75C) // Amarelo
                        .setDescription('# 🗳️ Votação Iniciada\n\nReaja com ✅ para votar em pular a música.'),
                ],
                fetchReply: true,
            });

            await message.react('✅');
            const filter = (reaction, user) =>
                reaction.emoji.name === '✅' && !user.bot;

            const collector = message.createReactionCollector({
                filter,
                time: 15000, // 15 segundos para votar
            });

            const voters = new Set();

            collector.on('collect', (reaction, user) => {
                voters.add(user.id);

                const requiredVotes = Math.ceil(membersInChannel / 2);

                if (voters.size >= requiredVotes) {
                    queue.skip();
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0x57F287) // Verde
                                .setDescription('# ⏭️ Votação Aprovada\n\nA música foi pulada com sucesso.'),
                        ],
                    });
                    collector.stop();
                }
            });

            collector.on('end', () => {
                if (voters.size < Math.ceil(membersInChannel / 2)) {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0xED4245) // Vermelho
                                .setDescription('# ❌ Votação Encerrada\n\nNão houve votos suficientes para pular a música.'),
                        ],
                    });
                }
            });
        } catch (error) {
            console.error('Erro ao pular a música:', error);
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xED4245) // Vermelho
                        .setDescription('# ❌ Erro\n\nNão foi possível pular a música.'),
                ],
            });
        }
    },
};