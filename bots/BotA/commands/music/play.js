const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { searchYouTube, cacheSearch, getCachedSearch } = require('../../utils/musicSearchCache');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Toca uma música em um canal de voz.')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('O nome ou URL da música para tocar.')
                .setRequired(true)
        ),
    requiredRoles: [], // Sem restrições de cargo por padrão
    supportsPrefix: true, // Habilita suporte a prefixo

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const { client, guild, member } = context;

        const distube = client.distube;
        if (!distube) {
            const errorMessage = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xED4245) // Vermelho
                        .setDescription('# ❌ Erro\n\nO sistema de música não está configurado corretamente.'),
                ],
                ephemeral: true,
            };
            return isInteraction
                ? context.reply(errorMessage)
                : context.channel.send(errorMessage);
        }

        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            const errorMessage = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xED4245) // Vermelho
                        .setDescription('# ❌ Erro\n\nVocê precisa estar em um canal de voz para usar este comando!'),
                ],
                ephemeral: true,
            };
            return isInteraction
                ? context.reply(errorMessage)
                : context.channel.send(errorMessage);
        }

        if (!voiceChannel.joinable) {
            const errorMessage = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xED4245) // Vermelho
                        .setDescription('# ❌ Erro\n\nEu não consigo entrar no canal de voz. Verifique minhas permissões!'),
                ],
                ephemeral: true,
            };
            return isInteraction
                ? context.reply(errorMessage)
                : context.channel.send(errorMessage);
        }

        const query = isInteraction
            ? context.options.getString('query')
            : args.join(' ');

        if (!query) {
            const errorMessage = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xED4245) // Vermelho
                        .setDescription('# ❌ Erro\n\nVocê precisa fornecer o nome ou URL de uma música para tocar!'),
                ],
                ephemeral: true,
            };
            return isInteraction
                ? context.reply(errorMessage)
                : context.channel.send(errorMessage);
        }

        try {
            if (isInteraction) {
                await context.deferReply();
            }

            let videoUrl = await getCachedSearch(query);
            if (!videoUrl) {
                videoUrl = await searchYouTube(query); // Usa a API do YouTube para buscar
                await cacheSearch(query, videoUrl); // Cacheia o resultado
            }

            // Verifica se o bot já está conectado ao canal de voz
            if (!distube.voices.get(voiceChannel.guild.id)) {
                await distube.voices.join(voiceChannel);
            }

            // Força o DisTube a usar diretamente a URL retornada pela API
            await distube.play(voiceChannel, videoUrl, { 
                member, 
                textChannel: context.channel, 
            });

            // Obtém a música adicionada à fila
            const queue = distube.getQueue(voiceChannel.guild.id);
            const song = queue.songs[queue.songs.length - 1]; // Última música adicionada

            const successMessage = {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x57F287) // Verde
                        .setDescription(`# ➕ Música Adicionada à Fila\n\n**[${song.name}](${song.url})**\n\n- **Duração:** ${song.formattedDuration}\n- **Adicionado por:** ${context.member.user.tag}\n- **Plataforma:** ${song.source === 'youtube' ? 'YouTube' : 'Spotify'}`)
                        .setImage(song.thumbnail),
                ],
            };

            return isInteraction
                ? context.editReply(successMessage)
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('Erro ao tocar música:', error);

            const embed = new EmbedBuilder()
                .setColor(0xED4245) // Vermelho
                .setDescription('# ❌ Erro\n\nNão foi possível tocar a música.');

            if (isInteraction) {
                if (context.replied || context.deferred) {
                    context.editReply({ embeds: [embed] });
                } else {
                    context.reply({ embeds: [embed], ephemeral: true });
                }
            } else {
                context.channel.send({ embeds: [embed] });
            }
        }
    },
};