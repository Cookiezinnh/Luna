const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joinvc')
        .setDescription('Faz o bot entrar em um canal de voz.')
        .addChannelOption(option =>
            option
                .setName('canal')
                .setDescription('Canal de voz para o bot entrar.')
        ),
    commandAlias: ['vcjoin','joinvoice'],
    requiredRoles: [], // Nenhuma restrição de cargo
    supportsPrefix: true, // Habilita suporte a prefixo
    async execute(interaction, args) {
        const isInteraction = interaction.isCommand?.();
        let canal;

        if (isInteraction) {
            canal = interaction.options.getChannel('canal') || interaction.member.voice.channel;
        } else {
            canal = args[0]
                ? interaction.guild.channels.cache.get(args[0].replace(/\D/g, ''))
                : interaction.member.voice.channel;
        }

        if (!canal || canal.type !== 2) { // Verifica se é um canal de voz
            return interaction.reply({
                content: '❌ Você deve especificar um canal de voz válido ou estar em um.',
                ephemeral: true,
            });
        }

        try {
            joinVoiceChannel({
                channelId: canal.id,
                guildId: canal.guild.id,
                adapterCreator: canal.guild.voiceAdapterCreator,
            });
            return interaction.reply({ content: `✅ Entrei no canal de voz: **${canal.name}**.` });
        } catch (error) {
            console.error('[JoinVC] Erro ao entrar no canal de voz:', error);
            return interaction.reply({
                content: '❌ Não foi possível entrar no canal de voz.',
                ephemeral: true,
            });
        }
    },
};