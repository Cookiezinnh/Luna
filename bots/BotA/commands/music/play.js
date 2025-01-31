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
            const errorMessage = 'O sistema de música não está configurado corretamente.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            const errorMessage = 'Você precisa estar em um canal de voz para usar este comando!';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        if (!voiceChannel.joinable) {
            const errorMessage = 'Eu não consigo entrar no canal de voz. Verifique minhas permissões!';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        const query = isInteraction
            ? context.options.getString('query')
            : args.join(' ');

        if (!query) {
            const errorMessage = 'Você precisa fornecer o nome ou URL de uma música para tocar!';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
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

            // Força o DisTube a usar diretamente a URL retornada pela API
            await distube.play(voiceChannel, videoUrl, { 
                member, 
                textChannel: context.channel, 
                skip: true, // Evita reprocessar o link com yt-dlp 
            });

            const successMessage = `🎶 Música adicionada à fila ou tocando agora: ${videoUrl}`;
            return isInteraction
                ? context.editReply({ content: successMessage })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('Erro ao tocar música:', error);

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erro ao Tocar Música')
                .setDescription(`Erro: ${error.message || 'Desconhecido.'}`);

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