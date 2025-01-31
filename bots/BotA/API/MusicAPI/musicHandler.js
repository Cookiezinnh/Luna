const { DisTube } = require('distube');
const { EmbedBuilder } = require('discord.js');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const path = require('path');
const channels = require('../../../../shared/channels.js');
const emojis = require('../../../../shared/emojis');

module.exports = (client) => {
    client.distube = new DisTube(client, {
        emitNewSongOnly: true,
        nsfw: true,
        plugins: [
            new YtDlpPlugin({
                update: false,
                ytdlpArgs: [
                    '--cookies', path.resolve(__dirname, 'cookies.txt'),
                    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
                ],
            }),
        ],
    });

    // Função para conectar ao LILYTH_HOME_CHANNEL
    async function connectToHomeChannel() {
        try {
            const homeChannel = await client.channels.fetch(channels.LILYTH_HOME_CHANNEL);
            if (homeChannel?.isVoiceBased()) {
                await client.distube.voices.join(homeChannel);
                console.log(`🟩 | [Music] Conectado ao canal LILYTH_HOME_CHANNEL: ${homeChannel.name}`);
            } else {
                console.error('🟥 | [Music] LILYTH_HOME_CHANNEL não é um canal de voz válido.');
            }
        } catch (error) {
            console.error('🟥 | [Music] Erro ao conectar ao LILYTH_HOME_CHANNEL:', error);
        }
    }

    // Eventos do DisTube
    client.distube
        .on('playSong', (queue, song) => {
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`${emojis.youtube} Tocando Agora`)
                .setDescription(`**${song.name}** (${song.formattedDuration})\n[Link](${song.url})`)
                .setThumbnail(song.thumbnail);

            queue.textChannel?.send({ embeds: [embed] });
        })
        .on('addSong', (queue, song) => {
            const embed = new EmbedBuilder()
                .setColor('#0000FF')
                .setTitle(`${emojis.youtube} Música Adicionada à Fila`)
                .setDescription(`**${song.name}** (${song.formattedDuration})\n[Link](${song.url})`)
                .setThumbnail(song.thumbnail);

            queue.textChannel?.send({ embeds: [embed] });
        })
        .on('queueEnd', async (queue) => {
            console.log('🟨 | [Music] Fila de músicas vazia. Movendo para o canal LILYTH_HOME_CHANNEL.');
            try {
                await client.distube.voices.leave(queue.voiceChannel); // Sai do canal atual, se conectado
                await connectToHomeChannel(); // Reconecta ao canal LILYTH_HOME_CHANNEL
            } catch (error) {
                console.error('🟥 | [Music] Erro ao mover para o LILYTH_HOME_CHANNEL após a fila terminar:', error);
            }
        })
        .on('empty', async (queue) => {
            console.log('🟨 | [Music] Canal de voz vazio detectado. Movendo para o canal LILYTH_HOME_CHANNEL.');
            try {
                await client.distube.voices.leave(queue.voiceChannel); // Sai do canal atual
                await connectToHomeChannel(); // Reconecta ao LILYTH_HOME_CHANNEL
            } catch (error) {
                console.error('🟥 | [Music] Erro ao mover para o LILYTH_HOME_CHANNEL após o canal esvaziar:', error);
            }
        })             
        .on('error', (channel, error) => {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erro do Sistema de Música')
                .setDescription(`Erro: \`${error.message || 'Desconhecido'}\``);

            channel?.send?.({ embeds: [embed] }).catch(console.error);
        });

    // Conexão inicial ao LILYTH_HOME_CHANNEL
    client.once('ready', async () => {
        console.log('🟩 | [MusicHandler] Tentando conectar ao LILYTH_HOME_CHANNEL ao iniciar.');
        await connectToHomeChannel();
    });

    console.log('🟩 | [MusicHandler] DisTube configurado com sucesso!');
};