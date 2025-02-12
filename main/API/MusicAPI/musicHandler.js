const { DisTube } = require('distube');
const { EmbedBuilder } = require('discord.js');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const path = require('path');
const fs = require('fs');
const channels = require('../../../shared/channels.js');
const Cookie = require('../../models/musicCookie'); // Importe o modelo do cookie

module.exports = (client) => {
    client.distube = new DisTube(client, {
        emitNewSongOnly: true,
        nsfw: true,
        plugins: [
            new YtDlpPlugin({
                update: false,
                ytdlpArgs: async () => {
                    try {
                        // Busca o cookie mais recente no banco de dados
                        const cookie = await Cookie.findOne().sort({ lastUpdated: -1 });
                        if (!cookie || !cookie.cookieText) {
                            console.error('🟥 | [MusicHandler] Nenhum cookie encontrado no banco de dados.');
                            return [];
                        }

                        // Salva o cookie em um arquivo temporário
                        const cookiePath = path.resolve(__dirname, 'temp_cookies.txt');
                        fs.writeFileSync(cookiePath, cookie.cookieText);

                        console.log('🟩 | [MusicHandler] Cookie carregado com sucesso.');

                        return [
                            '--cookies', cookiePath,
                            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
                        ];
                    } catch (error) {
                        console.error('🟥 | [MusicHandler] Erro ao carregar o cookie:', error);
                        return [];
                    }
                },
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
                .setColor(0x5865F2) // Azul
                .setDescription(`# 🎶 Tocando Agora\n\n**[${song.name}](${song.url})**\n\n- **Duração:** ${song.formattedDuration}\n- **Solicitado por:** ${song.user.tag}\n- **Plataforma:** ${song.source === 'youtube' ? 'YouTube' : 'Spotify'}`)
                .setImage(song.thumbnail);

            queue.textChannel?.send({ embeds: [embed] });
        })
        .on('queueEnd', async (queue) => {
            console.log('🟨 | [Music] Fila de músicas vazia. Movendo para o canal LILYTH_HOME_CHANNEL.');
            try {
                await client.distube.voices.leave(queue.voiceChannel);
                await connectToHomeChannel();
            } catch (error) {
                console.error('🟥 | [Music] Erro ao mover para o LILYTH_HOME_CHANNEL após a fila terminar:', error);
            }
        })
        .on('empty', async (queue) => {
            console.log('🟨 | [Music] Canal de voz vazio detectado. Movendo para o canal LILYTH_HOME_CHANNEL.');
            try {
                await client.distube.voices.leave(queue.voiceChannel);
                await connectToHomeChannel();
            } catch (error) {
                console.error('🟥 | [Music] Erro ao mover para o LILYTH_HOME_CHANNEL após o canal esvaziar:', error);
            }
        })
        .on('error', (channel, error) => {
            const embed = new EmbedBuilder()
                .setColor(0xED4245) // Vermelho
                .setDescription(`# ❌ Erro do Sistema de Música\n\n**Erro:** \`${error.message || 'Desconhecido'}\``);

            channel?.send?.({ embeds: [embed] }).catch(console.error);
        });

    // Conexão inicial ao LILYTH_HOME_CHANNEL
    client.once('ready', async () => {
        console.log('🟩 | [MusicHandler] Tentando conectar ao LILYTH_HOME_CHANNEL ao iniciar.');
        await connectToHomeChannel();
    });

    console.log('🟩 | [MusicHandler] DisTube configurado com sucesso!');
};